# auth-skill — Go (Gin) 实现要点

骨架已有的（go-backend-skill 生成，**不要重写**）：JWT 签发/验证中间件、`OK()/Fail()` 信封、当前用户注入、配置加载。本模块只补登录业务层。

## 新增依赖

```bash
go get golang.org/x/crypto@latest        # bcrypt
go get github.com/redis/go-redis/v9@latest
go get github.com/google/uuid@latest
# 内置阿里云短信时（接 notification-skill 或不发真实短信可省）：
go get github.com/alibabacloud-go/dysmsapi20170525/v4@latest
go get github.com/alibabacloud-go/tea-openapi/v2@latest
```

## 配置（`internal/config/config.go` 追加）

```go
AliyunAccessKeyID     string `env:"ALIYUN_ACCESS_KEY_ID"`
AliyunAccessKeySecret string `env:"ALIYUN_ACCESS_KEY_SECRET"`
SMSRegionID           string `env:"SMS_REGION_ID" envDefault:"cn-hangzhou"`
SMSSignName           string `env:"SMS_SIGN_NAME"`
SMSTemplateCode       string `env:"SMS_TEMPLATE_CODE"`
WechatMiniappAppid    string `env:"WECHAT_MINIAPP_APPID"`   // 选 uniapp 时
WechatMiniappSecret   string `env:"WECHAT_MINIAPP_SECRET"`  // 选 uniapp 时
CaptchaEnabled        bool   `env:"CAPTCHA_ENABLED" envDefault:"false"`
```

## 关键文件

| 文件 | 职责 |
|------|------|
| `internal/model/user.go` | `User` / `RefreshToken`（选 uniapp 加 `OpenID`）/（接 oauth 加 `OauthAccount`）GORM 模型，字段见 domain-model.md |
| `internal/service/auth_service.go` | 注册/登录/短信登录/刷新/登出/找回重置 |
| `internal/service/sms_code_service.go` | 验证码生成/限流；发送通道注入 `SmsSender` |
| `internal/service/captcha_service.go` | 图形验证码（算术题 SVG + Redis 存答案），开图形码时 |
| `internal/service/sms_sender.go` | `SmsSender` 接口 + `AliyunSmsSender` + `LogSmsSender`（dev） |
| `internal/service/wx_service.go` | uniapp 微信登录：jscode2session 换 openid、解析手机号，选 uniapp 时 |
| `internal/handler/auth_handler.go` | 全部接口，参数绑定校验 + 调 service，返回裸数据（骨架 `OK()` 包信封） |
| `internal/handler/user_handler.go` | `/api/user/*` 资料管理接口（开资料管理时），参数校验 + 调 service |

## 关键片段

### 双令牌签发

```go
func (s *AuthService) issueTokens(user *model.User) (*TokenPair, error) {
	jti := uuid.NewString()
	access, err := s.jwt.Sign(user.ID, jti, 2*time.Hour) // 骨架已有，补 jti
	if err != nil { return nil, err }
	refresh := strings.ReplaceAll(uuid.NewString()+uuid.NewString(), "-", "")
	sum := sha256.Sum256([]byte(refresh))
	row := &model.RefreshToken{
		UserID: user.ID, TokenHash: hex.EncodeToString(sum[:]), JTI: jti,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	}
	if err := s.db.Create(row).Error; err != nil { return nil, err }
	return &TokenPair{AccessToken: access, RefreshToken: refresh, ExpiresIn: 7200}, nil
}
```

### 刷新（轮换 + 重放检测）

```go
func (s *AuthService) Refresh(refreshToken string) (*TokenPair, error) {
	sum := sha256.Sum256([]byte(refreshToken))
	hash := hex.EncodeToString(sum[:])
	var pair *TokenPair
	err := s.db.Transaction(func(tx *gorm.DB) error { // FOR UPDATE 必须在事务内才持锁
		var old model.RefreshToken
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}). // SELECT ... FOR UPDATE 行锁防并发双换
			Where("token_hash = ?", hash).First(&old).Error; err != nil {
			return &BizError{Code: -1002, Msg: "refresh token 无效"}
		}
		if old.Revoked || time.Now().After(old.ExpiresAt) {
			tx.Model(&model.RefreshToken{}).Where("user_id = ?", old.UserID).Update("revoked", true) // 重放：全量吊销
			return &BizError{Code: -1002, Msg: "refresh token 已失效，请重新登录"}
		}
		var user model.User
		if err := tx.First(&user, old.UserID).Error; err != nil {
			return &BizError{Code: -1002, Msg: "用户不存在"}
		}
		if user.Status != 1 { return &BizError{Code: -1002, Msg: "账号已禁用"} }
		if err := tx.Model(&old).Update("revoked", true).Error; err != nil { return err } // 旧行作废
		p, err := s.issueTokensTx(tx, &user)                                              // 同事务插新行
		if err != nil { return err }
		pair = p
		return nil
	})
	return pair, err
}
```

### 图形验证码（算术题 SVG）

```go
func (s *CaptchaService) Make(ctx context.Context) (map[string]string, error) {
	randInt := func(max int64) int { n, _ := cryptoRand.Int(cryptoRand.Reader, big.NewInt(max)); return int(n.Int64()) }
	a, b := randInt(9)+1, randInt(9)+1                  // 1~9，crypto/rand 禁 math/rand
	ops := []string{"+", "-", "*"}
	op := ops[randInt(3)]
	if op == "-" && b > a { a, b = b, a }             // 减法保证非负
	var ans int
	switch op { case "+": ans = a + b; case "-": ans = a - b; default: ans = a * b }
	id := strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := s.rdb.Set(ctx, "captcha:"+id, strconv.Itoa(ans), 5*time.Minute).Err(); err != nil { return nil, err }
	svg := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">`+
		`<rect width="120" height="40" fill="#f5f5f5"/>`+
		`<text x="12" y="27" font-size="20" fill="#333">%d %s %d = ?</text></svg>`, a, op, b)
	return map[string]string{"captchaId": id, "svg": svg}, nil
}

func (s *CaptchaService) Check(ctx context.Context, id, answer string) error {
	key := "captcha:" + id
	val, err := s.rdb.GetDel(ctx, key).Result()       // 取出即删，一次性
	if err != nil || val != strings.TrimSpace(answer) {
		return &BizError{Code: -1001, Msg: "图形验证码错误"}
	}
	return nil
}
```

### 短信验证码限流（Redis）

```go
// 限流+当日配额：对所有手机号一致执行（供 forgot-password 复用，防枚举预言机）
func (s *SmsCodeService) ConsumeQuota(ctx context.Context, phone string) error {
	if ok, _ := s.rdb.Exists(ctx, "sms:limit:"+phone).Result(); ok > 0 {
		return &BizError{Code: -1006, Msg: "发送过于频繁，请 60 秒后重试"}
	}
	daily, _ := s.rdb.Incr(ctx, "sms:daily:"+phone).Result()
	if daily == 1 { s.rdb.Expire(ctx, "sms:daily:"+phone, 24*time.Hour) }
	if daily > 10 { return &BizError{Code: -1006, Msg: "今日发送次数已达上限"} }
	return nil
}

// 登录/注册入口：先过配额再真发
func (s *SmsCodeService) SendCode(ctx context.Context, phone, scene string) error {
	if err := s.ConsumeQuota(ctx, phone); err != nil { return err }
	return s.generateAndSend(ctx, phone, scene)
}

func (s *SmsCodeService) generateAndSend(ctx context.Context, phone, scene string) error {
	n, _ := cryptoRand.Int(cryptoRand.Reader, big.NewInt(1000000)) // crypto/rand，禁 math/rand
	code := fmt.Sprintf("%06d", n.Int64())
	if err := s.sender.Send(ctx, phone, code); err != nil { // 先发送；Aliyun 或 dev LogSender，已接 notification-skill 则委托
		s.rdb.Decr(ctx, "sms:daily:"+phone)                  // 发送失败回退当日配额，不写限流键
		return err
	}
	// 发送成功才落验证码（按场景分键）与 60s 限流键
	s.rdb.Set(ctx, "sms:code:"+scene+":"+phone, code, 5*time.Minute)
	s.rdb.Set(ctx, "sms:limit:"+phone, 1, 60*time.Second)
	return nil
}
```

### 短信 Sender（内置最小阿里云 + dev 日志）

```go
type SmsSender interface { Send(ctx context.Context, phone, code string) error }

type LogSmsSender struct{} // APP_ENV=dev，不真发
func (LogSmsSender) Send(ctx context.Context, phone, code string) error {
	log.Printf("[dev-sms] phone=%s code=%s", phone, code); return nil
}

type AliyunSmsSender struct {
	client *dysmsapi.Client
	sign, tpl string
}

func NewAliyunSmsSender(cfg *config.Config) (*AliyunSmsSender, error) {
	c, err := dysmsapi.NewClient(&openapi.Config{
		AccessKeyId: tea.String(cfg.AliyunAccessKeyID),
		AccessKeySecret: tea.String(cfg.AliyunAccessKeySecret),
		Endpoint: tea.String("dysmsapi." + cfg.SMSRegionID + ".aliyuncs.com"),
	})
	if err != nil { return nil, err }
	return &AliyunSmsSender{client: c, sign: cfg.SMSSignName, tpl: cfg.SMSTemplateCode}, nil
}

func (s *AliyunSmsSender) Send(ctx context.Context, phone, code string) error {
	resp, err := s.client.SendSms(&dysmsapi.SendSmsRequest{
		PhoneNumbers: tea.String(phone), SignName: tea.String(s.sign),
		TemplateCode: tea.String(s.tpl), TemplateParam: tea.String(`{"code":"` + code + `"}`),
	})
	if err != nil || tea.StringValue(resp.Body.Code) != "OK" {
		return &BizError{Code: -2000, Msg: "短信发送失败"}
	}
	return nil
}
```

### 密码找回 / 重置

```go
func (s *AuthService) ForgotPassword(ctx context.Context, phone string) error {
	if err := s.smsCode.ConsumeQuota(ctx, phone); err != nil { return err } // 限流对所有手机号一致执行（防枚举预言机）
	var u model.User
	if err := s.db.Where("phone = ?", phone).First(&u).Error; err == nil {
		return s.smsCode.generateAndSend(ctx, phone, "reset") // 仅已注册真发
	}
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, phone, code, newPassword string) error {
	key := "sms:code:reset:" + phone                        // 按场景取码
	saved, err := s.rdb.GetDel(ctx, key).Result()        // 一次性
	if err != nil || saved != code { return &BizError{Code: -1002, Msg: "验证码错误或已过期"} }
	var u model.User
	if err := s.db.Where("phone = ?", phone).First(&u).Error; err != nil {
		return &BizError{Code: -1002, Msg: "验证码错误或已过期"} // 不泄露是否注册
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(newPassword), 10)
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&u).Update("password_hash", string(hash)).Error; err != nil { return err }
		return tx.Model(&model.RefreshToken{}).Where("user_id = ?", u.ID).Update("revoked", true).Error // 吊销全部 refresh
	})
}
```

### uniapp 微信小程序登录（jscode2session + 解析手机号）

```go
func (s *WxService) codeToOpenID(ctx context.Context, code string) (string, error) {
	var resp struct {
		OpenID string `json:"openid"`
		ErrMsg string `json:"errmsg"`
	}
	url := "https://api.weixin.qq.com/sns/jscode2session?appid=" + s.appid +
		"&secret=" + s.secret + "&js_code=" + code + "&grant_type=authorization_code"
	if err := getJSON(ctx, url, &resp); err != nil { return "", err }
	if resp.OpenID == "" { return "", &BizError{Code: -1002, Msg: "微信登录失败"} }
	return resp.OpenID, nil // session_key 不下发、不落库
}

func (s *WxService) resolvePhone(ctx context.Context, accessToken, phoneCode string) (string, error) {
	var resp struct {
		PhoneInfo struct{ PhoneNumber string `json:"phoneNumber"` } `json:"phone_info"`
	}
	url := "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + accessToken
	if err := postJSON(ctx, url, map[string]string{"code": phoneCode}, &resp); err != nil { return "", err }
	if resp.PhoneInfo.PhoneNumber == "" { return "", &BizError{Code: -1002, Msg: "手机号解析失败"} }
	return resp.PhoneInfo.PhoneNumber, nil
}

func (s *AuthService) WxLogin(ctx context.Context, code, phoneCode string) (*TokenPair, error) {
	openid, err := s.wx.codeToOpenID(ctx, code)
	if err != nil { return nil, err }
	var u model.User
	if phoneCode != "" { // 解析手机号模式
		token, err := s.wx.accessToken(ctx) // 带缓存，见坑位
		if err != nil { return nil, err }
		phone, err := s.wx.resolvePhone(ctx, token, phoneCode)
		if err != nil { return nil, err }
		if err := s.db.Where("phone = ?", phone).First(&u).Error; err != nil {
			u = model.User{Phone: phone, OpenID: openid}
			if err := s.db.Create(&u).Error; err != nil { return nil, err }
		} else if u.OpenID == "" { // 命中老用户回写绑定 open_id
			s.db.Model(&u).Update("open_id", openid)
		}
	} else { // 仅 openid 模式
		if err := s.db.Where("open_id = ?", openid).First(&u).Error; err != nil {
			u = model.User{OpenID: openid}
			if err := s.db.Create(&u).Error; err != nil { return nil, err }
		}
	}
	return s.issueTokens(&u)
}
```

### 密码

```go
hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
```

### 资料管理（profile / 改密 / 换绑手机 / 注销）

```go
func (s *AuthService) UpdateProfile(userID uint, nickname, avatar *string) (*model.User, error) {
	if (nickname == nil || *nickname == "") && (avatar == nil || *avatar == "") {
		return nil, &BizError{Code: -1001, Msg: "至少修改一项"}
	}
	var u model.User
	if err := s.db.First(&u, userID).Error; err != nil { return nil, &BizError{Code: -1004, Msg: "用户不存在"} }
	if nickname != nil && *nickname != "" { u.Nickname = *nickname }
	if avatar != nil && *avatar != "" { u.Avatar = *avatar }
	if err := s.db.Save(&u).Error; err != nil { return nil, err }
	return &u, nil
}

// 改密：校验旧密码 → 设新密码 → 吊销其他设备 refresh（保留当前 jti 会话）
func (s *AuthService) ChangePassword(userID uint, currentJTI, oldPassword, newPassword string) error {
	var u model.User
	if err := s.db.First(&u, userID).Error; err != nil { return &BizError{Code: -1004, Msg: "用户不存在"} }
	if u.PasswordHash == "" || bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(oldPassword)) != nil {
		return &BizError{Code: -1002, Msg: "旧密码错误"}
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(newPassword), 10)
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&u).Update("password_hash", string(hash)).Error; err != nil { return err }
		return tx.Model(&model.RefreshToken{}).
			Where("user_id = ? AND jti <> ?", userID, currentJTI).Update("revoked", true).Error // 保留当前会话
	})
}

// 换绑手机：校验新号短信验证码(scene=bind) → 唯一冲突 -1005 → 绑定
func (s *AuthService) BindPhone(ctx context.Context, userID uint, phone, code string) (*model.User, error) {
	saved, err := s.rdb.GetDel(ctx, "sms:code:bind:"+phone).Result()
	if err != nil || saved != code { return nil, &BizError{Code: -1002, Msg: "验证码错误或已过期"} }
	var cnt int64
	s.db.Model(&model.User{}).Where("phone = ?", phone).Count(&cnt)
	if cnt > 0 { return nil, &BizError{Code: -1005, Msg: "该手机号已被绑定"} }
	var u model.User
	if err := s.db.First(&u, userID).Error; err != nil { return nil, &BizError{Code: -1004, Msg: "用户不存在"} }
	if err := s.db.Model(&u).Update("phone", phone).Error; err != nil { return nil, err }
	return &u, nil
}

// 注销：二次确认（密码或短信验证码 scene=login）→ status=0 → 吊销全部 token + 拉黑当前 access
func (s *AuthService) Deactivate(ctx context.Context, userID uint, currentJTI, password, code string) error {
	var u model.User
	if err := s.db.First(&u, userID).Error; err != nil { return &BizError{Code: -1004, Msg: "用户不存在"} }
	ok := password != "" && u.PasswordHash != "" &&
		bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) == nil
	if !ok && code != "" && u.Phone != "" {
		saved, err := s.rdb.GetDel(ctx, "sms:code:login:"+u.Phone).Result()
		ok = err == nil && saved == code
	}
	if !ok { return &BizError{Code: -1002, Msg: "确认信息错误"} }
	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&u).Update("status", 0).Error; err != nil { return err }
		return tx.Model(&model.RefreshToken{}).Where("user_id = ?", userID).Update("revoked", true).Error
	}); err != nil { return err }
	s.rdb.Set(ctx, "token:blacklist:"+currentJTI, 1, 2*time.Hour) // 拉黑当前 access
	return nil
}
```

## 坑位

- 验证码/图形码随机数一律用 `crypto/rand`，禁止 `math/rand`（可预测）。
- JWT 中间件补两条校验：`status == 1`、黑名单 `token:blacklist:{jti}`（如启用）。
- 刷新必须走事务（`db.Transaction`）且 `issueTokensTx` 用传入的 `tx`：先 `SELECT ... FOR UPDATE` 锁住旧行再判断 revoked，防并发双换。
- 登录失败计数 `login:fail:{id}`：失败时 `Incr`（首次设 15min TTL，≥5 锁定），**登录成功后必须 `Del` 重置**，避免成功后仍被旧计数锁定。
- 短信码按场景分键 `sms:code:{scene}:{phone}`；限流 `sms:limit`/`sms:daily` 按手机号共享。发送顺序：先 `ConsumeQuota`、`Send` 成功才写验证码与限流键，失败 `Decr` 回退当日计数。`forgot-password` 对所有手机号都先 `ConsumeQuota` 再按注册与否决定是否真发（防枚举）。
- 唯一索引冲突捕获 `mysql.ErrMsgDuplicateEntry` / pg `23505` 转 `-1005`，别先查后插。
- handler 一律返回裸数据由骨架 `OK()/Fail()` 包信封，禁止 `c.JSON` 手写业务响应。
- 图形验证码/短信码用 `GetDel` 保证一次性；不要 `Get` 后再 `Del`。
- 微信 `access_token` 全小程序共享且有频率限制：`GET /cgi-bin/token` 换取后缓存至过期（约 7200s），不要每次现取；`session_key` 仅服务端用。
- 已接 notification-skill 时**委托**它的 `sendSms`，不要在本模块重复实现阿里云调用。
