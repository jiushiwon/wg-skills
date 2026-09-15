package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.dto.upload.UploadResponse;
import com.example.demo.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Tag(name = "文件上传")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @Operation(summary = "单文件上传")
    @PostMapping("/upload")
    public ApiResponse<UploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.success(uploadService.upload(file));
    }

    @Operation(summary = "多文件上传")
    @PostMapping("/uploads")
    public ApiResponse<List<UploadResponse>> uploads(@RequestParam("files") MultipartFile[] files) throws IOException {
        return ApiResponse.success(uploadService.uploadMultiple(List.of(files)));
    }
}