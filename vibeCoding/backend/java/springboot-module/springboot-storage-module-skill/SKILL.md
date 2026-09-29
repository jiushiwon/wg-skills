---
name: springboot-storage-module-skill
description: Spring Boot 静态资源库模块技能。面向已有 Spring Boot 项目，提供小文件直接上传、大文件切割上传、文件压缩、下载、预览、附件管理等能力。触发词："静态资源模块"、"文件上传下载"、"大文件上传"、"文件压缩"、"storage module"、"资源管理"、"附件管理"。
---

# Spring Boot Storage Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成静态资源管理能力。

## 定位

- 目标：在已有骨架上，添加可运行的静态资源管理模块。
- 不替代：不重复生成基础骨架已有的统一响应、JWT 等基础设施。
- 输出：实体、仓储、服务、控制器、迁移文件、接口契约。

## 骨架依赖

> 本模块是 `springboot-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足：**
1. ✅ 已安装 `springboot-init-skill`（项目骨架）
2. ✅ 骨架包含：统一响应、JWT、分页、目录结构

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **小文件上传** | 单文件/多文件直接上传（< 10MB） |
| 2 | **大文件切割上传** | 分片上传 + 断点续传（≥ 10MB） |
| 3 | **文件压缩** | 可选开启，支持 gzip/zip 压缩存储 |
| 4 | **文件下载** | 流式下载、断点续传下载 |
| 5 | **文件预览** | 图片/视频/文档在线预览 |
| 6 | **存储策略** | 本地存储 / 阿里云 OSS / 腾讯云 COS / MinIO |
| 7 | **附件管理** | 附件 CRUD、分类、标签 |
| 8 | **图片处理** | 缩略图、水印、格式转换 |

## 用户问题（最多 3 个）

```
1. 现有项目的包名是什么？（默认从骨架推断，如 com.koala.myapp）
2. 表前缀是什么？（默认 wg）
3. 默认存储方式是什么？（local / aliyun / tencent / minio，默认 local）
```

## 配置结构

```yaml
# application.yml
storage:
  # 存储方式: local / aliyun / tencent / minio
  type: local
  
  # 文件限制
  max-size: 104857600  # 100MB
  allowed-types: jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip,mp4,mp3
  
  # 分片上传配置
  chunk:
    enabled: true
    size: 5242880  # 5MB 每片
    threshold: 10485760  # 10MB 触发分片上传
  
  # 压缩配置
  compress:
    enabled: false
    types: jpg,jpeg,png  # 需要压缩的文件类型
    quality: 0.8  # 压缩质量 0-1
    max-size: 1048576  # 1MB 以上才压缩
  
  # 本地存储
  local:
    path: ./uploads
    domain: http://localhost:8080
  
  # 阿里云 OSS
  aliyun:
    access-key: ${ALIYUN_ACCESS_KEY:}
    secret-key: ${ALIYUN_SECRET_KEY:}
    bucket: ${ALIYUN_BUCKET:}
    endpoint: oss-cn-hangzhou.aliyuncs.com
  
  # 腾讯云 COS
  tencent:
    secret-id: ${TENCENT_SECRET_ID:}
    secret-key: ${TENCENT_SECRET_KEY:}
    bucket: ${TENCENT_BUCKET:}
    region: ap-guangzhou
  
  # MinIO
  minio:
    endpoint: http://localhost:9000
    access-key: ${MINIO_ACCESS_KEY:minioadmin}
    secret-key: ${MINIO_SECRET_KEY:minioadmin}
    bucket: ${MINIO_BUCKET:uploads}
```

## 配置属性类

```java
@Data
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    private String type = "local";
    private long maxSize = 100 * 1024 * 1024; // 100MB
    private List<String> allowedTypes;
    private Chunk chunk = new Chunk();
    private Compress compress = new Compress();
    private Local local = new Local();
    private Aliyun aliyun = new Aliyun();
    private Tencent tencent = new Tencent();
    private Minio minio = new Minio();
    
    @Data
    public static class Chunk {
        private boolean enabled = true;
        private long size = 5 * 1024 * 1024; // 5MB
        private long threshold = 10 * 1024 * 1024; // 10MB
    }
    
    @Data
    public static class Compress {
        private boolean enabled = false;
        private List<String> types = List.of("jpg", "jpeg", "png");
        private double quality = 0.8;
        private long maxSize = 1024 * 1024; // 1MB
    }
    
    @Data
    public static class Local {
        private String path = "./uploads";
        private String domain = "http://localhost:8080";
    }
    
    @Data
    public static class Aliyun {
        private String accessKey;
        private String secretKey;
        private String bucket;
        private String endpoint;
    }
    
    @Data
    public static class Tencent {
        private String secretId;
        private String secretKey;
        private String bucket;
        private String region;
    }
    
    @Data
    public static class Minio {
        private String endpoint;
        private String accessKey;
        private String secretKey;
        private String bucket;
    }
}
```

## 模块结构

```
src/main/java/{basePackage}/storage/
├── common/
│   ├── StorageConstants.java         # 常量
│   └── StorageException.java         # 异常
├── config/
│   └── StorageConfig.java           # 配置类
├── controller/
│   ├── UploadController.java        # 上传接口
│   ├── DownloadController.java      # 下载接口
│   └── AttachmentController.java    # 附件管理接口
├── dto/
│   ├── UploadResult.java            # 上传结果
│   ├── ChunkUploadInit.java         # 分片初始化请求
│   ├── ChunkUploadRequest.java      # 分片上传请求
│   └── AttachmentDTO.java           # 附件 DTO
├── entity/
│   ├── Attachment.java              # 附件实体
│   └── ChunkInfo.java               # 分片信息实体
├── repository/
│   ├── AttachmentRepository.java    # 附件仓储
│   └── ChunkInfoRepository.java     # 分片信息仓储
└── service/
    ├── StorageService.java          # 存储策略接口
    ├── impl/
    │   ├── LocalStorageService.java # 本地存储
    │   ├── OssStorageService.java   # 阿里云 OSS
    │   ├── CosStorageService.java   # 腾讯云 COS
    │   └── MinioStorageService.java # MinIO
    ├── UploadService.java           # 上传服务
    ├── DownloadService.java         # 下载服务
    └── AttachmentService.java       # 附件服务

src/main/resources/db/migration/
├── V20__init_storage_module.sql     # 存储模块表结构

api-contract-storage.md              # 接口契约
docs/storage-module-guide.md         # 接入指南
```

## 核心实现

### 存储策略接口

```java
public interface StorageService {
    /**
     * 上传文件
     * @param inputStream 文件流
     * @param key 存储 key
     * @param contentType 内容类型
     * @return 访问 URL
     */
    String upload(InputStream inputStream, String key, String contentType);
    
    /**
     * 删除文件
     * @param key 存储 key
     */
    void delete(String key);
    
    /**
     * 获取文件 URL
     * @param key 存储 key
     * @return 访问 URL
     */
    String getUrl(String key);
    
    /**
     * 获取文件流
     * @param key 存储 key
     * @return 文件流
     */
    InputStream download(String key);
}
```

### 上传服务（核心）

```java
@Service
@Slf4j
public class UploadService {
    
    private final StorageService storageService;
    private final StorageProperties properties;
    private final AttachmentRepository attachmentRepository;
    private final ChunkInfoRepository chunkInfoRepository;
    private final ImageService imageService;
    
    /**
     * 上传文件（自动判断小文件/大文件）
     */
    public UploadResult upload(MultipartFile file, String category) {
        validateFile(file);
        
        // 判断是否需要分片上传
        if (needChunkUpload(file)) {
            return chunkUpload(file, category);
        }
        
        // 小文件直接上传
        return directUpload(file, category);
    }
    
    /**
     * 小文件直接上传
     */
    private UploadResult directUpload(MultipartFile file, String category) {
        try {
            String key = generateKey(file.getOriginalFilename());
            InputStream inputStream = file.getInputStream();
            
            // 是否需要压缩
            if (needCompress(file)) {
                inputStream = imageService.compress(inputStream, 
                    properties.getCompress().getQuality());
            }
            
            String url = storageService.upload(inputStream, key, file.getContentType());
            
            // 保存附件记录
            Attachment attachment = saveAttachment(file, url, key, category);
            
            return UploadResult.builder()
                .id(attachment.getId())
                .url(url)
                .filename(file.getOriginalFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .build();
        } catch (IOException e) {
            throw new StorageException("文件上传失败", e);
        }
    }
    
    /**
     * 大文件分片上传
     */
    private UploadResult chunkUpload(MultipartFile file, String category) {
        // 1. 初始化分片上传
        String uploadId = UUID.randomUUID().toString();
        long chunkSize = properties.getChunk().getSize();
        long fileSize = file.getSize();
        int totalChunks = (int) Math.ceil((double) fileSize / chunkSize);
        
        // 2. 保存分片信息
        ChunkInfo chunkInfo = new ChunkInfo();
        chunkInfo.setUploadId(uploadId);
        chunkInfo.setFilename(file.getOriginalFilename());
        chunkInfo.setFileSize(fileSize);
        chunkInfo.setChunkSize(chunkSize);
        chunkInfo.setTotalChunks(totalChunks);
        chunkInfo.setStatus(0); // 0-上传中 1-已完成
        chunkInfoRepository.save(chunkInfo);
        
        // 3. 分片上传
        try (InputStream is = file.getInputStream()) {
            byte[] buffer = new byte[(int) chunkSize];
            int chunkIndex = 0;
            int bytesRead;
            
            while ((bytesRead = is.read(buffer)) != -1) {
                String chunkKey = String.format("chunks/%s/%d", uploadId, chunkIndex);
                storageService.upload(
                    new ByteArrayInputStream(buffer, 0, bytesRead),
                    chunkKey,
                    "application/octet-stream"
                );
                chunkIndex++;
            }
            
            // 4. 合并分片
            String key = generateKey(file.getOriginalFilename());
            mergeChunks(uploadId, key, totalChunks);
            
            // 5. 更新状态
            chunkInfo.setStatus(1);
            chunkInfoRepository.save(chunkInfo);
            
            // 6. 保存附件记录
            String url = storageService.getUrl(key);
            Attachment attachment = saveAttachment(file, url, key, category);
            
            return UploadResult.builder()
                .id(attachment.getId())
                .url(url)
                .filename(file.getOriginalFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .build();
        } catch (IOException e) {
            throw new StorageException("分片上传失败", e);
        }
    }
    
    /**
     * 断点续传 - 获取已上传分片
     */
    public List<Integer> getUploadedChunks(String uploadId) {
        ChunkInfo chunkInfo = chunkInfoRepository.findByUploadId(uploadId)
            .orElseThrow(() -> new StorageException("上传任务不存在"));
        
        List<Integer> uploaded = new ArrayList<>();
        for (int i = 0; i < chunkInfo.getTotalChunks(); i++) {
            String chunkKey = String.format("chunks/%s/%d", uploadId, i);
            // 检查分片是否存在
            try {
                storageService.download(chunkKey);
                uploaded.add(i);
            } catch (Exception e) {
                // 分片不存在，跳过
            }
        }
        return uploaded;
    }
    
    /**
     * 断点续传 - 上传单个分片
     */
    public void uploadChunk(String uploadId, int chunkIndex, MultipartFile file) {
        ChunkInfo chunkInfo = chunkInfoRepository.findByUploadId(uploadId)
            .orElseThrow(() -> new StorageException("上传任务不存在"));
        
        String chunkKey = String.format("chunks/%s/%d", uploadId, chunkIndex);
        storageService.upload(file.getInputStream(), chunkKey, "application/octet-stream");
    }
    
    /**
     * 判断是否需要分片上传
     */
    private boolean needChunkUpload(MultipartFile file) {
        return properties.getChunk().isEnabled() 
            && file.getSize() >= properties.getChunk().getThreshold();
    }
    
    /**
     * 判断是否需要压缩
     */
    private boolean needCompress(MultipartFile file) {
        if (!properties.getCompress().isEnabled()) {
            return false;
        }
        if (file.getSize() < properties.getCompress().getMaxSize()) {
            return false;
        }
        String ext = getExtension(file.getOriginalFilename());
        return properties.getCompress().getTypes().contains(ext.toLowerCase());
    }
    
    /**
     * 生成存储 key
     */
    private String generateKey(String filename) {
        String ext = getExtension(filename);
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return "uploads/" + datePath + "/" + UUID.randomUUID() + "." + ext;
    }
    
    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new StorageException("文件不能为空");
        }
        if (file.getSize() > properties.getMaxSize()) {
            throw new StorageException("文件大小超过限制");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!properties.getAllowedTypes().contains(ext.toLowerCase())) {
            throw new StorageException("不支持的文件类型");
        }
    }
}
```

### 下载服务

```java
@Service
public class DownloadService {
    
    private final StorageService storageService;
    private final AttachmentRepository attachmentRepository;
    
    /**
     * 下载文件
     */
    public void download(Long attachmentId, HttpServletResponse response) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new StorageException("附件不存在"));
        
        try (InputStream is = storageService.download(attachment.getFilePath());
             OutputStream os = response.getOutputStream()) {
            
            response.setContentType(attachment.getContentType());
            response.setHeader("Content-Disposition", 
                "attachment; filename=\"" + URLEncoder.encode(attachment.getFilename(), "UTF-8") + "\"");
            response.setContentLengthLong(attachment.getFileSize());
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
        } catch (IOException e) {
            throw new StorageException("文件下载失败", e);
        }
    }
    
    /**
     * 预览文件（支持 Range 请求）
     */
    public void preview(Long attachmentId, HttpServletRequest request, HttpServletResponse response) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new StorageException("附件不存在"));
        
        // 设置响应头
        response.setContentType(attachment.getContentType());
        response.setHeader("Accept-Ranges", "bytes");
        
        // 处理 Range 请求（断点续传下载）
        String range = request.getHeader("Range");
        if (range != null) {
            long fileLength = attachment.getFileSize();
            long start = parseRangeStart(range, fileLength);
            long end = parseRangeEnd(range, fileLength);
            
            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
            response.setHeader("Content-Range", 
                String.format("bytes %d-%d/%d", start, end, fileLength));
            response.setContentLengthLong(end - start + 1);
            
            try (InputStream is = storageService.download(attachment.getFilePath())) {
                is.skip(start);
                OutputStream os = response.getOutputStream();
                byte[] buffer = new byte[8192];
                long remaining = end - start + 1;
                int bytesRead;
                while (remaining > 0 && (bytesRead = is.read(buffer, 0, 
                    (int) Math.min(buffer.length, remaining))) != -1) {
                    os.write(buffer, 0, bytesRead);
                    remaining -= bytesRead;
                }
            } catch (IOException e) {
                throw new StorageException("文件预览失败", e);
            }
        } else {
            download(attachmentId, response);
        }
    }
}
```

### 上传接口

```java
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class UploadController {
    
    private final UploadService uploadService;
    
    /**
     * 上传文件（自动判断小文件/大文件）
     */
    @PostMapping("/upload")
    public Result<UploadResult> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "default") String category) {
        return Result.success(uploadService.upload(file, category));
    }
    
    /**
     * 初始化分片上传（大文件）
     */
    @PostMapping("/upload/chunk/init")
    public Result<ChunkUploadInit> initChunkUpload(
            @RequestParam("filename") String filename,
            @RequestParam("fileSize") Long fileSize) {
        return Result.success(uploadService.initChunkUpload(filename, fileSize));
    }
    
    /**
     * 上传分片
     */
    @PostMapping("/upload/chunk/{uploadId}/{chunkIndex}")
    public Result<Void> uploadChunk(
            @PathVariable String uploadId,
            @PathVariable Integer chunkIndex,
            @RequestParam("file") MultipartFile file) {
        uploadService.uploadChunk(uploadId, chunkIndex, file);
        return Result.success();
    }
    
    /**
     * 合并分片
     */
    @PostMapping("/upload/chunk/{uploadId}/merge")
    public Result<UploadResult> mergeChunks(
            @PathVariable String uploadId,
            @RequestParam("filename") String filename,
            @RequestParam(value = "category", defaultValue = "default") String category) {
        return Result.success(uploadService.mergeChunks(uploadId, filename, category));
    }
    
    /**
     * 获取已上传分片（断点续传）
     */
    @GetMapping("/upload/chunk/{uploadId}/chunks")
    public Result<List<Integer>> getUploadedChunks(@PathVariable String uploadId) {
        return Result.success(uploadService.getUploadedChunks(uploadId));
    }
}
```

### 下载接口

```java
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class DownloadController {
    
    private final DownloadService downloadService;
    
    /**
     * 下载文件
     */
    @GetMapping("/download/{id}")
    public void download(@PathVariable Long id, HttpServletResponse response) {
        downloadService.download(id, response);
    }
    
    /**
     * 预览文件（支持 Range 请求）
     */
    @GetMapping("/preview/{id}")
    public void preview(
            @PathVariable Long id,
            HttpServletRequest request,
            HttpServletResponse response) {
        downloadService.preview(id, request, response);
    }
}
```

## 数据库表结构

```sql
-- 附件表
CREATE TABLE {prefix}_attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    file_url VARCHAR(500) NOT NULL COMMENT '访问 URL',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    content_type VARCHAR(100) COMMENT '内容类型',
    file_ext VARCHAR(20) COMMENT '文件扩展名',
    category VARCHAR(50) DEFAULT 'default' COMMENT '分类',
    storage_type VARCHAR(20) NOT NULL COMMENT '存储类型',
    uploader_id BIGINT COMMENT '上传者 ID',
    is_compressed TINYINT DEFAULT 0 COMMENT '是否已压缩',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME COMMENT '软删除时间',
    INDEX idx_category (category),
    INDEX idx_uploader (uploader_id),
    INDEX idx_created (created_at)
) COMMENT '附件表';

-- 分片上传信息表
CREATE TABLE {prefix}_chunk_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    upload_id VARCHAR(64) NOT NULL COMMENT '上传任务 ID',
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    file_size BIGINT NOT NULL COMMENT '文件总大小',
    chunk_size BIGINT NOT NULL COMMENT '分片大小',
    total_chunks INT NOT NULL COMMENT '总分片数',
    status TINYINT DEFAULT 0 COMMENT '状态 0-上传中 1-已完成 2-已取消',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_upload_id (upload_id)
) COMMENT '分片上传信息表';
```

## 接口契约要点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/storage/upload | 上传文件（自动判断） |
| POST | /api/storage/upload/chunk/init | 初始化分片上传 |
| POST | /api/storage/upload/chunk/{uploadId}/{index} | 上传分片 |
| POST | /api/storage/upload/chunk/{uploadId}/merge | 合并分片 |
| GET | /api/storage/upload/chunk/{uploadId}/chunks | 获取已上传分片 |
| GET | /api/storage/download/{id} | 下载文件 |
| GET | /api/storage/preview/{id} | 预览文件 |
| GET | /api/storage/attachment/list | 附件列表 |
| GET | /api/storage/attachment/{id} | 附件详情 |
| DELETE | /api/storage/attachment/{id} | 删除附件 |

## 强制交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-storage.md` | 全量接口 |
| 接入指南 | `docs/storage-module-guide.md` | 表结构、配置、集成步骤 |

## 红线

1. 不重复生成基础骨架。
2. 表名统一 `{prefix}_attachment`、`{prefix}_chunk_info`。
3. 所有删除为软删除（`deleted_at`）。
4. 分片上传必须支持断点续传。
5. 压缩功能必须可配置开关。
6. 所有注释、文档用中文。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
静态资源模块、文件上传下载、大文件上传、文件压缩、storage module、
资源管理、附件管理、分片上传、断点续传
```
