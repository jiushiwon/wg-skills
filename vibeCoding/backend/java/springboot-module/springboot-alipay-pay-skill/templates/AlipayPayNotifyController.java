package com.example.pay.alipay.controller;

import com.alipay.api.AlipayApiException;
import com.alipay.api.internal.util.AlipaySignature;
import com.example.pay.alipay.config.AlipayPayConfig;
import com.example.pay.alipay.entity.AlipayPayOrder;
import com.example.pay.alipay.enums.PayStatus;
import com.example.pay.alipay.repository.AlipayPayOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * 支付宝回调通知控制器
 * - /api/alipay/notify      支付成功回调
 * - /api/alipay/refund-notify 退款回调（部分接口）
 */
@Slf4j
@RestController
@RequestMapping("/api/alipay")
@RequiredArgsConstructor
public class AlipayPayNotifyController {

    private final AlipayPayConfig config;
    private final AlipayPayOrderRepository orderRepository;

    /**
     * 支付成功异步通知
     * 必须返回纯文本 "success"（小写无空格），否则支付宝会重试 24 小时
     */
    @PostMapping("/notify")
    public String notify(HttpServletRequest request) throws AlipayApiException {
        Map<String, String> params = convertRequestParamsToMap(request);

        // 1. 验签（关键步骤）
        boolean signVerified = AlipaySignature.rsaCheckV1(
            params,
            config.getAlipayPublicKey(),
            config.getCharset(),
            config.getSignType()
        );

        if (!signVerified) {
            log.error("支付宝回调验签失败，params={}", params);
            return "fail";
        }

        // 2. 业务处理
        String orderNo = params.get("out_trade_no");
        String tradeNo = params.get("trade_no");
        String tradeStatus = params.get("trade_status");
        String totalAmount = params.get("total_amount");

        log.info("收到支付宝回调: orderNo={}, tradeNo={}, tradeStatus={}, totalAmount={}",
            orderNo, tradeNo, tradeStatus, totalAmount);

        AlipayPayOrder order = orderRepository.findByOrderNo(orderNo).orElse(null);
        if (order == null) {
            log.warn("订单不存在: {}", orderNo);
            return "success";  // 找不到也返回 success，避免重复通知
        }

        // 3. 状态流转
        if ("TRADE_SUCCESS".equals(tradeStatus) || "TRADE_FINISHED".equals(tradeStatus)) {
            order.setStatus(PayStatus.PAID);
            order.setTradeNo(tradeNo);
            order.setPaidAt(LocalDateTime.now());
        } else if ("TRADE_CLOSED".equals(tradeStatus)) {
            order.setStatus(PayStatus.CLOSED);
        }
        orderRepository.save(order);

        // 4. 返回 success
        return "success";
    }

    private Map<String, String> convertRequestParamsToMap(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (Iterator<String> iter = requestParams.keySet().iterator(); iter.hasNext(); ) {
            String name = iter.next();
            String[] values = requestParams.get(name);
            String valueStr = "";
            for (int i = 0; i < values.length; i++) {
                valueStr = (i == values.length - 1) ? valueStr + values[i] : valueStr + values[i] + ",";
            }
            params.put(name, valueStr);
        }
        return params;
    }
}
