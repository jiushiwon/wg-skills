package com.example.demo.auth.service;

import com.example.demo.auth.dto.ChangePasswordRequest;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.LoginResponse;
import com.example.demo.auth.dto.MenuNode;
import com.example.demo.auth.dto.RefreshTokenRequest;
import com.example.demo.auth.dto.UserInfoResponse;
import com.example.demo.auth.entity.SysMenu;
import com.example.demo.auth.entity.SysUser;
import com.example.demo.auth.mapper.MenuMapper;
import com.example.demo.auth.repository.SysMenuRepository;
import com.example.demo.auth.repository.SysRoleMenuRepository;
import com.example.demo.auth.repository.SysUserRepository;
import com.example.demo.auth.repository.SysUserRoleRepository;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserRepository userRepository;
    private final SysUserRoleRepository userRoleRepository;
    private final SysRoleMenuRepository roleMenuRepository;
    private final SysMenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MenuMapper menuMapper;

    @Transactional
    public LoginResponse login(LoginRequest req) {
        SysUser user = userRepository.findByUsername(req.getUsername())
            .orElseThrow(() -> BusinessException.badRequest("用户名或密码错误"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw BusinessException.badRequest("用户名或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw BusinessException.forbidden("账号已禁用");
        }
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        long expiresIn = jwtUtil.getAccessExpireMinutes() * 60L;
        return new LoginResponse(accessToken, refreshToken, "Bearer", expiresIn);
    }

    /**
     * 刷新令牌：入参 refreshToken，出参同登录。
     *
     * <p>只接受 `type=refresh` 的令牌；access token 拿来刷新会被拒（避免无限续期绕过有效期）。</p>
     */
    public LoginResponse refresh(RefreshTokenRequest req) {
        Claims claims;
        try {
            claims = jwtUtil.parse(req.getRefreshToken());
        } catch (Exception e) {
            throw BusinessException.unauthorized("刷新令牌无效或已过期");
        }
        if (!"refresh".equals(jwtUtil.getTokenType(claims))) {
            throw BusinessException.unauthorized("令牌类型错误，需要 refreshToken");
        }
        Long userId = jwtUtil.getUserId(claims);
        if (userId == null) {
            throw BusinessException.unauthorized("刷新令牌无效");
        }
        SysUser user = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw BusinessException.forbidden("账号已禁用");
        }
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());
        long expiresIn = jwtUtil.getAccessExpireMinutes() * 60L;
        return new LoginResponse(accessToken, refreshToken, "Bearer", expiresIn);
    }

    public UserInfoResponse me(Long userId) {
        SysUser user = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
        List<String> roleCodes = userRoleRepository.findRoleCodesByUserId(userId);
        Set<String> permissions = new java.util.HashSet<>(roleMenuRepository.findPermissionsByUserId(userId));
        return UserInfoResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .email(user.getEmail())
            .phone(user.getPhone())
            .avatar(user.getAvatar())
            .tenantId(user.getTenantId())
            .orgId(user.getOrgId())
            .status(user.getStatus())
            .roles(roleCodes)
            .permissions(new ArrayList<>(permissions))
            .build();
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        SysUser user = userRepository.findById(userId)
            .orElseThrow(() -> BusinessException.unauthorized("用户不存在"));
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw BusinessException.badRequest("旧密码错误");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public List<MenuNode> getMenus(Long userId) {
        List<Long> menuIds = roleMenuRepository.findMenuIdsByUserId(userId);
        if (menuIds.isEmpty()) return List.of();
        List<SysMenu> menus = menuRepository.findAllById(menuIds);
        return buildMenuTree(menus);
    }

    private List<MenuNode> buildMenuTree(List<SysMenu> all) {
        List<MenuNode> nodes = all.stream().map(menuMapper::toNode).toList();
        Map<Long, MenuNode> byId = new HashMap<>();
        for (MenuNode n : nodes) byId.put(n.getId(), n);
        List<MenuNode> roots = new ArrayList<>();
        for (MenuNode n : nodes) {
            if (n.getParentId() == null) {
                roots.add(n);
            } else {
                MenuNode parent = byId.get(n.getParentId());
                if (parent != null) {
                    parent.getChildren().add(n);
                } else {
                    roots.add(n);
                }
            }
        }
        // 按 sortOrder 排序
        sortTree(roots);
        return roots;
    }

    private void sortTree(List<MenuNode> nodes) {
        nodes.sort((a, b) -> {
            Integer sa = a.getSortOrder() == null ? 0 : a.getSortOrder();
            Integer sb = b.getSortOrder() == null ? 0 : b.getSortOrder();
            return Integer.compare(sa, sb);
        });
        for (MenuNode n : nodes) sortTree(n.getChildren());
    }
}
