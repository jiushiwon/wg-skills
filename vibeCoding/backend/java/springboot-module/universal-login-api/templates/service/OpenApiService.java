package {{basePackage}}.service;

import {{basePackage}}.auth.entity.SysUser;
import {{basePackage}}.auth.repository.SysUserRepository;
import {{basePackage}}.common.BusinessException;
import {{basePackage}}.dto.BindCodeVO;
import {{basePackage}}.dto.BindVO;
import {{basePackage}}.dto.OpenBindApplyRequest;
import {{basePackage}}.dto.OpenBindClaimRequest;
import {{basePackage}}.dto.OpenUserInfoVO;
import {{basePackage}}.entity.AppBinding;
import {{basePackage}}.repository.AppBindingRepository;
import {{basePackage}}.security.AppPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 开放接口服务：面向第三方应用的 server-to-server 调用。
 *
 * <p>★ 调用方身份由 {@code AppSignatureAuthFilter} 校验
 * （{@code X-App-Key} / {@code X-Timestamp} / {@code X-Nonce} / {@code X-Signature}），
 * 应用 ID 从 {@link AppPrincipal} 取，**绝不从请求体读**。</p>
 *
 * <p>本服务直接复用宿主账户表 {@code {prefix}_sys_user}
 * （包路径 {@code {{basePackage}}.auth.entity.SysUser}，由 {@code springboot-auth-module-skill} 提供）。
 * 若宿主把账户实体放在别的包，只需改本文件的 import。</p>
 */
@Service
@RequiredArgsConstructor
public class OpenApiService {

    private final AppBindingRepository appBindingRepository;
    private final BindService bindService;
    private final SysUserRepository sysUserRepository;

    /** 应用为其用户申请绑定码（应用发起 → 宿主确认）。 */
    @Transactional
    public BindCodeVO applyBind(AppPrincipal principal, OpenBindApplyRequest request) {
        return bindService.issueForApp(principal.getAppId(),
            request.getAppUserId(), request.getAppUserName());
    }

    /** 应用认领宿主生成的绑定码（宿主发起 → 应用认领）。 */
    @Transactional
    public BindVO claimBind(AppPrincipal principal, OpenBindClaimRequest request) {
        return bindService.claimForApp(principal.getAppId(), request.getCode(),
            request.getAppUserId(), request.getAppUserName());
    }

    /**
     * 按应用侧用户标识换取宿主用户信息。
     *
     * <p>★ 未绑定时只返回 {@code bound=false}，不泄露任何宿主用户字段。</p>
     */
    public OpenUserInfoVO userInfo(AppPrincipal principal, String appUserId) {
        OpenUserInfoVO vo = new OpenUserInfoVO();
        vo.setAppUserId(appUserId);
        vo.setBound(false);

        AppBinding binding = appBindingRepository
            .findByAppIdAndAppUserIdAndDeletedAtIsNull(principal.getAppId(), appUserId)
            .orElse(null);
        if (binding == null) {
            return vo;
        }

        SysUser user = sysUserRepository.findById(binding.getSysUserId()).orElse(null);
        if (user == null || user.getDeletedAt() != null) {
            // 宿主账户已删除：视为未绑定，避免泄露已注销账号
            return vo;
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw BusinessException.forbidden("宿主账户已被禁用");
        }

        vo.setBound(true);
        vo.setBindingId(binding.getId());
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setEmail(user.getEmail());
        vo.setPhone(user.getPhone());
        return vo;
    }
}
