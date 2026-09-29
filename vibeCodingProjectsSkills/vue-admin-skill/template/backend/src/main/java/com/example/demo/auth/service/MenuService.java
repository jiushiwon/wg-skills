package com.example.demo.auth.service;

import com.example.demo.auth.dto.CreateMenuRequest;
import com.example.demo.auth.dto.MenuNode;
import com.example.demo.auth.dto.UpdateMenuRequest;
import com.example.demo.auth.entity.SysMenu;
import com.example.demo.auth.mapper.MenuMapper;
import com.example.demo.auth.repository.SysMenuRepository;
import com.example.demo.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    /** `menu_type` 只允许 M(目录) / C(菜单) / F(按钮)。读取兼容 B → F，见 SKILL.md。 */
    private static final Set<String> LEGAL_MENU_TYPES = Set.of("M", "C", "F");
    private static final String LEGACY_BUTTON_TYPE = "B";

    /**
     * 三段式权限码：`模块:资源:动作`，三段皆为小写字母/数字/下划线（首字符必须是字母）。
     * <p>防欠飞：手写出「系统:用户:列表」/「user:list」/「system:user-list」（两段式）/「system-user-list」（单段）等历史错误。</p>
     */
    private static final java.util.regex.Pattern PERMISSION_PATTERN =
        java.util.regex.Pattern.compile("^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*:[a-z][a-z0-9_-]+$");

    private final SysMenuRepository menuRepository;
    private final MenuMapper menuMapper;

    public List<MenuNode> tree() {
        List<SysMenu> all = menuRepository.findAllByOrderBySortOrderAscIdAsc();
        List<MenuNode> nodes = all.stream().map(menuMapper::toNode).toList();
        Map<Long, MenuNode> byId = new HashMap<>();
        for (MenuNode n : nodes) byId.put(n.getId(), n);
        List<MenuNode> roots = new ArrayList<>();
        for (MenuNode n : nodes) {
            if (n.getParentId() == null) {
                roots.add(n);
            } else {
                MenuNode p = byId.get(n.getParentId());
                if (p != null) p.getChildren().add(n);
                else roots.add(n);
            }
        }
        return roots;
    }

    @Transactional
    public MenuNode create(CreateMenuRequest req) {
        validateRequest(req, null);
        SysMenu saved = menuRepository.save(menuMapper.toEntity(req));
        assertMenuTreeIntegrity();
        return menuMapper.toNode(saved);
    }

    @Transactional
    public MenuNode update(Long id, UpdateMenuRequest req) {
        SysMenu m = get(id);
        // 把当前 id 传进校验器，让「path 排除自己」生效
        validateUpdateRequest(id, req);
        menuMapper.updateEntity(m, req);
        menuRepository.save(m);
        assertMenuTreeIntegrity();
        return menuMapper.toNode(m);
    }

    @Transactional
    public void delete(Long id) {
        SysMenu m = get(id);
        if (menuRepository.existsByParentIdAndDeletedAtIsNull(id)) {
            throw BusinessException.conflict("存在子菜单，不可删除");
        }
        m.setDeletedAt(LocalDateTime.now());
        menuRepository.save(m);
    }

    public SysMenu get(Long id) {
        return menuRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("菜单不存在"));
    }

    /**
     * R8：菜单 C/F 类型与 permission 校验（创建场景）。
     *
     * <p>规则：
     * <ul>
     *   <li>{@code menuType=C}（菜单/页面）必须有 path 与 component —— 缺则前端无法路由</li>
     *   <li>{@code menuType=F}（按钮）必须有 permission，且必须是三段式</li>
     *   <li>{@code menuType=M}（目录）不应携带 path / component / permission（若有也放过）</li>
     * </ul>
     */
    void validateRequest(CreateMenuRequest req, Long selfIdForUpdate) {
        String type = req.getMenuType() == null ? "M" : req.getMenuType().toUpperCase();
        if (!LEGAL_MENU_TYPES.contains(type) && !LEGACY_BUTTON_TYPE.equals(type)) {
            throw BusinessException.badRequest("非法 menu_type: " + req.getMenuType()
                + "（仅允许 M=目录 / C=菜单 / F=按钮）");
        }
        if ("C".equals(type)) {
            if (isBlank(req.getPath()) || isBlank(req.getComponent())) {
                throw BusinessException.badRequest("菜单类（menuType=C）必须填写 path 与 component");
            }
            checkPathDuplicate(req.getPath(), selfIdForUpdate);
        } else if ("F".equals(type) || LEGACY_BUTTON_TYPE.equals(type)) {
            if (isBlank(req.getPermission())) {
                throw BusinessException.badRequest("按钮类（menuType=F）必须填写权限码 permission");
            }
            if (!PERMISSION_PATTERN.matcher(req.getPermission()).matches()) {
                throw BusinessException.badRequest("权限码必须三段式  模块:资源:动作（小写字母/数字/下划线）—— 当前值："
                    + req.getPermission());
            }
        }
    }

    void validateUpdateRequest(Long selfId, UpdateMenuRequest req) {
        // 更新时只校验**本次传入**的字段；如果 path/menuType 都没传，跳过。
        String type = req.getMenuType();
        if (type == null) {
            // 没传 menuType，按当前记录的类型校验 path/permission
            SysMenu current = get(selfId);
            type = current.getMenuType() == null ? "M" : current.getMenuType().toUpperCase();
            if ("C".equals(type) && req.getPath() != null) {
                checkPathDuplicate(req.getPath(), selfId);
            }
            if (("F".equals(type) || LEGACY_BUTTON_TYPE.equals(type)) && req.getPermission() != null) {
                if (!PERMISSION_PATTERN.matcher(req.getPermission()).matches()) {
                    throw BusinessException.badRequest("权限码必须三段式  模块:资源:动作 —— 当前值："
                        + req.getPermission());
                }
            }
            return;
        }
        // 显式传了 menuType：走完整校验
        if (!LEGAL_MENU_TYPES.contains(type) && !LEGACY_BUTTON_TYPE.equals(type)) {
            throw BusinessException.badRequest("非法 menu_type: " + req.getMenuType());
        }
        if ("C".equals(type)) {
            String finalPath = req.getPath() != null ? req.getPath()
                : get(selfId).getPath();
            if (isBlank(finalPath) || isBlank(get(selfId).getComponent())) {
                throw BusinessException.badRequest("菜单类（menuType=C）必须有 path 与 component");
            }
            checkPathDuplicate(finalPath, selfId);
        } else if ("F".equals(type) || LEGACY_BUTTON_TYPE.equals(type)) {
            String finalPerm = req.getPermission() != null ? req.getPermission()
                : get(selfId).getPermission();
            if (isBlank(finalPerm)) {
                throw BusinessException.badRequest("按钮类（menuType=F）必须填写权限码 permission");
            }
            if (!PERMISSION_PATTERN.matcher(finalPerm).matches()) {
                throw BusinessException.badRequest("权限码必须三段式 —— 当前值：" + finalPerm);
            }
        }
    }

    /** R9：C 类 path 全树唯一（排除自己与软删除项）。 */
    void checkPathDuplicate(String path, Long selfId) {
        long excluded = selfId == null ? -1L : selfId;
        if (menuRepository.existsByPathAndDeletedAtIsNullAndIdNot(path, excluded)) {
            throw BusinessException.conflict("菜单路径已被占用：" + path);
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    /**
     * 菜单树完整性断言：**父节点必须存在**，否则抛 {@code BusinessException}（-1005）。
     *
     * <p>孤儿节点（`parent_id` 指向不存在的 id）会让菜单树在渲染时被静默当成根节点挂上，
     * 前端「分配菜单」里的勾选状态也跟着错位 —— 所以在写入链路上直接拦死。</p>
     *
     * <p>{@code @Transactional} 下抛异常会整体回滚，不会把半截脏数据留在库里。</p>
     */
    public void assertMenuTreeIntegrity() {
        List<SysMenu> all = menuRepository.findAll();
        // 父节点判定用「全量 id」而非仅未删除：否则软删除过父菜单的历史库会被永久卡死
        Set<Long> ids = all.stream().map(SysMenu::getId).collect(Collectors.toSet());

        for (SysMenu m : all) {
            String type = m.getMenuType();
            boolean legalType = type != null
                && (LEGAL_MENU_TYPES.contains(type) || LEGACY_BUTTON_TYPE.equals(type));
            if (!legalType) {
                throw BusinessException.conflict("非法 menu_type: " + type
                    + "（只允许 M=目录 / C=菜单 / F=按钮），id=" + m.getId() + " name=" + m.getName());
            }
            if (m.getParentId() == null) continue;

            if (m.getParentId().equals(m.getId())) {
                throw BusinessException.conflict("菜单不能把自己作为父节点: id=" + m.getId() + " name=" + m.getName());
            }
            if (!ids.contains(m.getParentId())) {
                throw BusinessException.conflict("菜单树存在孤儿节点: id=" + m.getId()
                    + " name=" + m.getName() + " parentId=" + m.getParentId() + " 不存在");
            }
        }
    }
}
