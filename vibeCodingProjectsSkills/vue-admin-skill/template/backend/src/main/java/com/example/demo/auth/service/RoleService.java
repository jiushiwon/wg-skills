package com.example.demo.auth.service;

import com.example.demo.auth.common.AuthPerms;
import com.example.demo.auth.dto.AssignMenusRequest;
import com.example.demo.auth.dto.CreateRoleRequest;
import com.example.demo.auth.dto.RoleVO;
import com.example.demo.auth.dto.UpdateRoleRequest;
import com.example.demo.auth.entity.SysRole;
import com.example.demo.auth.entity.SysRoleMenu;
import com.example.demo.auth.mapper.RoleMapper;
import com.example.demo.auth.repository.SysRoleMenuRepository;
import com.example.demo.auth.repository.SysRoleRepository;
import com.example.demo.auth.repository.SysUserRoleRepository;
import com.example.demo.common.BusinessException;
import com.example.demo.common.PageRequest;
import com.example.demo.common.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleRepository roleRepository;
    private final SysRoleMenuRepository roleMenuRepository;
    private final SysUserRoleRepository userRoleRepository;
    private final RoleMapper roleMapper;

    public List<SysRole> list() {
        return roleRepository.findAll();
    }

    /**
     * 角色分页列表。`keyword` 模糊匹配 `name` / `code`（前端「角色名/编码」搜索框依赖它）。
     *
     * <p>★ `menuCount` 走真实计数，保证前端拿到的不是 `undefined`。</p>
     */
    public PageResponse<RoleVO> page(PageRequest pageReq, String keyword) {
        Specification<SysRole> spec = (root, q, cb) -> {
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword + "%";
                return cb.or(cb.like(root.get("name"), like), cb.like(root.get("code"), like));
            }
            return cb.conjunction();
        };
        var page = roleRepository.findAll(spec,
            pageReq.toPageable(Sort.by(Sort.Direction.ASC, "sortOrder", "id")));
        return PageResponse.from(page.map(r -> roleMapper.toVO(r, roleMenuRepository.countByRoleId(r.getId()))));
    }

    public SysRole get(Long id) {
        return roleRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("角色不存在"));
    }

    public RoleVO getVO(Long id) {
        SysRole r = get(id);
        return roleMapper.toVO(r, roleMenuRepository.countByRoleId(id));
    }

    @Transactional
    public RoleVO create(CreateRoleRequest req) {
        if (roleRepository.existsByCode(req.getCode())) {
            throw BusinessException.conflict("角色编码已存在");
        }
        SysRole r = roleMapper.toEntity(req);
        r = roleRepository.save(r);
        assignMenusInternal(r.getId(), req.getMenuIds());
        return getVO(r.getId());
    }

    @Transactional
    public RoleVO update(Long id, UpdateRoleRequest req) {
        SysRole r = get(id);
        if (AuthPerms.ROLE_SUPER_ADMIN.equals(r.getCode())) {
            // UpdateRoleRequest 不含 code 字段，编码本身不可改；此处仅提示仍会更新非关键字段
            log.warn("[RoleService] 修改 super_admin 角色（id={}）", id);
        }
        roleMapper.updateEntity(r, req);
        roleRepository.save(r);
        return getVO(id);
    }

    @Transactional
    public void delete(Long id) {
        SysRole r = get(id);
        if (AuthPerms.ROLE_SUPER_ADMIN.equals(r.getCode())) {
            throw BusinessException.badRequest("超级管理员角色不可删除");
        }
        long bound = userRoleRepository.countByRoleId(id);
        if (bound > 0) {
            throw BusinessException.conflict("该角色已分配给 " + bound + " 个用户，不可删除");
        }
        roleMenuRepository.deleteByRoleId(id);
        roleRepository.delete(r);
    }

    // ==================== 回填接口（红线 R10） ====================
    // 缺这个接口，前端「分配菜单」弹窗每次都是空树全不选，点确定即清空该角色全部权限。

    public List<Long> getMenuIds(Long roleId) {
        return roleMenuRepository.findByRoleId(roleId).stream()
            .map(SysRoleMenu::getMenuId).toList();
    }

    @Transactional
    public void assignMenus(Long roleId, AssignMenusRequest req) {
        get(roleId);
        roleMenuRepository.deleteByRoleId(roleId);
        assignMenusInternal(roleId, req.getMenuIds());
    }

    private void assignMenusInternal(Long roleId, List<Long> menuIds) {
        if (menuIds == null) return;
        for (Long mid : menuIds) {
            if (mid == null) continue;
            SysRoleMenu rm = new SysRoleMenu();
            rm.setRoleId(roleId);
            rm.setMenuId(mid);
            roleMenuRepository.save(rm);
        }
    }
}
