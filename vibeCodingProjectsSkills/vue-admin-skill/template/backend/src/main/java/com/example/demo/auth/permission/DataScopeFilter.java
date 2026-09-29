package com.example.demo.auth.permission;

import com.example.demo.auth.dto.DataScope;
import com.example.demo.auth.entity.SysOrg;
import com.example.demo.auth.entity.SysUser;
import com.example.demo.auth.repository.SysOrgRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据权限过滤：把查询条件按当前用户数据权限档位自动收紧。
 *
 * <p>四级全部可达，**不做静默折叠**（历史实现只区分 ALL / SELF_ONLY）。
 * 多角色取最宽档（见 {@link PermissionEvaluator}）。
 *
 * <p><b>可作用于任意业务表</b>：业务表只要有「自身标识列」（如 {@code creatorId}）
 * 与「组织列」（如 {@code orgId}）就能接入 —— {@link #scopeToColumn}。
 * 禁止只对用户表生效（那样组织架构形同摆设）。
 *
 * <p>关于 {@code DEPT_AND_BELOW}：本模板 `wg_sys_org` 未维护 `parent_ids` 路径列，
 * 因此走内存递归展开。表量级大时可加 `parent_ids` 并改为前缀匹配（见 auth 技能骨架 §8 推荐 SQL）。
 */
@Component
@RequiredArgsConstructor
public class DataScopeFilter {

    private final PermissionEvaluator evaluator;
    private final SysOrgRepository orgRepository;

    /** 泛型版：作用于任意实体。 */
    public <T> Specification<T> scopeToColumn(Long currentUserId, String selfColumn, String orgColumn) {
        DataScope scope = evaluator.resolveDataScope(currentUserId);
        List<Long> visibleOrgIds = List.of();

        if (scope == DataScope.DEPT_ONLY || scope == DataScope.DEPT_AND_BELOW) {
            SysUser me = evaluator.loadUser(currentUserId);
            Long myOrgId = me.getOrgId();
            if (myOrgId == null) {
                // 无部门归属 → 收紧为「仅本人」，而不是放行
                scope = DataScope.SELF_ONLY;
            } else if (scope == DataScope.DEPT_ONLY) {
                visibleOrgIds = List.of(myOrgId);
            } else {
                visibleOrgIds = selfAndDescendantIds(myOrgId);
            }
        }

        final DataScope s = scope;
        final List<Long> orgIds = visibleOrgIds;

        return (root, query, cb) -> switch (s) {
            case ALL -> cb.conjunction();
            case SELF_ONLY -> cb.equal(root.get(selfColumn), currentUserId);
            case DEPT_ONLY, DEPT_AND_BELOW ->
                root.get(orgColumn).in(orgIds.isEmpty() ? List.of(-1L) : orgIds);
        };
    }

    /** 便捷入口：作用于用户表（self = id，org = orgId）。 */
    public Specification<SysUser> scopeUser(Long currentUserId) {
        return scopeToColumn(currentUserId, "id", "orgId");
    }

    /** 叠加到已有 Specification（base 为 null 时等价于只做数据权限过滤）。 */
    public <T> Specification<T> combine(Specification<T> base, Long currentUserId,
                                        String selfColumn, String orgColumn) {
        Specification<T> scope = scopeToColumn(currentUserId, selfColumn, orgColumn);
        return base == null ? scope : base.and(scope);
    }

    /** 自身 + 全部子孙组织 id（内存递归，过滤软删除）。 */
    public List<Long> selfAndDescendantIds(Long rootOrgId) {
        List<SysOrg> filtered = new ArrayList<>();
        for (SysOrg o : orgRepository.findAll()) {
            if (o.getDeletedAt() != null) continue;
            filtered.add(o);
        }

        List<Long> ids = new ArrayList<>();
        ids.add(rootOrgId);
        boolean grew = true;
        while (grew) {
            grew = false;
            for (SysOrg o : filtered) {
                if (o.getParentId() != null
                    && ids.contains(o.getParentId())
                    && !ids.contains(o.getId())) {
                    ids.add(o.getId());
                    grew = true;
                }
            }
        }
        return ids;
    }
}
