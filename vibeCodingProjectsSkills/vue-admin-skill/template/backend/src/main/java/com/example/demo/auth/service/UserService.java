package com.example.demo.auth.service;

import com.example.demo.auth.dto.AssignPostsRequest;
import com.example.demo.auth.dto.AssignRolesRequest;
import com.example.demo.auth.dto.CreateUserRequest;
import com.example.demo.auth.dto.SimpleRefVO;
import com.example.demo.auth.dto.UpdateUserRequest;
import com.example.demo.auth.dto.UserVO;
import com.example.demo.auth.entity.SysOrg;
import com.example.demo.auth.entity.SysPost;
import com.example.demo.auth.entity.SysRole;
import com.example.demo.auth.entity.SysUser;
import com.example.demo.auth.entity.SysUserPost;
import com.example.demo.auth.entity.SysUserRole;
import com.example.demo.auth.mapper.UserMapper;
import com.example.demo.auth.permission.DataScopeFilter;
import com.example.demo.auth.repository.SysOrgRepository;
import com.example.demo.auth.repository.SysPostRepository;
import com.example.demo.auth.repository.SysRoleRepository;
import com.example.demo.auth.repository.SysUserPostRepository;
import com.example.demo.auth.repository.SysUserRepository;
import com.example.demo.auth.repository.SysUserRoleRepository;
import com.example.demo.common.BusinessException;
import com.example.demo.common.PageRequest;
import com.example.demo.common.PageResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserRepository userRepository;
    private final SysUserRoleRepository userRoleRepository;
    private final SysUserPostRepository userPostRepository;
    private final SysRoleRepository roleRepository;
    private final SysPostRepository postRepository;
    private final SysOrgRepository orgRepository;
    private final UserMapper userMapper;
    private final DataScopeFilter dataScopeFilter;
    private final PasswordEncoder passwordEncoder;

    /**
     * 用户分页列表。
     *
     * <p>数据权限统一走 {@link DataScopeFilter#scopeUser(Long)}（self 列 = `id`，org 列 = `orgId`），
     * 不再在 Service 里手写 scope 分支 —— 手写版本会把 DEPT_* 档静默折叠成 SELF_ONLY。</p>
     */
    public PageResponse<UserVO> page(PageRequest pageReq, String username, Integer status, Long currentUserId) {
        Specification<SysUser> base = (root, q, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            ps.add(cb.isNull(root.get("deletedAt")));
            if (username != null && !username.isBlank()) {
                ps.add(cb.like(root.get("username"), "%" + username + "%"));
            }
            if (status != null) {
                ps.add(cb.equal(root.get("status"), status));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };

        // ★ 四级数据权限叠加（ALL / DEPT_AND_BELOW / DEPT_ONLY / SELF_ONLY）
        Specification<SysUser> spec = base.and(dataScopeFilter.scopeUser(currentUserId));
        var page = userRepository.findAll(spec, pageReq.toJpaPageRequest());

        Map<Long, String> orgNames = orgNames(page.getContent().stream()
            .map(SysUser::getOrgId).filter(Objects::nonNull).collect(Collectors.toSet()));

        return PageResponse.from(page.map(u -> userMapper.toVO(u, orgNames.get(u.getOrgId()))));
    }

    public SysUser get(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("用户不存在"));
    }

    /** 用户详情：在列表字段基础上带 `roles` / `posts`（形如 `[{id,name,code}]`）。 */
    public UserVO getVO(Long id) {
        SysUser u = get(id);
        UserVO vo = userMapper.toVO(u, orgName(u.getOrgId()));
        vo.setRoles(roleRefs(getRoleIds(id)));
        vo.setPosts(postRefs(getPostIds(id)));
        return vo;
    }

    @Transactional
    public UserVO create(CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw BusinessException.conflict("用户名已存在");
        }
        SysUser u = userMapper.toEntity(req);
        u = userRepository.save(u);
        assignRolesInternal(u.getId(), req.getRoleIds());
        assignPostsInternal(u.getId(), req.getPostIds());
        return getVO(u.getId());
    }

    @Transactional
    public UserVO update(Long id, UpdateUserRequest req) {
        SysUser u = get(id);
        userMapper.updateEntity(u, req);
        userRepository.save(u);
        return getVO(id);
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        if (id.equals(currentUserId)) {
            throw BusinessException.badRequest("不能删除当前登录用户");
        }
        SysUser u = get(id);
        if ("admin".equals(u.getUsername())) {
            throw BusinessException.badRequest("内置管理员不可删除");
        }
        u.setDeletedAt(LocalDateTime.now());
        userRepository.save(u);
        userRoleRepository.deleteByUserId(id);
        userPostRepository.deleteByUserId(id);
    }

    @Transactional
    public void assignRoles(Long userId, AssignRolesRequest req) {
        get(userId);
        userRoleRepository.deleteByUserId(userId);
        assignRolesInternal(userId, req.getRoleIds());
    }

    @Transactional
    public void assignPosts(Long userId, AssignPostsRequest req) {
        get(userId);
        userPostRepository.deleteByUserId(userId);
        assignPostsInternal(userId, req.getPostIds());
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        SysUser u = get(id);
        u.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }

    // ==================== 回填接口（红线 R10） ====================
    // 缺这两个接口，前端「分配角色 / 分配岗位」弹窗每次都空选，点确定即清空已有分配。

    public List<Long> getRoleIds(Long userId) {
        return userRoleRepository.findByUserId(userId).stream()
            .map(SysUserRole::getRoleId).toList();
    }

    public List<Long> getPostIds(Long userId) {
        return userPostRepository.findByUserId(userId).stream()
            .map(SysUserPost::getPostId).toList();
    }

    // ==================== 内部方法 ====================

    private void assignRolesInternal(Long userId, List<Long> roleIds) {
        if (roleIds == null) return;
        for (Long rid : roleIds) {
            if (rid == null) continue;
            SysUserRole ur = new SysUserRole();
            ur.setUserId(userId);
            ur.setRoleId(rid);
            userRoleRepository.save(ur);
        }
    }

    private void assignPostsInternal(Long userId, List<Long> postIds) {
        if (postIds == null) return;
        for (Long pid : postIds) {
            if (pid == null) continue;
            SysUserPost up = new SysUserPost();
            up.setUserId(userId);
            up.setPostId(pid);
            userPostRepository.save(up);
        }
    }

    private List<SimpleRefVO> roleRefs(List<Long> roleIds) {
        if (roleIds.isEmpty()) return List.of();
        List<SimpleRefVO> refs = new ArrayList<>();
        for (SysRole r : roleRepository.findAllById(roleIds)) {
            refs.add(ref(r.getId(), r.getName(), r.getCode()));
        }
        return refs;
    }

    private List<SimpleRefVO> postRefs(List<Long> postIds) {
        if (postIds.isEmpty()) return List.of();
        List<SimpleRefVO> refs = new ArrayList<>();
        for (SysPost p : postRepository.findAllById(postIds)) {
            refs.add(ref(p.getId(), p.getName(), p.getCode()));
        }
        return refs;
    }

    private SimpleRefVO ref(Long id, String name, String code) {
        SimpleRefVO r = new SimpleRefVO();
        r.setId(id);
        r.setName(name);
        r.setCode(code);
        return r;
    }

    private String orgName(Long orgId) {
        if (orgId == null) return null;
        return orgRepository.findById(orgId).map(SysOrg::getName).orElse(null);
    }

    private Map<Long, String> orgNames(Set<Long> orgIds) {
        Map<Long, String> names = new HashMap<>();
        if (orgIds.isEmpty()) return names;
        for (SysOrg o : orgRepository.findAllById(orgIds)) {
            names.put(o.getId(), o.getName());
        }
        return names;
    }
}
