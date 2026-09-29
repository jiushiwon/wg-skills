package com.example.demo.auth.service;

import com.example.demo.auth.dto.CreateOrgRequest;
import com.example.demo.auth.dto.OrgNode;
import com.example.demo.auth.entity.SysOrg;
import com.example.demo.auth.mapper.OrgMapper;
import com.example.demo.auth.repository.SysOrgRepository;
import com.example.demo.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrgService {

    private final SysOrgRepository orgRepository;
    private final OrgMapper orgMapper;

    public List<OrgNode> tree() {
        List<SysOrg> all = orgRepository.findAllByOrderBySortOrderAscIdAsc();
        List<OrgNode> nodes = all.stream().map(orgMapper::toNode).toList();
        Map<Long, OrgNode> byId = new HashMap<>();
        for (OrgNode n : nodes) byId.put(n.getId(), n);
        List<OrgNode> roots = new ArrayList<>();
        for (OrgNode n : nodes) {
            if (n.getParentId() == null) {
                roots.add(n);
            } else {
                OrgNode p = byId.get(n.getParentId());
                if (p != null) p.getChildren().add(n);
                else roots.add(n);
            }
        }
        return roots;
    }

    @Transactional
    public OrgNode create(CreateOrgRequest req) {
        return orgMapper.toNode(orgRepository.save(orgMapper.toEntity(req)));
    }

    @Transactional
    public OrgNode update(Long id, CreateOrgRequest req) {
        SysOrg o = get(id);
        if (req.getParentId() != null) o.setParentId(req.getParentId());
        if (req.getName() != null) o.setName(req.getName());
        if (req.getSortOrder() != null) o.setSortOrder(req.getSortOrder());
        if (req.getLeaderUserId() != null) o.setLeaderUserId(req.getLeaderUserId());
        if (req.getPhone() != null) o.setPhone(req.getPhone());
        if (req.getEmail() != null) o.setEmail(req.getEmail());
        if (req.getStatus() != null) o.setStatus(req.getStatus());
        return orgMapper.toNode(orgRepository.save(o));
    }

    @Transactional
    public void delete(Long id) {
        SysOrg o = get(id);
        if (orgRepository.countByParentIdAndDeletedAtIsNull(id) > 0) {
            throw BusinessException.conflict("存在子部门，不可删除");
        }
        o.setDeletedAt(java.time.LocalDateTime.now());
        orgRepository.save(o);
    }

    public SysOrg get(Long id) {
        return orgRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("组织不存在"));
    }
}