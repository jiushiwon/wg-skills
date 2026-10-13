package com.example.pay.wechat.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.example.common.response.ApiResponse;
import com.example.pay.wechat.config.WechatPayConfig;
import com.example.pay.wechat.entity.WechatPayOrder;
import com.example.pay.wechat.enums.PayStatus;
import com.example.pay.wechat.enums.RefundStatus;
import com.example.pay.wechat.repository.WechatPayOrderRepository;
import com.example.pay.wechat.repository.WechatRefundOrderRepository;
import com.wechat.pay.java.core.notification.NotificationConfig;
import com.wechat.pay.java.core.notification.NotificationParser;
import com.wechat.pay.java.core.notification.RequestParam;
import com.wechat.pay.java.service.payments.jsapi.model.Transaction;
import com.wechat.pay.java.service.refund.model.RefundNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * 微信支付回调 + 退款回调
 *
 * 重要：
 * 1. 必须用 @RequestBody String body 接收原始 body（不能解析成对象）
 * 2. 必须读取 Wechatpay-* 头信息
 * 3. 必须用 NotificationParser 验签 + 解密
 * 4. 处理完后立即返回 200 + "SUCCESS"
 * 5. 业务逻辑尽量放异步，主流程不要超过 5 秒
 */
@Slf4j
@RestController
@RequestMapping("/api/wechat-pay")
@RequiredArgsConstructor
public class WechatPayNotifyController {

    private final NotificationConfig notificationConfig;
    private final WechatPayConfig payProperties;
    private final WechatPayOrderRepository orderRepository;
    private final WechatRefundOrderRepository refundRepository;

    /**
     * 支付回调
     */
    @PostMapping("/notify")
    @Transactional
    public String payNotify(
        @RequestHeader("Wechatpay-Timestamp") String timestamp,
        @RequestHeader("Wechatpay-Nonce") String nonce,
        @RequestHeader("Wechatpay-Serial") String serial,
        @RequestHeader("Wechatpay-Signature") String signature,
        @RequestBody String body
    ) {
        log.info("收到微信支付回调: {}", body);

        try {
            // 1. 验签 + 解密（SDK 一行搞定）
            NotificationParser parser = new NotificationParser(notificationConfig);
            RequestParam requestParam = new RequestParam.Builder()
                .serialNumber(serial)
                .nonce(nonce)
                .timestamp(timestamp)
                .signature(signature)
                .body(body)
                .build();

            Transaction transaction = parser.parse(requestParam, Transaction.class);
            log.info("微信回调验签通过: orderNo={}, transactionId={}",
                transaction.getOutTradeNo(), transaction.getTransactionId());

            // 2. 更新订单状态
            String orderNo = transaction.getOutTradeNo();
            String transactionId = transaction.getTransactionId();
            String tradeState = transaction.getTradeState();

            orderRepository.findByOrderNo(orderNo).ifPresent(order -> {
                if ("SUCCESS".equals(tradeState)) {
                    order.setStatus(PayStatus.PAID);
                    order.setTransactionId(transactionId);
                    order.setPaidAt(LocalDateTime.now());
                } else if ("CLOSED".equals(tradeState)) {
                    order.setStatus(PayStatus.CLOSED);
                } else if ("REFUND".equals(tradeState)) {
                    order.setStatus(PayStatus.REFUNDED);
                }
                orderRepository.save(order);
            });

            // 3. 业务扩展点（推荐放异步队列处理）
            // eventPublisher.publishEvent(new PaySuccessEvent(orderNo, transactionId));

            return successResponse();

        } catch (Exception e) {
            log.error("微信支付回调处理失败", e);
            return failResponse();
        }
    }

    /**
     * 退款回调
     */
    @PostMapping("/refund-notify")
    @Transactional
    public String refundNotify(
        @RequestHeader("Wechatpay-Timestamp") String timestamp,
        @RequestHeader("Wechatpay-Nonce") String nonce,
        @RequestHeader("Wechatpay-Serial") String serial,
        @RequestHeader("Wechatpay-Signature") String signature,
        @RequestBody String body
    ) {
        log.info("收到微信退款回调: {}", body);

        try {
            NotificationParser parser = new NotificationParser(notificationConfig);
            RequestParam requestParam = new RequestParam.Builder()
                .serialNumber(serial)
                .nonce(nonce)
                .timestamp(timestamp)
                .signature(signature)
                .body(body)
                .build();

            RefundNotification refundNotification = parser.parse(requestParam, RefundNotification.class);
            String refundNo = refundNotification.getOutRefundNo();
            String status = refundNotification.getRefundStatus();

            log.info("微信退款回调: refundNo={}, status={}", refundNo, status);

            refundRepository.findByRefundNo(refundNo).ifPresent(refund -> {
                if ("SUCCESS".equals(status)) {
                    refund.setStatus(RefundStatus.SUCCESS);
                    refund.setRefundedAt(LocalDateTime.now());
                } else {
                    refund.setStatus(RefundStatus.FAILED);
                }
                refundRepository.save(refund);
            });

            return successResponse();

        } catch (Exception e) {
            log.error("微信退款回调处理失败", e);
            return failResponse();
        }
    }

    private String successResponse() {
        // V3 回调要求返回 JSON 格式的 "code": "SUCCESS"
        return "{\"code\":\"SUCCESS\",\"message\":\"成功\"}";
    }

    private String failResponse() {
        return "{\"code\":\"FAIL\",\"message\":\"失败\"}";
    }
}
