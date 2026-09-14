---
name: springboot-upload-module-skill
description: Spring Boot 文件上传模块技能。面向已有 Spring Boot 项目，提供文件上传、本地存储、OSS 存储、图片处理、附件管理等能力的快速集成。触发词："文件上传模块"、"上传模块"、"OSS 集成"、"附件管理"、"upload module"、"文件存储"。
---

# Spring Boot Upload Module Skill

面向**已有 Spring Boot 项目**的开发者，快速集成文件上传和存储能力。

## 能力清单

| 能力 | 说明 |
|------|------|
| **文件上传** | 单文件、多文件、分片上传 |
| **本地存储** | 本地磁盘存储 |
| **OSS 存储** | 阿里云 OSS、腾讯云 COS |
| **图片处理** | 缩略图、水印、格式转换 |
| **附件管理** | 附件 CRUD、分类 |

## 触发场景

用户说"帮我加文件上传"或"集成 OSS"时触发。

## 配置

```yaml
# application.yml
upload:
  # 存储方式: local / aliyun / tencent
  storage-type: local
  
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
  
  # 文件限制
  allowed-types: jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip
  max-size: 10485760  # 10MB
```

```java
@Data
@ConfigurationProperties(prefix = "upload")
public class UploadProperties {
    private String storageType = "local";
    private Local local = new Local();
    private Aliyun aliyun = new Aliyun();
    private Tencent tencent = new Tencent();
    private List<String> allowedTypes;
    private long maxSize;
    
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
}
```

## 存储服务

### 本地存储

```java
@Service
public class LocalStorageService {
    
    @Value("${upload.local.path}")
    private String basePath;
    
    @Value("${upload.local.domain}")
    private String domain;
    
    public String upload(MultipartFile file) throws IOException {
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String ext = getExt(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + ext;
        
        // 按日期分目录
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path saveDir = Paths.get(basePath, datePath);
        Files.createDirectories(saveDir);
        
        // 保存文件
        Path filePath = saveDir.resolve(filename);
        file.transferTo(filePath.toFile());
        
        // 返回访问 URL
        return domain + "/uploads/" + datePath + "/" + filename;
    }
    
    public boolean delete(String url) {
        try {
            String path = url.replace(domain, "");
            Path filePath = Paths.get(basePath, path);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }
}
```

### 阿里云 OSS

```java
@Service
public class AliyunStorageService {
    
    @Autowired
    private UploadProperties properties;
    
    private OSS getClient() {
        OSSAuth auth = new OSSAuth(properties.getAliyun().getAccessKey(), 
                                   properties.getAliyun().getSecretKey());
        return new OSSClientBuilder().build(auth, 
            properties.getAliyun().getEndpoint());
    }
    
    public String upload(MultipartFile file) throws IOException {
        OSS client = getClient();
        String ext = getExt(file.getOriginalFilename());
        String filename = UUID.randomUUID().toString() + "." + ext;
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String key = "uploads/" + datePath + "/" + filename;
        
        client.putObject(properties.getAliyun().getBucket(), key, file.getInputStream());
        
        return "https://" + properties.getAliyun().getBucket() + "." + 
               properties.getAliyun().getEndpoint() + "/" + key;
    }
}
```

## 上传接口

```java
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {
    
    private final StorageService storageService;
    
    @PostMapping("/single")
    public Result<UploadResult> uploadSingle(@RequestParam("file") MultipartFile file) {
        // 验证文件
        validateFile(file);
        
        try {
            String url = storageService.upload(file);
            return Result.success(UploadResult.builder()
                .url(url)
                .filename(file.getOriginalFilename())
                .size(file.getSize())
                .contentType(file.getContentType())
                .build());
        } catch (IOException e) {
            throw new BusinessException("文件上传失败");
        }
    }
    
    @PostMapping("/multiple")
    public Result<List<UploadResult>> uploadMultiple(@RequestParam("files") MultipartFile[] files) {
        List<UploadResult> results = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            try {
                String url = storageService.upload(file);
                results.add(UploadResult.builder()
                    .url(url)
                    .filename(file.getOriginalFilename())
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .build());
            } catch (IOException e) {
                log.error("文件上传失败: {}", file.getOriginalFilename(), e);
            }
        }
        return Result.success(results);
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }
        if (file.getSize() > uploadProperties.getMaxSize()) {
            throw new BusinessException("文件大小超过限制");
        }
        String ext = getExt(file.getOriginalFilename());
        if (!uploadProperties.getAllowedTypes().contains(ext.toLowerCase())) {
            throw new BusinessException("不支持的文件类型");
        }
    }
}

@Data
@Builder
public class UploadResult {
    private String url;
    private String filename;
    private long size;
    private String contentType;
}
```

## 图片处理

```java
@Service
public class ImageService {
    
    /**
     * 生成缩略图
     */
    public byte[] thumbnail(MultipartFile file, int width, int height) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        BufferedImage thumb = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumb.createGraphics();
        g.drawImage(image.getScaledInstance(width, height, Image.SCALE_SMOOTH), 0, 0, null);
        g.dispose();
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(thumb, "JPEG", out);
        return out.toByteArray();
    }
    
    /**
     * 添加水印
     */
    public byte[] watermark(MultipartFile file, String text) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        Graphics2D g = image.createGraphics();
        g.setColor(new Color(255, 255, 255, 128));
        g.setFont(new Font("Arial", Font.PLAIN, 20));
        g.drawString(text, 10, image.getHeight() - 10);
        g.dispose();
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "JPEG", out);
        return out.toByteArray();
    }
    
    /**
     * 压缩图片
     */
    public byte[] compress(MultipartFile file, int quality) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "JPEG", out);
        
        // 使用 Thumbnails 或 Caesium 进行压缩
        return out.toByteArray();
    }
}
```

## 附件管理

### 附件实体

```java
@Data
@Entity
@Table(name = "wg_attachment")
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String filename;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String fileUrl;
    
    private Long fileSize;
    
    private String contentType;
    
    private String fileExt;
    
    private String category;  // avatar/article/attachment
    
    private Long uploaderId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

### 附件接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/attachment/list | 附件列表 |
| GET | /api/attachment/{id} | 附件详情 |
| DELETE | /api/attachment/{id} | 删除附件 |

## 不做

- 不提供文件预览服务（需自行搭建）
- 不处理版权和合规审查
- 不提供 CDN 加速（需自行配置）
