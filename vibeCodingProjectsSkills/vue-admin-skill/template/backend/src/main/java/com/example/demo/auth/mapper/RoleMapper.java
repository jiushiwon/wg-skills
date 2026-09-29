package com.example.demo.auth.mapper;

import com.example.demo.auth.dto.CreateRoleRequest;
import com.example.demo.auth.dto.RoleVO;
import com.example.demo.auth.dto.UpdateRoleRequest;
import com.example.demo.auth.entity.SysRole;
import com.example.demo.common.DateTimeFormat;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public SysRole toEntity(CreateRoleRequest req) {
        SysRole r = new SysRole();
        r.setName(req.getName());
        r.setCode(req.getCode());
        r.setDescription(req.getDescription());
        if (req.getDataScope() != null) {
            r.setDataScope(req.getDataScope().name());
        }
        r.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        r.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        return r;
    }

    public void updateEntity(SysRole r, UpdateRoleRequest req) {
        if (req.getName() != null) r.setName(req.getName());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getDataScope() != null) r.setDataScope(req.getDataScope().name());
        if (req.getSortOrder() != null) r.setSortOrder(req.getSortOrder());
        if (req.getStatus() != null) r.setStatus(req.getStatus());
    }

    /**
     * 实体 → 视图对象。
     *
     * @param menuCount 已授权菜单数，由 {@code SysRoleMenuRepository.countByRoleId} 计数后传入
     */
    public RoleVO toVO(SysRole r, long menuCount) {
        RoleVO vo = new RoleVO();
        vo.setId(r.getId());
        vo.setName(r.getName());
        vo.setCode(r.getCode());
        vo.setDescription(r.getDescription());
        vo.setDataScope(r.getDataScope());
        vo.setSortOrder(r.getSortOrder());
        vo.setStatus(r.getStatus());
        vo.setMenuCount(menuCount);
        vo.setCreatedAt(DateTimeFormat.format(r.getCreatedAt()));
        return vo;
    }
}
