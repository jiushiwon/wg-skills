package com.example.demo.auth.mapper;

import com.example.demo.auth.dto.CreateUserRequest;
import com.example.demo.auth.dto.UpdateUserRequest;
import com.example.demo.auth.dto.UserVO;
import com.example.demo.auth.entity.SysUser;
import com.example.demo.common.DateTimeFormat;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * User 实体 ↔ DTO 转换。
 */
@Component
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public UserMapper(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public SysUser toEntity(CreateUserRequest req) {
        SysUser u = new SysUser();
        u.setUsername(req.getUsername());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setNickname(req.getNickname());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setAvatar(req.getAvatar());
        if (req.getTenantId() != null) u.setTenantId(req.getTenantId());
        u.setOrgId(req.getOrgId());
        u.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        return u;
    }

    public void updateEntity(SysUser u, UpdateUserRequest req) {
        if (req.getNickname() != null) u.setNickname(req.getNickname());
        if (req.getEmail() != null) u.setEmail(req.getEmail());
        if (req.getPhone() != null) u.setPhone(req.getPhone());
        if (req.getAvatar() != null) u.setAvatar(req.getAvatar());
        if (req.getOrgId() != null) u.setOrgId(req.getOrgId());
        if (req.getStatus() != null) u.setStatus(req.getStatus());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode(req.getPassword()));
        }
    }

    /**
     * 实体 → 视图对象。★ 不映射 `password`（红线 R5）。
     *
     * @param orgName 部门名称，由调用方批量反查后传入，避免 N+1
     */
    public UserVO toVO(SysUser u, String orgName) {
        UserVO vo = new UserVO();
        vo.setId(u.getId());
        vo.setUsername(u.getUsername());
        vo.setNickname(u.getNickname());
        vo.setEmail(u.getEmail());
        vo.setPhone(u.getPhone());
        vo.setAvatar(u.getAvatar());
        vo.setTenantId(u.getTenantId());
        vo.setOrgId(u.getOrgId());
        vo.setOrgName(orgName);
        vo.setStatus(u.getStatus());
        vo.setCreatedAt(DateTimeFormat.format(u.getCreatedAt()));
        vo.setUpdatedAt(DateTimeFormat.format(u.getUpdatedAt()));
        return vo;
    }
}
