package com.example.demo.auth.controller;

import com.example.demo.auth.dto.CreatePostRequest;
import com.example.demo.auth.dto.PostVO;
import com.example.demo.auth.service.PostService;
import com.example.demo.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "岗位管理")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @Operation(summary = "岗位列表")
    @PreAuthorize("hasAuthority('system:post:list')")
    @GetMapping
    public ApiResponse<List<PostVO>> list() {
        return ApiResponse.success(postService.list());
    }

    @Operation(summary = "创建岗位")
    @PreAuthorize("hasAuthority('system:post:create')")
    @PostMapping
    public ApiResponse<PostVO> create(@Valid @RequestBody CreatePostRequest req) {
        return ApiResponse.success(postService.create(req));
    }

    @Operation(summary = "更新岗位")
    @PreAuthorize("hasAuthority('system:post:edit')")
    @PutMapping("/{id}")
    public ApiResponse<PostVO> update(@PathVariable Long id, @RequestBody CreatePostRequest req) {
        return ApiResponse.success(postService.update(id, req));
    }

    @Operation(summary = "删除岗位（软删除）")
    @PreAuthorize("hasAuthority('system:post:delete')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ApiResponse.success(null);
    }
}
