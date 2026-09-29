package com.example.demo.auth.mapper;

import com.example.demo.auth.dto.CreateOrgRequest;
import com.example.demo.auth.dto.OrgNode;
import com.example.demo.auth.entity.SysOrg;
import org.springframework.stereotype.Component;

@Component
public class OrgMapper {

    public SysOrg toEntity(CreateOrgRequest req) {
        SysOrg o = new SysOrg();
        o.setParentId(req.getParentId());
        o.setName(req.getName());
        o.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        o.setLeaderUserId(req.getLeaderUserId());
        o.setPhone(req.getPhone());
        o.setEmail(req.getEmail());
        o.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        if (req.getTenantId() != null) o.setTenantId(req.getTenantId());
        return o;
    }

    public OrgNode toNode(SysOrg o) {
        OrgNode n = new OrgNode();
        n.setId(o.getId());
        n.setParentId(o.getParentId());
        n.setName(o.getName());
        n.setSortOrder(o.getSortOrder());
        n.setLeaderUserId(o.getLeaderUserId());
        n.setPhone(o.getPhone());
        n.setEmail(o.getEmail());
        n.setStatus(o.getStatus());
        return n;
    }
}