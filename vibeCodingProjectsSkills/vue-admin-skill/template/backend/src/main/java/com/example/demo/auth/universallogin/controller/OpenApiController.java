package com.example.demo.auth.universallogin.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.auth.universallogin.dto.BindCodeVO;
import com.example.demo.auth.universallogin.dto.BindVO;
import com.example.demo.auth.universallogin.dto.OpenBindApplyRequest;
import com.example.demo.auth.universallogin.dto.OpenBindClaimRequest;
import com.example.demo.auth.universallogin.dto.OpenUserInfoVO;
import com.example.demo.auth.universallogin.security.AppPrincipal;
import com.example.demo.auth.universallogin.security.AppSignatureAuthFilter;
import com.example.demo.auth.universallogin.service.OpenApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 开放接口控制器（面向第三方应用，server-to-server）。
 *
 * <p>★ 鉴权方式<b>不是</b>宿主 JWT，也不是 {@code permitAll}，而是
 * {@link AppSignatureAuthFilter} 的应用级签名校验；
 * 对应的 Security 规则是 {@code .requestMatchers("/api/open/**").hasAuthority("APP")}。</p>
 *
 * <p>★ 应用身份从 request attribute {@code appPrincipal} 取，
 * <b>绝不</b>从请求体或查询参数读 appId / appKey。</p>
 */
@RestController
@RequestMapping("/api/open")
@RequiredArgsConstructor
public class OpenApiController {

    private final OpenApiService openApiService;

    /**
     * 应用为其用户申请绑定码。
     * 调用方：第三方应用后端；后续由宿主用户在前端确认。
     */
    @PostMapping("/bind/apply")
    public ApiResponse<BindCodeVO> applyBind(
            @RequestAttribute(AppSignatureAuthFilter.ATTR_APP_PRINCIPAL) AppPrincipal principal,
            @RequestBody @Validated OpenBindApplyRequest request) {
        return ApiResponse.success(openApiService.applyBind(principal, request));
    }

    /**
     * 应用认领宿主生成的绑定码（扫码绑定）。
     */
    @PostMapping("/bind/claim")
    public ApiResponse<BindVO> claimBind(
            @RequestAttribute(AppSignatureAuthFilter.ATTR_APP_PRINCIPAL) AppPrincipal principal,
            @RequestBody @Validated OpenBindClaimRequest request) {
        return ApiResponse.success(openApiService.claimBind(principal, request));
    }

    /**
     * 按应用侧用户标识换取宿主用户信息。
     *
     * <p>未绑定时返回 {@code bound=false}，不泄露宿主用户字段。</p>
     */
    @GetMapping("/userinfo")
    public ApiResponse<OpenUserInfoVO> userInfo(
            @RequestAttribute(AppSignatureAuthFilter.ATTR_APP_PRINCIPAL) AppPrincipal principal,
            @RequestParam String appUserId) {
        return ApiResponse.success(openApiService.userInfo(principal, appUserId));
    }
}
