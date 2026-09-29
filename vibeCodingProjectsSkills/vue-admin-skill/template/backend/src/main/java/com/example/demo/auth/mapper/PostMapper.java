package com.example.demo.auth.mapper;

import com.example.demo.auth.dto.CreatePostRequest;
import com.example.demo.auth.dto.PostVO;
import com.example.demo.auth.entity.SysPost;
import com.example.demo.common.DateTimeFormat;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public SysPost toEntity(CreatePostRequest req) {
        SysPost p = new SysPost();
        p.setName(req.getName());
        p.setCode(req.getCode());
        p.setSortOrder(req.getSortOrder() == null ? 0 : req.getSortOrder());
        p.setStatus(req.getStatus() == null ? 1 : req.getStatus());
        if (req.getTenantId() != null) p.setTenantId(req.getTenantId());
        return p;
    }

    public PostVO toVO(SysPost p) {
        PostVO vo = new PostVO();
        vo.setId(p.getId());
        vo.setName(p.getName());
        vo.setCode(p.getCode());
        vo.setTenantId(p.getTenantId());
        vo.setSortOrder(p.getSortOrder());
        vo.setStatus(p.getStatus());
        vo.setCreatedAt(DateTimeFormat.format(p.getCreatedAt()));
        return vo;
    }
}
