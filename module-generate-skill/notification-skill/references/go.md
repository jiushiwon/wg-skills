# notification-skill — Go (Gin) 实现要点

骨架已有的（go-backend-skill 生成，**不要重写**）：`OK()/Fail()` 信封、全局异常、JWT 中间件、Redis。本模块只补通知业务层。错误码用闭集（见 backend-convention-skill response-format.md），不另列。

## 新增依赖

```bash
go get github.com/alibabacloud-go/dysmsapi-20170525/v4@latest   # 阿里云短信 SDK
go get github.com/alibabacloud-go/tea@latest                    # SDK 依赖
go get gopkg.in/gomail.v2@latest                                # 邮件
```

环境变量：`ALIYUN_ACCESS_KEY_ID`、`ALIYUN_ACCESS_KEY_SECRET`、`ALIYUN_SMS_SIGN_NAME`、`MAIL_HOST`、`MAIL_PORT`、`MAIL_USERNAME`、`MAIL_PASSWORD`、`APP_ENV`。

## 关键文件

| 文件 | 职责 |
|------|------|
| `internal/model/notify.go` | `NotifyTemplate` / `NotifyRecord` GORM 模型，字段见 domain-model.md |
| `internal/service/notify_service.go` | 对外接口 `SendSms(phone, templateCode, params)` / `SendEmail(to, templateCode, params)`：限流 + 落库(status=0) |
| `internal/sender/sms.go` | `SmsSender` 接口 + `AliyunSmsSender` / `LogSmsSender` |
| `internal/sender/email.go` | `EmailSender` 接口 + `SmtpEmailSender` / `LogEmailSender` |
| `internal/worker/notify_worker.go` | 定时 goroutine 扫 `status=0` 且到 `next_retry_at` 的记录发送 |
| `internal/handler/notify_handler.go` | 管理接口（templates/records/retry），返回裸数据由骨架 `OK()` 包信封 |

## 关键片段

### 阿里云短信最小封装

```go
type SmsSender interface {
	Send(ctx context.Context, phone, signName, templateCode string, params map[string]any) (string, error)
}

type AliyunSmsSender struct{ client *dysmsapi.Client }

func NewAliyunSmsSender(ak, sk string) (*AliyunSmsSender, error) {
	cfg := &openapi.Config{AccessKeyId: tea.String(ak), AccessKeySecret: tea.String(sk), Endpoint: tea.String("dysmsapi.aliyuncs.com")}
	c, err := dysmsapi.NewClient(cfg)
	if err != nil { return nil, err }
	return &AliyunSmsSender{client: c}, nil
}

func (s *AliyunSmsSender) Send(ctx context.Context, phone, signName, templateCode string, params map[string]any) (string, error) {
	b, _ := json.Marshal(params)
	req := &dysmsapi.SendSmsRequest{
		PhoneNumbers: tea.String(phone), SignName: tea.String(signName),
		TemplateCode: tea.String(templateCode), TemplateParam: tea.String(string(b)),
	}
	resp, err := s.client.SendSms(req)
	if err != nil {
		return "", &ProviderError{Code: "NETWORK", Msg: err.Error(), Retryable: true} // 网络类可重试
	}
	body := resp.Body
	if tea.StringValue(body.Code) != "OK" {
		return "", &ProviderError{Code: tea.StringValue(body.Code), Msg: tea.StringValue(body.Message), Retryable: retryable(tea.StringValue(body.Code))}
	}
	return tea.StringValue(body.BizId), nil // 落 provider_request_id
}

func retryable(code string) bool { // 限流/系统忙可重试；签名/模板未审核等业务错误不可重试
	return code == "isv.BUSINESS_LIMIT_CONTROL" || code == "Throttling" || code == "ServiceUnavailable"
}
```

### NotifyService.SendSms（限流 + 落库 + 异步投递）

```go
func (s *NotifyService) SendSms(ctx context.Context, phone, templateCode string, params map[string]any) (int64, error) {
	var tpl model.NotifyTemplate
	if err := s.db.Where("code = ? AND status = 1", templateCode).First(&tpl).Error; err != nil {
		return 0, &BizError{Code: -1004, Msg: "短信模板不存在或已停用"}
	}
	if tpl.Channel != "sms" { return 0, &BizError{Code: -1001, Msg: "模板渠道不匹配"} }
	// 限流（复用 auth-skill 约定键）
	if ok, _ := s.rdb.Exists(ctx, "sms:limit:"+phone).Result(); ok > 0 {
		return 0, &BizError{Code: -1006, Msg: "发送过于频繁，请 60 秒后重试"}
	}
	daily, _ := s.rdb.Incr(ctx, "sms:daily:"+phone).Result()
	if daily == 1 { s.rdb.Expire(ctx, "sms:daily:"+phone, 24*time.Hour) }
	if daily > 10 { return 0, &BizError{Code: -1006, Msg: "今日发送次数已达上限"} }
	s.rdb.Set(ctx, "sms:limit:"+phone, 1, 60*time.Second)
	// 落库（status=0 待发送），立即返回；真正发送交给 worker
	rec := model.NotifyRecord{Channel: "sms", Target: phone, TemplateCode: templateCode,
		Params: toJSON(params), Provider: "aliyun", Status: 0, RetryCount: 0}
	if err := s.db.Create(&rec).Error; err != nil { return 0, err }
	return rec.ID, nil
}
```

### 定时扫表发送 worker（无队列降级）

```go
func (w *NotifyWorker) Run(ctx context.Context) {
	tick := time.NewTicker(15 * time.Second)
	for {
		select {
		case <-ctx.Done(): return
		case <-tick.C: w.dispatch(ctx)
		}
	}
}

func (w *NotifyWorker) dispatch(ctx context.Context) {
	var list []model.NotifyRecord
	w.db.Where("status = 0 AND (next_retry_at IS NULL OR next_retry_at <= ?)", time.Now()).Limit(50).Find(&list)
	for _, rec := range list {
		reqID, err := w.send(ctx, &rec) // 按 channel 分发到 sms/email sender
		if err == nil {
			rec.Status, rec.ProviderRequestID, rec.SentAt, rec.ErrorMsg = 1, reqID, ptr(time.Now()), ""
		} else if pe, ok := err.(*ProviderError); ok && pe.Retryable && rec.RetryCount < 3 {
			rec.RetryCount++
			rec.NextRetryAt = ptr(time.Now().Add(backoff(rec.RetryCount))) // 1/5/15 min
			rec.ErrorMsg = pe.Msg
		} else {
			rec.Status, rec.ErrorMsg = 2, err.Error() // 终态失败：业务错误或已达上限
		}
		w.db.Save(&rec)
	}
}

func backoff(n int) time.Duration { return []time.Duration{time.Minute, 5 * time.Minute, 15 * time.Minute}[n-1] }
```

### SMTP 发送封装（gomail）

```go
func (s *SmtpEmailSender) Send(ctx context.Context, to, subjectTpl, contentTpl string, params map[string]any) (string, error) {
	m := gomail.NewMessage()
	m.SetHeader("From", s.from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", render(subjectTpl, params)) // {{var}} 替换
	m.SetBody("text/html", render(contentTpl, params))
	d := gomail.NewDialer(s.host, s.port, s.username, s.password)
	if err := d.DialAndSend(m); err != nil {
		return "", &ProviderError{Code: "SMTP", Msg: err.Error(), Retryable: true} // SMTP 瞬时错误可重试
	}
	return m.GetHeader("Message-Id")[0], nil
}
```

## 坑位

- **SDK 异常与可重试**：`SendSms` 返回的 `err`（tea 网络层错误）与 `body.Code != "OK"` 分开处理。`isv.BUSINESS_LIMIT_CONTROL`/`Throttling`/`ServiceUnavailable` 可重试；`isv.SMS_SIGNATURE_ILLEGAL`、`isv.SMS_TEMPLATE_ILLEGAL`、`isv.MOBILE_NUMBER_ILLEGAL`、`isv.OUT_OF_SERVICE` 属业务错误，**置失败不重试**。
- **签名/模板需先在阿里云控制台审核通过**，否则报 `SMS_SIGNATURE_ILLEGAL`/`SMS_TEMPLATE_ILLEGAL`；这是环境配置问题，别在代码里绕。
- **LogSender 由 `APP_ENV` 切换**：`NewSender()` 按 `APP_ENV` 返回 Log 或真实实现，避免开发期真发。
- **worker 防并发重复发送**：多实例部署时扫表加行锁（`SELECT ... FOR UPDATE SKIP LOCKED`）或单实例跑 worker，避免同一记录被两个 worker 同时发导致重复计费。
- **gomail 连接**：`DialAndSend` 每次新建连接，高频发送用 `SendCloser` 复用连接；生产设置超时。
