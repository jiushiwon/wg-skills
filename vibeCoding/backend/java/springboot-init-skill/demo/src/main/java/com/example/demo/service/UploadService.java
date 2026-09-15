package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.dto.upload.UploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    @Value("${upload.allowed-types:jpg,jpeg,png,gif,pdf}")
    private String allowedTypesStr;

    @Value("${upload.allowed-mime-types:image/jpeg,image/png,image/gif,application/pdf}")
    private String allowedMimeTypesStr;

    @Value("${upload.max-size-bytes:10485760}")
    private long maxSizeBytes;

    private List<String> allowedTypes;
    private List<String> allowedMimeTypes;

    @PostConstruct
    public void init() {
        this.allowedTypes = Arrays.asList(allowedTypesStr.split(","));
        this.allowedMimeTypes = Arrays.asList(allowedMimeTypesStr.split(","));
        try {
            Path p = Paths.get(uploadDir);
            if (!Files.exists(p)) {
                Files.createDirectories(p);
                log.info("创建上传目录: {}", p.toAbsolutePath());
            }
        } catch (IOException e) {
            log.warn("上传目录初始化失败: {}", e.getMessage());
        }
    }

    public UploadResponse upload(MultipartFile file) throws IOException {
        validate(file);
        String ext = getExtension(file.getOriginalFilename());
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path target = Paths.get(uploadDir, dateDir, filename);
        Files.createDirectories(target.getParent());
        file.transferTo(target.toFile());
        String url = "/uploads/" + dateDir + "/" + filename;
        log.info("文件上传: {} -> {}", file.getOriginalFilename(), target.toAbsolutePath());
        return new UploadResponse(url, file.getSize(), file.getContentType(), file.getOriginalFilename());
    }

    public List<UploadResponse> uploadMultiple(List<MultipartFile> files) throws IOException {
        return files.stream().map(f -> {
            try {
                return upload(f);
            } catch (IOException e) {
                throw new RuntimeException("上传失败: " + f.getOriginalFilename(), e);
            }
        }).toList();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("文件为空");
        }
        if (file.getSize() > maxSizeBytes) {
            throw BusinessException.badRequest("文件超过最大尺寸 " + (maxSizeBytes / 1024 / 1024) + "MB");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!allowedTypes.contains(ext.toLowerCase())) {
            throw BusinessException.badRequest("不允许的文件类型: " + ext);
        }
        String mime = file.getContentType();
        if (mime != null && !allowedMimeTypes.contains(mime.toLowerCase())) {
            throw BusinessException.badRequest("不允许的文件内容类型: " + mime);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}