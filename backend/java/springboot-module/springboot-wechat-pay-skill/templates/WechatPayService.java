package com.example.pay.wechat.service;

import com.alibaba.fastjson.JSONObject;
import com.example.common.exception.BusinessException;
import com.example.pay.wechat.config.WechatPayConfig;
import com.example.pay.wechat.dto.*;
import com.example.pay.wechat.entity.WechatPayOrder;
import com.example.pay.wechat.entity.WechatRefundOrder;
import com.example.pay.wechat.enums.PayScene;
import com.wechat.pay.java.core.Config;
import com.wechat.pay.java.core.exception.ServiceException;
import com.wechat.pay.java.core.exception.ValidationException;
import com.wechat.pay.java.service.payments.app.AppService;
import com.wechat.pay.java.service.payments.h5.H5Service;
import com.wechat.pay.java.service.payments.jsapi.JsapiService;
import com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension;
import com.wechat.pay.java.service.payments.jsapi.model.Amount;
import com.wechat.pay.java.service.payments.jsapi.model.Payer;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayRequest;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayResponse;
import com.wechat.pay.java.service.payments.jsapi.model.RequestPaymentRequest;
import com.wechat.pay.java.service.payments.jsapi.model.RequestPaymentResponse;
import com.wechat.pay.java.service.payments.nativepay.NativePayService;
import com.wechat.pay.java.service.refund.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * 微信支付 V3 核心服务
 * - 统一下单：JSAPI / 小程序 / H5 / Native / App
 * - 退款 / 查询 / 关单
 *
 * 注意：所有金额单位为"分"（long）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WechatPayService {

    private final Config wechatPayConfig;
    private final WechatPayConfig payProperties;
    private final WechatPayOrderRepository orderRepository;
    private final WechatRefundOrderRepository refundRepository;

    // ============== 统一下单 ==============

    /**
     * JSAPI 统一下单（公众号 / 微信内 H5）
     *
     * @param req 包含 orderNo, amount, description, openid
     * @return 前端调起支付所需参数
     */
    public JsapiPayResponse createJsapiOrder(JsapiPayRequest req) {
        // 1. 幂等检查（同 orderNo 不能重复下单）
        if (orderRepository.existsByOrderNo(req.getOrderNo())) {
            throw new BusinessException(-3004, "订单号已存在: " + req.getOrderNo());
        }

        // 2. 调用微信接口（用 JsapiServiceExtension.prepayWithRequestPayment 一站式完成下单+二次签名）
        try {
            JsapiServiceExtension service = new JsapiServiceExtension.Builder().config(wechatPayConfig).build();

            RequestPaymentRequest request = new RequestPaymentRequest();
            request.setAppid(payProperties.getAppId());
            request.setMchid(payProperties.getMchId());
            request.setDescription(req.getDescription());
            request.setOutTradeNo(req.getOrderNo());
            request.setNotifyUrl(payProperties.getNotifyUrl());
            request.setAmount(new Amount().setTotal(req.getAmount()).setCurrency("CNY"));
            request.setPayer(new Payer().setOpenid(req.getOpenid()));

            // SDK 内部完成 prepayId 申请 + paySign 二次签名
            RequestPaymentResponse response = service.prepayWithRequestPayment(request);

            // 3. 持久化订单
            WechatPayOrder order = new WechatPayOrder();
            order.setOrderNo(req.getOrderNo());
            order.setScene(PayScene.JSAPI);
            order.setAmount(req.getAmount());
            order.setDescription(req.getDescription());
            order.setOpenid(req.getOpenid());
            order.setPrepayId(response.getPackageVal());  // SDK 返回的 package 含 prepay_id=xxx
            order.setStatus(PayStatus.PENDING);
            orderRepository.save(order);

            // 4. 返回前端调起支付所需参数（paySign 由 SDK 算好）
            return JsapiPayResponse.builder()
                .appId(response.getAppId())
                .timeStamp(response.getTimeStamp())
                .nonceStr(response.getNonceStr())
                .packageStr(response.getPackageVal())
                .signType(response.getSignType())
                .paySign(response.getPaySign())
                .build();

        } catch (ValidationException e) {
            log.error("JSAPI 统一下单参数错误", e);
            throw new BusinessException(-3001, "参数错误: " + e.getMessage());
        } catch (ServiceException e) {
            log.error("JSAPI 统一下单失败", e);
            throw new BusinessException(-3001, "微信下单失败: " + e.getErrorMessage());
        }
    }

    /**
     * 小程序支付（与 JSAPI 实现相同，仅 appid 区分）
     */
    public JsapiPayResponse createMiniProgramOrder(JsapiPayRequest req) {
        req.setScene(PayScene.MINI_PROGRAM);
        return createJsapiOrder(req);
    }

    /**
     * H5 支付（返回 h5_url，前端跳转）
     */
    public H5PayResponse createH5Order(H5PayRequest req) {
        if (orderRepository.existsByOrderNo(req.getOrderNo())) {
            throw new BusinessException(-3004, "订单号已存在");
        }

        try {
            H5Service h5Service = new H5Service.Builder().config(wechatPayConfig).build();
            com.wechat.pay.java.service.payments.h5.model.H5Request h5Request =
                new com.wechat.pay.java.service.payments.h5.model.H5Request();
            h5Request.setAppid(payProperties.getAppId());
            h5Request.setMchid(payProperties.getMchId());
            h5Request.setDescription(req.getDescription());
            h5Request.setOutTradeNo(req.getOrderNo());
            h5Request.setNotifyUrl(payProperties.getNotifyUrl());
            h5Request.setAmount(new com.wechat.pay.java.service.payments.h5.model.Amount()
                .setTotal(req.getAmount()).setCurrency("CNY"));
            h5Request.setSceneInfo(new com.wechat.pay.java.service.payments.h5.model.SceneInfo()
                .setPayerClientIp(req.getClientIp())
                .setH5Info(new com.wechat.pay.java.service.payments.h5.model.H5Info().setType("Wap")));

            com.wechat.pay.java.service.payments.h5.model.H5Response h5Response = h5Service.create(h5Request);

            // 持久化订单
            WechatPayOrder order = new WechatPayOrder();
            order.setOrderNo(req.getOrderNo());
            order.setScene(PayScene.H5);
            order.setAmount(req.getAmount());
            order.setDescription(req.getDescription());
            order.setStatus(PayStatus.PENDING);
            orderRepository.save(order);

            return new H5PayResponse(h5Response.getH5Url());

        } catch (ServiceException e) {
            log.error("H5 统一下单失败", e);
            throw new BusinessException(-3001, "微信 H5 下单失败: " + e.getErrorMessage());
        }
    }

    /**
     * Native 支付（PC 扫码，返回 code_url）
     */
    public NativePayResponse createNativeOrder(NativePayRequest req) {
        if (orderRepository.existsByOrderNo(req.getOrderNo())) {
            throw new BusinessException(-3004, "订单号已存在");
        }

        try {
            NativePayService nativePayService = new NativePayService.Builder().config(wechatPayConfig).build();
            com.wechat.pay.java.service.payments.nativepay.model.NativeRequest nativeRequest =
                new com.wechat.pay.java.service.payments.nativepay.model.NativeRequest();
            nativeRequest.setAppid(payProperties.getAppId());
            nativeRequest.setMchid(payProperties.getMchId());
            nativeRequest.setDescription(req.getDescription());
            nativeRequest.setOutTradeNo(req.getOrderNo());
            nativeRequest.setNotifyUrl(payProperties.getNotifyUrl());
            nativeRequest.setAmount(new com.wechat.pay.java.service.payments.nativepay.model.Amount()
                .setTotal(req.getAmount()).setCurrency("CNY"));

            com.wechat.pay.java.service.payments.nativepay.model.NativeResponse nativeResponse =
                nativePayService.create(nativeRequest);

            WechatPayOrder order = new WechatPayOrder();
            order.setOrderNo(req.getOrderNo());
            order.setScene(PayScene.NATIVE);
            order.setAmount(req.getAmount());
            order.setDescription(req.getDescription());
            order.setCodeUrl(nativeResponse.getCodeUrl());
            order.setStatus(PayStatus.PENDING);
            orderRepository.save(order);

            return new NativePayResponse(nativeResponse.getCodeUrl());

        } catch (ServiceException e) {
            log.error("Native 统一下单失败", e);
            throw new BusinessException(-3001, "Native 下单失败: " + e.getErrorMessage());
        }
    }

    // ============== 退款 ==============

    /**
     * 申请退款
     */
    @Transactional
    public RefundResponse refund(RefundRequest req) {
        // 1. 校验原订单存在且已支付
        WechatPayOrder order = orderRepository.findByOrderNo(req.getOrderNo())
            .orElseThrow(() -> new BusinessException(-3003, "原订单不存在"));

        if (order.getStatus() != PayStatus.PAID) {
            throw new BusinessException(-3005, "订单未支付，无法退款");
        }

        // 2. 校验金额
        if (req.getRefundAmount() > order.getAmount()) {
            throw new BusinessException(-3005, "退款金额超过原单金额");
        }

        // 3. 持久化退款单
        WechatRefundOrder refundOrder = new WechatRefundOrder();
        refundOrder.setRefundNo(req.getRefundNo());
        refundOrder.setOrderNo(req.getOrderNo());
        refundOrder.setRefundAmount(req.getRefundAmount());
        refundOrder.setTotalAmount(order.getAmount());
        refundOrder.setReason(req.getReason());
        refundOrder.setStatus(RefundStatus.PENDING);
        refundRepository.save(refundOrder);

        // 4. 调用微信退款接口
        try {
            RefundService refundService = new RefundService.Builder().config(wechatPayConfig).build();
            com.wechat.pay.java.service.refund.model.CreateRequest createRequest =
                new com.wechat.pay.java.service.refund.model.CreateRequest();
            createRequest.setOutTradeNo(req.getOrderNo());
            createRequest.setOutRefundNo(req.getRefundNo());
            createRequest.setReason(req.getReason());
            createRequest.setNotifyUrl(payProperties.getRefundNotifyUrl() != null
                ? payProperties.getRefundNotifyUrl() : payProperties.getNotifyUrl());
            createRequest.setAmount(new com.wechat.pay.java.service.refund.model.Amount()
                .setRefund(req.getRefundAmount())
                .setTotal(order.getAmount())
                .setCurrency("CNY"));

            refundService.create(createRequest);

            return new RefundResponse(req.getRefundNo(), "PROCESSING");

        } catch (ServiceException e) {
            log.error("退款申请失败: orderNo={}", req.getOrderNo(), e);
            refundOrder.setStatus(RefundStatus.FAILED);
            refundRepository.save(refundOrder);
            throw new BusinessException(-3005, "退款失败: " + e.getErrorMessage());
        }
    }

    // ============== 查询 / 关单 ==============

    /**
     * 查询订单
     */
    public WechatPayOrder queryOrder(String orderNo) {
        return orderRepository.findByOrderNo(orderNo)
            .orElseThrow(() -> new BusinessException(-3003, "订单不存在"));
    }

    /**
     * 关闭订单（未支付时调用）
     */
    @Transactional
    public void closeOrder(String orderNo) {
        WechatPayOrder order = orderRepository.findByOrderNo(orderNo)
            .orElseThrow(() -> new BusinessException(-3003, "订单不存在"));

        if (order.getStatus() == PayStatus.PAID) {
            throw new BusinessException(-3006, "订单已支付，无法关闭");
        }

        try {
            com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension service =
                new com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension.Builder()
                    .config(wechatPayConfig).build();
            service.close(orderNo, payProperties.getMchId());

            order.setStatus(PayStatus.CLOSED);
            orderRepository.save(order);

        } catch (ServiceException e) {
            log.error("关单失败: orderNo={}", orderNo, e);
            throw new BusinessException(-3006, "关单失败: " + e.getErrorMessage());
        }
    }
}
