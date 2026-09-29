package {{basePackage}}.service;

import {{basePackage}}.common.BusinessException;
import {{basePackage}}.common.PageResponse;
import {{basePackage}}.dto.AppKeyVO;
import {{basePackage}}.dto.AppVO;
import {{basePackage}}.dto.CreateAppKeyRequest;
import {{basePackage}}.dto.CreateAppRequest;
import {{basePackage}}.dto.CreatedAppKeyVO;
import {{basePackage}}.dto.UpdateAppRequest;
import {{basePackage}}.entity.App;
import {{basePackage}}.entity.AppKey;
import {{basePackage}}.repository.AppBindingRepository;
import {{basePackage}}.repository.AppKeyRepository;
import {{basePackage}}.repository.AppRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;

/**
 * 应用管理服务。
 *
 * <p>约束：</p>
 * <ul>
 *   <li>所有读写都带 {@code ownerId} 归属校验 —— 应用之间互相不可见；</li>
 *   <li>{@code appKey} / {@code ownerId} 一律服务端生成/注入，不接受前端入参；</li>
 *   <li>删除为软删除，并级联软删其密钥与绑定。</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class AppService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppRepository appRepository;
    private final AppKeyRepository appKeyRepository;
    private final AppBindingRepository appBindingRepository;

    // ==================== 应用 CRUD ====================

    public PageResponse<AppVO> page(Long ownerId, int page, int pageSize) {
        Page<AppVO> p = appRepository
            .findByOwnerIdAndDeletedAtIsNull(ownerId,
                PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(pageSize, 1), 100),
                    Sort.by(Sort.Direction.DESC, "id")))
            .map(this::toVO);
        return PageResponse.from(p);
    }

    public AppVO get(Long id, Long ownerId) {
        return toVO(requireOwned(id, ownerId));
    }

    @Transactional
    public AppVO create(CreateAppRequest request, Long ownerId) {
        App app = new App();
        app.setAppName(request.getAppName());
        app.setAppKey(generateUniqueAppKey());
        app.setDescription(request.getDescription());
        app.setLogo(request.getLogo());
        app.setCallbackUrl(request.getCallbackUrl());
        app.setStatus(1);
        app.setOwnerId(ownerId);           // ★ 服务端注入，杜绝 mass assignment
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());
        return toVO(appRepository.save(app));
    }

    @Transactional
    public AppVO update(Long id, UpdateAppRequest request, Long ownerId) {
        App app = requireOwned(id, ownerId);
        if (request.getAppName() != null) {
            app.setAppName(request.getAppName());
        }
        if (request.getDescription() != null) {
            app.setDescription(request.getDescription());
        }
        if (request.getLogo() != null) {
            app.setLogo(request.getLogo());
        }
        if (request.getCallbackUrl() != null) {
            app.setCallbackUrl(request.getCallbackUrl());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() != 0 && request.getStatus() != 1) {
                throw BusinessException.badRequest("status 只允许 0 或 1");
            }
            app.setStatus(request.getStatus());
        }
        app.setUpdatedAt(LocalDateTime.now());
        return toVO(appRepository.save(app));
    }

    @Transactional
    public void delete(Long id, Long ownerId) {
        App app = requireOwned(id, ownerId);
        LocalDateTime now = LocalDateTime.now();
        app.setDeletedAt(now);
        appRepository.save(app);
        appKeyRepository.softDeleteByAppId(id, now);
        appBindingRepository.softDeleteByAppId(id, now);
    }

    // ==================== 密钥管理 ====================

    public List<AppKeyVO> listKeys(Long appId, Long ownerId) {
        requireOwned(appId, ownerId);
        return appKeyRepository.findByAppIdAndDeletedAtIsNullOrderByIdDesc(appId)
            .stream().map(this::toKeyVO).toList();
    }

    /**
     * 创建密钥。
     *
     * <p>★ 只有这个方法的返回类型 {@link CreatedAppKeyVO} 带 {@code apiSecret}。
     * 落库后**不得**再对实体做 {@code setApiSecret(null)}（历史缺陷：前端永远拿不到 secret，
     * 且托管态实体的脏检查会把库里的 secret 一并写成 null）。</p>
     */
    @Transactional
    public CreatedAppKeyVO createKey(Long appId, CreateAppKeyRequest request, Long ownerId) {
        requireOwned(appId, ownerId);

        AppKey key = new AppKey();
        key.setAppId(appId);
        key.setKeyName(request.getKeyName() == null || request.getKeyName().isBlank()
            ? "默认密钥" : request.getKeyName());
        key.setApiKey(generateUniqueApiKey());
        key.setApiSecret("sk_" + randomHex(32));
        key.setStatus(1);
        key.setCreatedAt(LocalDateTime.now());
        key = appKeyRepository.save(key);

        CreatedAppKeyVO vo = new CreatedAppKeyVO();
        vo.setId(key.getId());
        vo.setKeyName(key.getKeyName());
        vo.setApiKey(key.getApiKey());
        vo.setApiSecret(key.getApiSecret());   // 仅此一次
        vo.setStatus(key.getStatus());
        vo.setCreatedAt(fmt(key.getCreatedAt()));
        return vo;
    }

    @Transactional
    public void deleteKey(Long appId, Long keyId, Long ownerId) {
        requireOwned(appId, ownerId);
        AppKey key = appKeyRepository.findByIdAndDeletedAtIsNull(keyId)
            .orElseThrow(() -> BusinessException.notFound("密钥不存在"));
        if (!key.getAppId().equals(appId)) {
            throw BusinessException.forbidden("密钥不属于该应用");
        }
        key.setDeletedAt(LocalDateTime.now());
        appKeyRepository.save(key);
    }

    // ==================== 内部工具 ====================

    /** 归属校验：不存在 → -1004；不是自己的 → -1003。 */
    private App requireOwned(Long id, Long ownerId) {
        App app = appRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> BusinessException.notFound("应用不存在"));
        if (!app.getOwnerId().equals(ownerId)) {
            throw BusinessException.forbidden("无权操作该应用");
        }
        return app;
    }

    private String generateUniqueAppKey() {
        String key;
        do {
            key = "app_" + randomHex(12);
        } while (appRepository.existsByAppKey(key));
        return key;
    }

    private String generateUniqueApiKey() {
        String key;
        do {
            key = "ak_" + randomHex(12);
        } while (appKeyRepository.existsByApiKey(key));
        return key;
    }

    private static String randomHex(int bytes) {
        byte[] buf = new byte[bytes];
        RANDOM.nextBytes(buf);
        return HexFormat.of().formatHex(buf);
    }

    private static String fmt(LocalDateTime t) {
        return t == null ? null : TS.format(t);
    }

    private AppVO toVO(App app) {
        AppVO vo = new AppVO();
        vo.setId(app.getId());
        vo.setAppName(app.getAppName());
        vo.setAppKey(app.getAppKey());
        vo.setDescription(app.getDescription());
        vo.setLogo(app.getLogo());
        vo.setCallbackUrl(app.getCallbackUrl());
        vo.setStatus(app.getStatus());
        vo.setCreatedAt(fmt(app.getCreatedAt()));
        return vo;
    }

    private AppKeyVO toKeyVO(AppKey key) {
        AppKeyVO vo = new AppKeyVO();
        vo.setId(key.getId());
        vo.setKeyName(key.getKeyName());
        vo.setApiKey(key.getApiKey());
        // ★ 绝不 setApiSecret —— AppKeyVO 根本没有这个字段
        vo.setStatus(key.getStatus());
        vo.setLastUsedAt(fmt(key.getLastUsedAt()));
        vo.setCreatedAt(fmt(key.getCreatedAt()));
        return vo;
    }
}
