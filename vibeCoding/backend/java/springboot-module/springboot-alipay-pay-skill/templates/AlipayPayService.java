package com.example.pay.alipay.service;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.*;
import com.alipay.api.request.*;
import com.alipay.api.response.*;
import com.example.common.exception.BusinessException;
import com.example.pay.alipay.config.AlipayPayConfig;
import com.example.pay.alipay.dto.*;
import com.example.pay.alipay.entity.AlipayPayOrder;
import com.example.pay.alipay.entity.AlipayRefundOrder;
import com.example.pay.alipay.enums.PayScene;
import com.example.pay.alipay.enums.PayStatus;
import com.example.pay.alipay.enums.RefundStatus;
import com.example.pay.alipay.repository.AlipayPayOrderRepository;
import com.example.pay.alipay.repository.AlipayRefundOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 支付宝支付核心服务（全场景合一）
 * 注意：金额单位为"元"（BigDecimal），与微信支付的"分"不同
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlipayPayService {

    private final AlipayPayConfig config;
    private final AlipayPayOrderRepository orderRepository;
    private final AlipayRefundOrderRepository refundRepository;

    private AlipayClient client;

    private AlipayClient getClient() {
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    client = new DefaultAlipayClient(
                        config.getGatewayUrl(),
                        config.getAppId(),
                        config.getPrivateKey(),
                        "json",
                        "UTF-8",
                        config.getAlipayPublicKey(),
                        "RSA2"
                    );
                }
            }
        }
        return client;
    }

    // ============== 统一下单 ==============

    /** 当面付（生成二维码） */
    public PrecreateResponse precreate(PrecreateRequest req) {
        if (orderRepository.existsByOrderNo(req.getOrderNo())) {
            throw new BusinessException(-3004, "订单号已存在");
        }

        try {
            AlipayTradePrecreateRequest request = new AlipayTradePrecreateRequest();
            request.setNotifyUrl(config.getNotifyUrl());

            AlipayTradePrecreateModel model = new AlipayTradePrecreateModel();
            model.setOutTradeNo(req.getOrderNo());
            model.setTotalAmount(req.getAmount().toString());
            model.setSubject(req.getSubject());

            request.setBizModel(model);

            AlipayTradePrecreateResponse response = getClient().execute(request);
            if (!response.isSuccess()) {
                throw new BusinessException(-3001, "预创建失败: " + response.getSubMsg());
            }

            // 持久化
            AlipayPayOrder order = new AlipayPayOrder();
            order.setOrderNo(req.getOrderNo());
            order.setScene(PayScene.PRECREATE);
            order.setAmount(req.getAmount());
            order.setSubject(req.getSubject());
            order.setQrCode(response.getQrCode());
            order.setStatus(PayStatus.PENDING);
            orderRepository.save(order);

            return new PrecreateResponse(response.getQrCode());

        } catch (AlipayApiException e) {
            log.error("当面付预创建失败", e);
            throw new BusinessException(-3001, "支付宝调用失败: " + e.getMessage());
        }
    }

    /** 手机网站支付（返回 form） */
    public String wapPay(WapPayRequest req) {
        try {
            AlipayTradeWapPayRequest request = new AlipayTradeWapPayRequest();
            request.setReturnUrl(config.getReturnUrl());
            request.setNotifyUrl(config.getNotifyUrl());

            AlipayTradeWapPayModel model = new AlipayTradeWapPayModel();
            model.setOutTradeNo(req.getOrderNo());
            model.setTotalAmount(req.getAmount().toString());
            model.setSubject(req.getSubject());
            model.setProductCode("QUICK_WAP_WAY");
            request.setBizModel(model);

            persistOrder(req.getOrderNo(), PayScene.WAP, req.getAmount(), req.getSubject());

            return getClient().pageExecute(request).getBody();

        } catch (AlipayApiException e) {
            log.error("WAP 支付失败", e);
            throw new BusinessException(-3001, "WAP 支付失败: " + e.getMessage());
        }
    }

    /** PC 网站支付（页面跳转） */
    public String pagePay(PagePayRequest req) {
        try {
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            request.setReturnUrl(config.getReturnUrl());
            request.setNotifyUrl(config.getNotifyUrl());

            AlipayTradePagePayModel model = new AlipayTradePagePayModel();
            model.setOutTradeNo(req.getOrderNo());
            model.setTotalAmount(req.getAmount().toString());
            model.setSubject(req.getSubject());
            model.setProductCode("FAST_INSTANT_TRADE_PAY");
            request.setBizModel(model);

            persistOrder(req.getOrderNo(), PayScene.PAGE, req.getAmount(), req.getSubject());

            return getClient().pageExecute(request).getBody();

        } catch (AlipayApiException e) {
            log.error("PC 支付失败", e);
            throw new BusinessException(-3001, "PC 支付失败: " + e.getMessage());
        }
    }

    /** App 支付（返回 orderStr） */
    public String appPay(AppPayRequest req) {
        try {
            AlipayTradeAppPayRequest request = new AlipayTradeAppPayRequest();
            request.setNotifyUrl(config.getNotifyUrl());

            AlipayTradeAppPayModel model = new AlipayTradeAppPayModel();
            model.setOutTradeNo(req.getOrderNo());
            model.setTotalAmount(req.getAmount().toString());
            model.setSubject(req.getSubject());
            model.setProductCode("QUICK_MSECURITY_PAY");
            request.setBizModel(model);

            persistOrder(req.getOrderNo(), PayScene.APP, req.getAmount(), req.getSubject());

            // 注意：App 支付用 sdkExecute，不是 pageExecute
            return getClient().sdkExecute(request).getBody();

        } catch (AlipayApiException e) {
            log.error("App 支付失败", e);
            throw new BusinessException(-3001, "App 支付失败: " + e.getMessage());
        }
    }

    // ============== 退款 ==============

    @Transactional
    public RefundResponse refund(RefundRequest req) {
        AlipayPayOrder order = orderRepository.findByOrderNo(req.getOrderNo())
            .orElseThrow(() -> new BusinessException(-3003, "原订单不存在"));

        if (order.getStatus() != PayStatus.PAID) {
            throw new BusinessException(-3005, "订单未支付，无法退款");
        }
        if (req.getRefundAmount().compareTo(order.getAmount()) > 0) {
            throw new BusinessException(-3005, "退款金额超过原单金额");
        }

        AlipayRefundOrder refundOrder = new AlipayRefundOrder();
        refundOrder.setRefundNo(req.getRefundNo());
        refundOrder.setOrderNo(req.getOrderNo());
        refundOrder.setRefundAmount(req.getRefundAmount());
        refundOrder.setTotalAmount(order.getAmount());
        refundOrder.setReason(req.getReason());
        refundOrder.setStatus(RefundStatus.PENDING);
        refundRepository.save(refundOrder);

        try {
            AlipayTradeRefundRequest request = new AlipayTradeRefundRequest();
            AlipayTradeRefundModel model = new AlipayTradeRefundModel();
            model.setOutTradeNo(req.getOrderNo());
            model.setOutRequestNo(req.getRefundNo());
            model.setRefundAmount(req.getRefundAmount().toString());
            model.setTotalAmount(order.getAmount().toString());
            model.setRefundReason(req.getReason());
            request.setBizModel(model);

            AlipayTradeRefundResponse response = getClient().execute(request);
            if (!response.isSuccess()) {
                refundOrder.setStatus(RefundStatus.FAILED);
                refundRepository.save(refundOrder);
                throw new BusinessException(-3005, "退款失败: " + response.getSubMsg());
            }

            return new RefundResponse(req.getRefundNo(), "PROCESSING");

        } catch (AlipayApiException e) {
            log.error("退款异常", e);
            refundOrder.setStatus(RefundStatus.FAILED);
            refundRepository.save(refundOrder);
            throw new BusinessException(-3005, "退款异常: " + e.getMessage());
        }
    }

    // ============== 查询 / 关单 ==============

    public AlipayPayOrder queryOrder(String orderNo) {
        return orderRepository.findByOrderNo(orderNo)
            .orElseThrow(() -> new BusinessException(-3003, "订单不存在"));
    }

    public void closeOrder(String orderNo) {
        AlipayPayOrder order = orderRepository.findByOrderNo(orderNo)
            .orElseThrow(() -> new BusinessException(-3003, "订单不存在"));

        try {
            AlipayTradeCloseRequest request = new AlipayTradeCloseRequest();
            AlipayTradeCloseModel model = new AlipayTradeCloseModel();
            model.setOutTradeNo(orderNo);
            request.setBizModel(model);

            AlipayTradeCloseResponse response = getClient().execute(request);
            if (response.isSuccess()) {
                order.setStatus(PayStatus.CLOSED);
                orderRepository.save(order);
            } else {
                throw new BusinessException(-3006, "关单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            throw new BusinessException(-3006, "关单异常: " + e.getMessage());
        }
    }

    private void persistOrder(String orderNo, PayScene scene, BigDecimal amount, String subject) {
        if (orderRepository.existsByOrderNo(orderNo)) {
            throw new BusinessException(-3004, "订单号已存在");
        }
        AlipayPayOrder order = new AlipayPayOrder();
        order.setOrderNo(orderNo);
        order.setScene(scene);
        order.setAmount(amount);
        order.setSubject(subject);
        order.setStatus(PayStatus.PENDING);
        orderRepository.save(order);
    }
}
