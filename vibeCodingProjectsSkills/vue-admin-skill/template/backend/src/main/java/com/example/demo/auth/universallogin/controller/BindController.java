package com.example.demo.auth.universallogin.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.CurrentUser;
import com.example.demo.auth.universallogin.dto.BindCodeVO;
import com.example.demo.auth.universallogin.dto.BindConfirmRequest;
import com.example.demo.auth.universallogin.dto.BindVO;
import com.example.demo.auth.universallogin.dto.CreateBindCodeRequest;
import com.example.demo.auth.universallogin.service.BindService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 账户绑定控制器（宿主侧）。
 *
 * <p>★ 所有端点要求宿主登录，且绑定主体 = 当前登录用户
 * （{@code @CurrentUser}）。<b>禁止</b>任何形式的
 * {@code Long userId = 1L} 硬编码，也<b>禁止</b> {@code permitAll}。</p>
 *
 * <p>应用侧（server-to-server）的绑定入口在 {@code /api/open/bind/*}。</p>
 */
@RestController
@RequestMapping("/api/bind")
@RequiredArgsConstructor
public class BindController {

    private final BindService bindService;

    /**
     * 我的绑定列表。
     * ponytail: 之前写 @GetMapping("/list") → 路径 /api/bind/list，与前端 `get(BASE='/api/bind', ...)` 不匹配 → 500。
     *          改成裸 @GetMapping，让前端 `GET /api/bind` 命中这里（与 user.ts / role.ts 风格一致）。
     */
    @GetMapping
    @PreAuthorize("hasAuthority('account:bind:list')")
    public ApiResponse<List<BindVO>> list(@CurrentUser Long userId) {
        return ApiResponse.success(bindService.listMine(userId));
    }

    /** 生成绑定码（宿主发起 → 交给第三方应用认领）。 */
    @PostMapping("/code")
    @PreAuthorize("hasAuthority('account:bind:create')")
    public ApiResponse<BindCodeVO> createCode(@RequestBody @Validated CreateBindCodeRequest request,
                                             @CurrentUser Long userId) {
        return ApiResponse.success(bindService.createUserInitiatedCode(userId, request.getAppId()));
    }

    /** 确认绑定（应用发起 → 宿主确认）。身份取自登录态，不收密码。 */
    @PostMapping("/confirm")
    @PreAuthorize("hasAuthority('account:bind:create')")
    public ApiResponse<BindVO> confirm(@RequestBody @Validated BindConfirmRequest request,
                                       @CurrentUser Long userId) {
        return ApiResponse.success(bindService.confirmAppInitiated(userId, request.getCode()));
    }

    /** 取消绑定（只能取消自己的）。 */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('account:bind:delete')")
    public ApiResponse<Void> cancel(@PathVariable Long id, @CurrentUser Long userId) {
        bindService.cancel(userId, id);
        return ApiResponse.success(null);
    }

    /** 设为默认应用（只能设置自己的）。 */
    @PutMapping("/{id}/default")
    @PreAuthorize("hasAuthority('account:bind:set-default')")
    public ApiResponse<Void> setDefault(@PathVariable Long id, @CurrentUser Long userId) {
        bindService.setDefault(userId, id);
        return ApiResponse.success(null);
    }
}
