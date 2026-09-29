package com.example.demo.auth.service;

import com.example.demo.auth.dto.CreateTenantRequest;
import com.example.demo.auth.dto.TenantVO;
import com.example.demo.auth.entity.SysTenant;
import com.example.demo.auth.repository.SysTenantRepository;
import com.example.demo.common.BusinessException;
import com.example.demo.common.DateTimeFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final SysTenantRepository tenantRepository;

    public List<TenantVO> list() {
        return tenantRepository.findAll().stream().map(this::toVO).toList();
    }

    @Transactional
    public TenantVO create(CreateTenantRequest req) {
        if (tenantRepository.existsByCode(req.getCode())) {
            throw BusinessException.conflict("租户编码已存在");
        }
        SysTenant t = new SysTenant();
        t.setName(req.getName());
        t.setCode(req.getCode());
        t.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        return toVO(tenantRepository.save(t));
    }

    @Transactional
    public TenantVO update(Long id, CreateTenantRequest req) {
        SysTenant t = get(id);
        if (req.getName() != null) t.setName(req.getName());
        if (req.getCode() != null) t.setCode(req.getCode());
        if (req.getStatus() != null) t.setStatus(req.getStatus());
        return toVO(tenantRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        SysTenant t = get(id);
        t.setDeletedAt(LocalDateTime.now());
        tenantRepository.save(t);
    }

    public SysTenant get(Long id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("租户不存在"));
    }

    private TenantVO toVO(SysTenant t) {
        TenantVO vo = new TenantVO();
        vo.setId(t.getId());
        vo.setName(t.getName());
        vo.setCode(t.getCode());
        vo.setStatus(t.getStatus());
        vo.setCreatedAt(DateTimeFormat.format(t.getCreatedAt()));
        vo.setUpdatedAt(DateTimeFormat.format(t.getUpdatedAt()));
        return vo;
    }
}
