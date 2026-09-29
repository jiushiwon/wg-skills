package com.example.demo.auth.service;

import com.example.demo.auth.dto.CreatePostRequest;
import com.example.demo.auth.dto.PostVO;
import com.example.demo.auth.entity.SysPost;
import com.example.demo.auth.mapper.PostMapper;
import com.example.demo.auth.repository.SysPostRepository;
import com.example.demo.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final SysPostRepository postRepository;
    private final PostMapper postMapper;

    public List<PostVO> list() {
        return postRepository.findAll().stream().map(postMapper::toVO).toList();
    }

    @Transactional
    public PostVO create(CreatePostRequest req) {
        if (postRepository.existsByCode(req.getCode())) {
            throw BusinessException.conflict("岗位编码已存在");
        }
        return postMapper.toVO(postRepository.save(postMapper.toEntity(req)));
    }

    @Transactional
    public PostVO update(Long id, CreatePostRequest req) {
        SysPost p = get(id);
        if (req.getName() != null) p.setName(req.getName());
        if (req.getCode() != null) p.setCode(req.getCode());
        if (req.getSortOrder() != null) p.setSortOrder(req.getSortOrder());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        if (req.getTenantId() != null) p.setTenantId(req.getTenantId());
        return postMapper.toVO(postRepository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        SysPost p = get(id);
        p.setDeletedAt(LocalDateTime.now());
        postRepository.save(p);
    }

    public SysPost get(Long id) {
        return postRepository.findById(id)
            .orElseThrow(() -> BusinessException.notFound("岗位不存在"));
    }
}