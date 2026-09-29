package com.example.demo.auth.mapper;

import com.example.demo.auth.dto.CreateMenuRequest;
import com.example.demo.auth.dto.MenuNode;
import com.example.demo.auth.dto.UpdateMenuRequest;
import com.example.demo.auth.entity.SysMenu;
import org.springframework.stereotype.Component;

@Component
public class MenuMapper {

    public SysMenu toEntity(CreateMenuRequest req) {
        SysMenu m = new SysMenu();
        m.setParentId(req.getParentId());
        m.setName(req.getName());
        m.setPath(req.getPath());
        m.setComponent(req.getComponent());
        m.setMenuType(req.getMenuType() == null ? "M" : req.getMenuType());
        m.setIcon(req.getIcon());
        m.setPermission(req.getPermission());
        m.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        m.setVisible(req.getVisible() == null ? 1 : req.getVisible());
        m.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        if (req.getTenantId() != null) m.setTenantId(req.getTenantId());
        return m;
    }

    public void updateEntity(SysMenu m, UpdateMenuRequest req) {
        if (req.getParentId() != null) m.setParentId(req.getParentId());
        if (req.getName() != null) m.setName(req.getName());
        if (req.getPath() != null) m.setPath(req.getPath());
        if (req.getComponent() != null) m.setComponent(req.getComponent());
        if (req.getMenuType() != null) m.setMenuType(req.getMenuType());
        if (req.getIcon() != null) m.setIcon(req.getIcon());
        if (req.getPermission() != null) m.setPermission(req.getPermission());
        if (req.getSortOrder() != null) m.setSortOrder(req.getSortOrder());
        if (req.getVisible() != null) m.setVisible(req.getVisible());
        if (req.getStatus() != null) m.setStatus(req.getStatus());
    }

    public MenuNode toNode(SysMenu m) {
        MenuNode n = new MenuNode();
        n.setId(m.getId());
        n.setParentId(m.getParentId());
        n.setName(m.getName());
        n.setPath(m.getPath());
        n.setComponent(m.getComponent());
        n.setMenuType(m.getMenuType());
        n.setIcon(m.getIcon());
        n.setPermission(m.getPermission());
        n.setSortOrder(m.getSortOrder());
        n.setVisible(m.getVisible());
        n.setStatus(m.getStatus());
        return n;
    }
}
