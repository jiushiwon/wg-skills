package com.example.demo.auth.universallogin.service;

import com.example.demo.common.BusinessException;
import com.example.demo.auth.universallogin.dto.BindCodeVO;
import com.example.demo.auth.universallogin.dto.BindVO;
import com.example.demo.auth.universallogin.entity.App;
import com.example.demo.auth.universallogin.entity.AppBinding;
import com.example.demo.auth.universallogin.entity.BindCode;
import com.example.demo.auth.universallogin.repository.AppBindingRepository;
import com.example.demo.auth.universallogin.repository.AppRepository;
import com.example.demo.auth.universallogin.repository.BindCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 账户绑定服务（宿主侧 + 绑定码核心）。
 *
 * <p>绑定锚点 = 宿主账户 {@code sysUserId}（→ {@code wg_sys_user.id}）。
 * 本模块**不定义账户**，所有身份都来自宿主登录态。</p>
 *
 * <p>两条绑定路径：</p>
 * <ol>
 *   <li><b>应用发起</b>（{@code app_initiated}）：第三方应用后端调
 *       {@code POST /api/open/bind/apply} 拿到绑定码 → 用户在宿主侧登录后调
 *       {@code POST /api/bind/confirm} 确认；</li>
 *   <li><b>宿主发起</b>（{@code user_initiated}）：宿主用户在「我的绑定」里生成绑定码 →
 *       第三方应用后端调 {@code POST /api/open/bind/claim} 认领。</li>
 * </ol>
 * <p>两条路径的绑定码都**落库 + 5 分钟有效 + 一次性消费**。</p>
 */
@Service
@RequiredArgsConstructor
public class BindService {

    /** 绑定码有效期（秒）。 */
    public static final long CODE_TTL_SECONDS = 300L;

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppRepository appRepository;
    private final AppBindingRepository bindingRepository;
    private final BindCodeRepository bindCodeRepository;

    // ==================== 宿主侧 ====================

    /** 当前登录用户自己的绑定列表。 */
    public List<BindVO> listMine(Long sysUserId) {
        List<AppBinding> bindings = bindingRepository
            .findBySysUserIdAndDeletedAtIsNullOrderByIdDesc(sysUserId);
        if (bindings.isEmpty()) {
            return List.of();
        }
        List<Long> appIds = bindings.stream().map(AppBinding::getAppId).distinct().toList();
        Map<Long, App> apps = appRepository.findAllById(appIds).stream()
            .collect(Collectors.toMap(App::getId, Function.identity(), (a, b) -> a));
        return bindings.stream().map(b -> toVO(b, apps.get(b.getAppId()))).toList();
    }

    /** 宿主用户生成绑定码（扫码绑定：宿主发起 → 应用认领）。 */
    @Transactional
    public BindCodeVO createUserInitiatedCode(Long sysUserId, Long appId) {
        requireEnabledApp(appId);
        if (bindingRepository.existsBySysUserIdAndAppIdAndDeletedAtIsNull(sysUserId, appId)) {
            throw BusinessException.conflict("该应用已绑定到当前账户");
        }
        return toCodeVO(issue(BindCode.DIRECTION_USER_INITIATED, appId, sysUserId, null, null));
    }

    /** 宿主用户确认绑定（应用发起路径）。 */
    @Transactional
    public BindVO confirmAppInitiated(Long sysUserId, String code) {
        BindCode bc = requireUsable(code);
        if (!BindCode.DIRECTION_APP_INITIATED.equals(bc.getDirection())) {
            throw BusinessException.badRequest("绑定码方向不匹配：该码需由应用侧认领");
        }
        int updated = bindCodeRepository.consumeByUser(code, sysUserId, LocalDateTime.now());
        if (updated != 1) {
            throw BusinessException.conflict("绑定码已被使用或已失效");
        }
        return doBind(sysUserId, bc.getAppId(), bc.getAppUserId(), bc.getAppUserName(), bc.getDirection());
    }

    /** 取消绑定（只能取消自己的）。 */
    @Transactional
    public void cancel(Long sysUserId, Long bindingId) {
        AppBinding binding = bindingRepository
            .findByIdAndSysUserIdAndDeletedAtIsNull(bindingId, sysUserId)
            .orElseThrow(() -> BusinessException.notFound("绑定不存在"));
        binding.setDeletedAt(LocalDateTime.now());
        bindingRepository.save(binding);
    }

    /** 设为默认应用（只能设置自己的）。 */
    @Transactional
    public void setDefault(Long sysUserId, Long bindingId) {
        AppBinding binding = bindingRepository
            .findByIdAndSysUserIdAndDeletedAtIsNull(bindingId, sysUserId)
            .orElseThrow(() -> BusinessException.notFound("绑定不存在"));
        bindingRepository.clearDefault(sysUserId);
        binding.setIsDefault(1);
        bindingRepository.save(binding);
    }

    // ==================== 应用侧（由 OpenApiService 调用，appId 来自签名校验） ====================

    /** 应用为自己的用户申请绑定码（应用发起 → 宿主确认）。 */
    @Transactional
    public BindCodeVO issueForApp(Long appId, String appUserId, String appUserName) {
        requireEnabledApp(appId);
        BindCode bc = issue(BindCode.DIRECTION_APP_INITIATED, appId, null, appUserId, appUserName);
        return toCodeVO(bc);
    }

    /** 应用认领宿主生成的绑定码（宿主发起 → 应用认领）。 */
    @Transactional
    public BindVO claimForApp(Long appId, String code, String appUserId, String appUserName) {
        BindCode bc = requireUsable(code);
        if (!BindCode.DIRECTION_USER_INITIATED.equals(bc.getDirection())) {
            throw BusinessException.badRequest("绑定码方向不匹配：该码需由宿主侧确认");
        }
        if (!bc.getAppId().equals(appId)) {
            throw BusinessException.forbidden("绑定码不属于当前应用");
        }
        if (bc.getSysUserId() == null) {
            throw BusinessException.conflict("绑定码缺少宿主账户，无法认领");
        }
        int updated = bindCodeRepository.consumeByApp(code, LocalDateTime.now());
        if (updated != 1) {
            throw BusinessException.conflict("绑定码已被使用或已失效");
        }
        return doBind(bc.getSysUserId(), appId, appUserId, appUserName, bc.getDirection());
    }

    // ==================== 内部实现 ====================

    private BindCode issue(String direction, Long appId, Long sysUserId,
                           String appUserId, String appUserName) {
        LocalDateTime now = LocalDateTime.now();
        BindCode bc = new BindCode();
        bc.setCode(randomHex(16));
        bc.setDirection(direction);
        bc.setAppId(appId);
        bc.setSysUserId(sysUserId);
        bc.setAppUserId(appUserId);
        bc.setAppUserName(appUserName);
        bc.setStatus(BindCode.STATUS_PENDING);
        bc.setExpireAt(now.plusSeconds(CODE_TTL_SECONDS));
        bc.setCreatedAt(now);
        return bindCodeRepository.save(bc);
    }

    /** 取绑定码并校验「存在 + 待使用 + 未过期」，否则抛业务异常。 */
    private BindCode requireUsable(String code) {
        BindCode bc = bindCodeRepository.findByCode(code)
            .orElseThrow(() -> BusinessException.notFound("绑定码无效"));
        if (!bc.usable()) {
            throw BusinessException.conflict("绑定码已过期或已被使用");
        }
        return bc;
    }

    private BindVO doBind(Long sysUserId, Long appId, String appUserId,
                              String appUserName, String bindType) {
        App app = requireEnabledApp(appId);
        if (bindingRepository.existsBySysUserIdAndAppIdAndDeletedAtIsNull(sysUserId, appId)) {
            throw BusinessException.conflict("该应用已绑定到当前账户");
        }
        LocalDateTime now = LocalDateTime.now();
        AppBinding binding = new AppBinding();
        binding.setSysUserId(sysUserId);
        binding.setAppId(appId);
        binding.setAppUserId(appUserId);
        binding.setAppUserName(appUserName);
        binding.setBindType(bindType);
        binding.setIsDefault(bindingRepository.findBySysUserIdAndDeletedAtIsNullOrderByIdDesc(sysUserId).isEmpty() ? 1 : 0);
        binding.setBindAt(now);
        binding.setCreatedAt(now);
        return toVO(bindingRepository.save(binding), app);
    }

    private App requireEnabledApp(Long appId) {
        App app = appRepository.findByIdAndDeletedAtIsNull(appId)
            .orElseThrow(() -> BusinessException.notFound("应用不存在"));
        if (app.getStatus() == null || app.getStatus() != 1) {
            throw BusinessException.forbidden("应用已被禁用");
        }
        return app;
    }

    private BindCodeVO toCodeVO(BindCode bc) {
        BindCodeVO vo = new BindCodeVO();
        vo.setCode(bc.getCode());
        vo.setDirection(bc.getDirection());
        vo.setExpireSeconds(Duration.between(LocalDateTime.now(), bc.getExpireAt()).toSeconds());
        return vo;
    }

    private BindVO toVO(AppBinding b, App app) {
        BindVO vo = new BindVO();
        vo.setId(b.getId());
        vo.setAppId(b.getAppId());
        vo.setAppUserId(b.getAppUserId());
        vo.setAppUserName(b.getAppUserName());
        vo.setBindType(b.getBindType());
        vo.setIsDefault(b.getIsDefault() != null && b.getIsDefault() == 1);
        vo.setBindAt(b.getBindAt() == null ? null : TS.format(b.getBindAt()));
        if (app != null) {
            vo.setAppKey(app.getAppKey());
            vo.setAppName(app.getAppName());
            vo.setLogo(app.getLogo());
        }
        return vo;
    }

    private static String randomHex(int bytes) {
        byte[] buf = new byte[bytes];
        RANDOM.nextBytes(buf);
        return HexFormat.of().formatHex(buf);
    }
}
