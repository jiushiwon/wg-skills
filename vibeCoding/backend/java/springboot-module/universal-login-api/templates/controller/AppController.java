package {{basePackage}}.controller;

import {{basePackage}}.common.ApiResponse;
import {{basePackage}}.common.CurrentUser;
import {{basePackage}}.common.PageResponse;
import {{basePackage}}.dto.AppKeyVO;
import {{basePackage}}.dto.AppVO;
import {{basePackage}}.dto.CreateAppKeyRequest;
import {{basePackage}}.dto.CreateAppRequest;
import {{basePackage}}.dto.CreatedAppKeyVO;
import {{basePackage}}.dto.UpdateAppRequest;
import {{basePackage}}.service.AppService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 应用管理控制器。
 *
 * <p>★ 所有端点：宿主登录（JWT）+ 方法级鉴权 {@code @PreAuthorize}。
 * ★ 所有涉及应用的操作都以「当前登录用户」为所有者维度，不接收 ownerId 入参。</p>
 */
@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;

    @GetMapping
    @PreAuthorize("hasAuthority('system:app:list')")
    public ApiResponse<PageResponse<AppVO>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @CurrentUser Long userId) {
        return ApiResponse.success(appService.page(userId, page, pageSize));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:app:list')")
    public ApiResponse<AppVO> get(@PathVariable Long id, @CurrentUser Long userId) {
        return ApiResponse.success(appService.get(id, userId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('system:app:create')")
    public ApiResponse<AppVO> create(@RequestBody @Validated CreateAppRequest request,
                                     @CurrentUser Long userId) {
        return ApiResponse.success(appService.create(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:app:edit')")
    public ApiResponse<AppVO> update(@PathVariable Long id,
                                     @RequestBody @Validated UpdateAppRequest request,
                                     @CurrentUser Long userId) {
        return ApiResponse.success(appService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:app:delete')")
    public ApiResponse<Void> delete(@PathVariable Long id, @CurrentUser Long userId) {
        appService.delete(id, userId);
        return ApiResponse.success(null);
    }

    // ==================== API 密钥 ====================

    @GetMapping("/{id}/keys")
    @PreAuthorize("hasAuthority('system:app:key-manage')")
    public ApiResponse<List<AppKeyVO>> listKeys(@PathVariable Long id, @CurrentUser Long userId) {
        return ApiResponse.success(appService.listKeys(id, userId));
    }

    /**
     * 创建密钥。★ 响应是**唯一**带 {@code apiSecret} 的地方，前端必须提示「仅显示一次」。
     */
    @PostMapping("/{id}/keys")
    @PreAuthorize("hasAuthority('system:app:key-manage')")
    public ApiResponse<CreatedAppKeyVO> createKey(@PathVariable Long id,
                                                  @RequestBody @Validated CreateAppKeyRequest request,
                                                  @CurrentUser Long userId) {
        return ApiResponse.success(appService.createKey(id, request, userId));
    }

    @DeleteMapping("/{id}/keys/{keyId}")
    @PreAuthorize("hasAuthority('system:app:key-manage')")
    public ApiResponse<Void> deleteKey(@PathVariable Long id,
                                       @PathVariable Long keyId,
                                       @CurrentUser Long userId) {
        appService.deleteKey(id, keyId, userId);
        return ApiResponse.success(null);
    }
}
