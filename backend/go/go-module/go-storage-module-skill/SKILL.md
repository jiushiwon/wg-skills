---
name: go-storage-module-skill
description: Go Gin 静态资源库模块技能。面向已有 Go Gin 项目，提供小文件直接上传、大文件切割上传、文件压缩、下载、预览、附件管理等能力。触发词："静态资源模块"、"Go 文件上传"、"Gin 文件上传"、"大文件上传"、"文件压缩"、"storage module"、"资源管理"。
---

# Go Gin Storage Module Skill

面向**已有 Go Gin 项目**的开发者，快速集成静态资源管理能力。

## 定位

- 目标：在已有 `go-gin-init-skill` 骨架上，添加可运行的静态资源管理模块。
- 不替代：不重复生成 `go-gin-init-skill` 已经提供的统一响应、JWT、GORM 等基础设施。
- 输出：模型、仓储、服务、控制器、数据库迁移、接口契约、接入指南。

## 骨架依赖

> 本模块是 `go-gin-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足：**
1. ✅ 已安装 `go-gin-init-skill`（项目骨架）
2. ✅ 骨架包含：JWT、统一响应、GORM、分页、目录结构

## 用户问题（最多 3 个）

```
1. 现有项目的模块名是什么？（默认从骨架推断，如 github.com/koala/myapp）
2. 表前缀是什么？（默认 wg）
3. 默认存储方式是什么？（local / aliyun / tencent / minio，默认 local）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **小文件上传** | 单文件/多文件直接上传（< 10MB） |
| 2 | **大文件切割上传** | 分片上传 + 断点续传（≥ 10MB） |
| 3 | **文件压缩** | 可选开启，支持图片压缩 |
| 4 | **文件下载** | 流式下载、断点续传下载 |
| 5 | **文件预览** | 图片/视频/文档在线预览 |
| 6 | **存储策略** | 本地存储 / 阿里云 OSS / 腾讯云 COS / MinIO |
| 7 | **附件管理** | 附件 CRUD、分类、标签 |
| 8 | **图片处理** | 缩略图、水印、格式转换 |

## 配置结构

```yaml
# config.yaml
storage:
  # 存储方式: local / aliyun / tencent / minio
  type: local
  
  # 文件限制
  max_size: 104857600  # 100MB
  allowed_types: jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip,mp4,mp3
  
  # 分片上传配置
  chunk:
    enabled: true
    size: 5242880  # 5MB 每片
    threshold: 10485760  # 10MB 触发分片上传
  
  # 压缩配置
  compress:
    enabled: false
    types: jpg,jpeg,png  # 需要压缩的文件类型
    quality: 80  # 压缩质量 0-100
    max_size: 1048576  # 1MB 以上才压缩
  
  # 本地存储
  local:
    path: ./uploads
    domain: http://localhost:8080
  
  # 阿里云 OSS
  aliyun:
    access_key: ${ALIYUN_ACCESS_KEY:}
    secret_key: ${ALIYUN_SECRET_KEY:}
    bucket: ${ALIYUN_BUCKET:}
    endpoint: oss-cn-hangzhou.aliyuncs.com
  
  # 腾讯云 COS
  tencent:
    secret_id: ${TENCENT_SECRET_ID:}
    secret_key: ${TENCENT_SECRET_KEY:}
    bucket: ${TENCENT_BUCKET:}
    region: ap-guangzhou
  
  # MinIO
  minio:
    endpoint: http://localhost:9000
    access_key: ${MINIO_ACCESS_KEY:minioadmin}
    secret_key: ${MINIO_SECRET_KEY:minioadmin}
    bucket: ${MINIO_BUCKET:uploads}
```

## 配置结构体

```go
// config/storage.go
package config

type ChunkConfig struct {
    Enabled   bool `mapstructure:"enabled"`
    Size      int  `mapstructure:"size"`
    Threshold int  `mapstructure:"threshold"`
}

type CompressConfig struct {
    Enabled  bool     `mapstructure:"enabled"`
    Types    []string `mapstructure:"types"`
    Quality  int      `mapstructure:"quality"`
    MaxSize  int      `mapstructure:"max_size"`
}

type LocalConfig struct {
    Path   string `mapstructure:"path"`
    Domain string `mapstructure:"domain"`
}

type AliyunConfig struct {
    AccessKey string `mapstructure:"access_key"`
    SecretKey string `mapstructure:"secret_key"`
    Bucket    string `mapstructure:"bucket"`
    Endpoint  string `mapstructure:"endpoint"`
}

type TencentConfig struct {
    SecretID  string `mapstructure:"secret_id"`
    SecretKey string `mapstructure:"secret_key"`
    Bucket    string `mapstructure:"bucket"`
    Region    string `mapstructure:"region"`
}

type MinioConfig struct {
    Endpoint  string `mapstructure:"endpoint"`
    AccessKey string `mapstructure:"access_key"`
    SecretKey string `mapstructure:"secret_key"`
    Bucket    string `mapstructure:"bucket"`
}

type StorageConfig struct {
    Type         string         `mapstructure:"type"`
    MaxSize      int            `mapstructure:"max_size"`
    AllowedTypes []string       `mapstructure:"allowed_types"`
    Chunk        ChunkConfig    `mapstructure:"chunk"`
    Compress     CompressConfig `mapstructure:"compress"`
    Local        LocalConfig    `mapstructure:"local"`
    Aliyun       AliyunConfig   `mapstructure:"aliyun"`
    Tencent      TencentConfig  `mapstructure:"tencent"`
    Minio        MinioConfig    `mapstructure:"minio"`
}
```

## 模块结构

```
internal/storage/
├── config/
│   └── config.go              # 配置
├── constants/
│   └── constants.go           # 常量
├── errors/
│   └── errors.go              # 错误定义
├── model/
│   ├── attachment.go          # 附件模型
│   └── chunk_info.go          # 分片信息模型
├── repository/
│   ├── attachment_repo.go     # 附件仓储
│   └── chunk_info_repo.go     # 分片信息仓储
├── service/
│   ├── storage_service.go     # 存储策略接口
│   ├── local_storage.go       # 本地存储
│   ├── oss_storage.go         # 阿里云 OSS
│   ├── cos_storage.go         # 腾讯云 COS
│   ├── minio_storage.go       # MinIO
│   ├── upload_service.go      # 上传服务
│   ├── download_service.go    # 下载服务
│   ├── attachment_service.go  # 附件服务
│   └── image_service.go       # 图片处理服务
└── handler/
    ├── upload_handler.go      # 上传接口
    ├── download_handler.go    # 下载接口
    └── attachment_handler.go  # 附件管理接口

migrations/
└── storage_module.sql         # 迁移文件

api-contract-storage.md        # 接口契约
docs/storage-module-guide.md   # 接入指南
```

## 核心实现

### 存储策略接口

```go
// service/storage_service.go
package service

import "io"

// StorageService 存储策略接口
type StorageService interface {
    // Upload 上传文件
    // @param reader 文件流
    // @param key 存储 key
    // @param contentType 内容类型
    // @return 访问 URL
    Upload(reader io.Reader, key string, contentType string) (string, error)
    
    // Delete 删除文件
    Delete(key string) error
    
    // GetURL 获取文件 URL
    GetURL(key string) (string, error)
    
    // Download 获取文件流
    Download(key string) (io.ReadCloser, error)
}
```

### 本地存储实现

```go
// service/local_storage.go
package service

import (
    "io"
    "os"
    "path/filepath"
    
    "myapp/internal/storage/config"
)

type LocalStorageService struct {
    basePath string
    domain   string
}

func NewLocalStorageService(cfg config.LocalConfig) *LocalStorageService {
    os.MkdirAll(cfg.Path, 0755)
    return &LocalStorageService{
        basePath: cfg.Path,
        domain:   cfg.domain,
    }
}

func (s *LocalStorageService) Upload(reader io.Reader, key string, contentType string) (string, error) {
    filePath := filepath.Join(s.basePath, key)
    
    // 创建目录
    dir := filepath.Dir(filePath)
    if err := os.MkdirAll(dir, 0755); err != nil {
        return "", err
    }
    
    // 创建文件
    file, err := os.Create(filePath)
    if err != nil {
        return "", err
    }
    defer file.Close()
    
    // 写入内容
    if _, err := io.Copy(file, reader); err != nil {
        return "", err
    }
    
    return s.domain + "/" + key, nil
}

func (s *LocalStorageService) Delete(key string) error {
    filePath := filepath.Join(s.basePath, key)
    return os.Remove(filePath)
}

func (s *LocalStorageService) GetURL(key string) (string, error) {
    return s.domain + "/" + key, nil
}

func (s *LocalStorageService) Download(key string) (io.ReadCloser, error) {
    filePath := filepath.Join(s.basePath, key)
    return os.Open(filePath)
}
```

### 上传服务（核心）

```go
// service/upload_service.go
package service

import (
    "bytes"
    "fmt"
    "io"
    "math"
    "path/filepath"
    "strings"
    "time"
    
    "github.com/google/uuid"
    "gorm.io/gorm"
    
    "myapp/internal/storage/config"
    "myapp/internal/storage/model"
    "myapp/internal/storage/repository"
)

type UploadService struct {
    db            *gorm.DB
    storage       StorageService
    cfg           config.StorageConfig
    attachmentRepo *repository.AttachmentRepository
    chunkInfoRepo  *repository.ChunkInfoRepository
    imageService   *ImageService
}

func NewUploadService(db *gorm.DB, cfg config.StorageConfig) *UploadService {
    storage := NewStorageService(cfg)
    return &UploadService{
        db:             db,
        storage:        storage,
        cfg:            cfg,
        attachmentRepo: repository.NewAttachmentRepository(db),
        chunkInfoRepo:  repository.NewChunkInfoRepository(db),
        imageService:   NewImageService(),
    }
}

// UploadResult 上传结果
type UploadResult struct {
    ID          uint   `json:"id"`
    URL         string `json:"url"`
    Filename    string `json:"filename"`
    Size        int64  `json:"size"`
    ContentType string `json:"content_type"`
}

// ChunkUploadInit 分片上传初始化
type ChunkUploadInit struct {
    UploadID    string `json:"upload_id"`
    ChunkSize   int    `json:"chunk_size"`
    TotalChunks int    `json:"total_chunks"`
}

// Upload 上传文件（自动判断小文件/大文件）
func (s *UploadService) Upload(filename string, size int64, contentType string, reader io.Reader, category string) (*UploadResult, error) {
    // 验证文件
    if err := s.validateFile(filename, size); err != nil {
        return nil, err
    }
    
    // 判断是否需要分片上传
    if s.needChunkUpload(size) {
        return s.chunkUpload(filename, size, contentType, reader, category)
    }
    
    // 小文件直接上传
    return s.directUpload(filename, size, contentType, reader, category)
}

// directUpload 小文件直接上传
func (s *UploadService) directUpload(filename string, size int64, contentType string, reader io.Reader, category string) (*UploadResult, error) {
    key := s.generateKey(filename)
    
    // 读取内容
    content, err := io.ReadAll(reader)
    if err != nil {
        return nil, err
    }
    
    // 是否需要压缩
    if s.needCompress(filename, int64(len(content))) {
        content, err = s.imageService.Compress(content, s.cfg.Compress.Quality)
        if err != nil {
            return nil, err
        }
    }
    
    // 上传
    url, err := s.storage.Upload(bytes.NewReader(content), key, contentType)
    if err != nil {
        return nil, err
    }
    
    // 保存附件记录
    attachment := &model.Attachment{
        Filename:    filename,
        FilePath:    key,
        FileURL:     url,
        FileSize:    int64(len(content)),
        ContentType: contentType,
        FileExt:     s.getExtension(filename),
        Category:    category,
        StorageType: s.cfg.Type,
        IsCompressed: s.needCompress(filename, size),
    }
    
    if err := s.attachmentRepo.Create(attachment); err != nil {
        return nil, err
    }
    
    return &UploadResult{
        ID:          attachment.ID,
        URL:         url,
        Filename:    filename,
        Size:        int64(len(content)),
        ContentType: contentType,
    }, nil
}

// chunkUpload 大文件分片上传
func (s *UploadService) chunkUpload(filename string, size int64, contentType string, reader io.Reader, category string) (*UploadResult, error) {
    // 1. 初始化分片上传
    uploadID := uuid.New().String()
    chunkSize := s.cfg.Chunk.Size
    totalChunks := int(math.Ceil(float64(size) / float64(chunkSize)))
    
    // 2. 保存分片信息
    chunkInfo := &model.ChunkInfo{
        UploadID:    uploadID,
        Filename:    filename,
        FileSize:    size,
        ChunkSize:   int64(chunkSize),
        TotalChunks: totalChunks,
        Status:      0, // 上传中
    }
    if err := s.chunkInfoRepo.Create(chunkInfo); err != nil {
        return nil, err
    }
    
    // 3. 分片上传
    buffer := make([]byte, chunkSize)
    for chunkIndex := 0; chunkIndex < totalChunks; chunkIndex++ {
        n, err := io.ReadFull(reader, buffer)
        if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
            return nil, err
        }
        
        chunkKey := fmt.Sprintf("chunks/%s/%d", uploadID, chunkIndex)
        _, err = s.storage.Upload(bytes.NewReader(buffer[:n]), chunkKey, "application/octet-stream")
        if err != nil {
            return nil, err
        }
    }
    
    // 4. 合并分片
    key := s.generateKey(filename)
    if err := s.mergeChunks(uploadID, key, totalChunks); err != nil {
        return nil, err
    }
    
    // 5. 更新状态
    chunkInfo.Status = 1 // 已完成
    if err := s.chunkInfoRepo.Update(chunkInfo); err != nil {
        return nil, err
    }
    
    // 6. 保存附件记录
    url, err := s.storage.GetURL(key)
    if err != nil {
        return nil, err
    }
    
    attachment := &model.Attachment{
        Filename:    filename,
        FilePath:    key,
        FileURL:     url,
        FileSize:    size,
        ContentType: contentType,
        FileExt:     s.getExtension(filename),
        Category:    category,
        StorageType: s.cfg.Type,
        IsCompressed: false,
    }
    
    if err := s.attachmentRepo.Create(attachment); err != nil {
        return nil, err
    }
    
    return &UploadResult{
        ID:          attachment.ID,
        URL:         url,
        Filename:    filename,
        Size:        size,
        ContentType: contentType,
    }, nil
}

// GetUploadedChunks 获取已上传分片（断点续传）
func (s *UploadService) GetUploadedChunks(uploadID string) ([]int, error) {
    chunkInfo, err := s.chunkInfoRepo.FindByUploadID(uploadID)
    if err != nil {
        return nil, err
    }
    
    var uploaded []int
    for i := 0; i < chunkInfo.TotalChunks; i++ {
        chunkKey := fmt.Sprintf("chunks/%s/%d", uploadID, i)
        _, err := s.storage.Download(chunkKey)
        if err == nil {
            uploaded = append(uploaded, i)
        }
    }
    
    return uploaded, nil
}

// UploadChunk 上传单个分片（断点续传）
func (s *UploadService) UploadChunk(uploadID string, chunkIndex int, reader io.Reader) error {
    chunkInfo, err := s.chunkInfoRepo.FindByUploadID(uploadID)
    if err != nil {
        return err
    }
    
    chunkKey := fmt.Sprintf("chunks/%s/%d", uploadID, chunkIndex)
    _, err = s.storage.Upload(reader, chunkKey, "application/octet-stream")
    return err
}

// MergeChunks 合并分片
func (s *UploadService) MergeChunks(uploadID string, filename string, category string) (*UploadResult, error) {
    chunkInfo, err := s.chunkInfoRepo.FindByUploadID(uploadID)
    if err != nil {
        return nil, err
    }
    
    // 合并分片
    key := s.generateKey(filename)
    if err := s.mergeChunks(uploadID, key, chunkInfo.TotalChunks); err != nil {
        return nil, err
    }
    
    // 更新状态
    chunkInfo.Status = 1
    if err := s.chunkInfoRepo.Update(chunkInfo); err != nil {
        return nil, err
    }
    
    // 保存附件记录
    url, err := s.storage.GetURL(key)
    if err != nil {
        return nil, err
    }
    
    attachment := &model.Attachment{
        Filename:    filename,
        FilePath:    key,
        FileURL:     url,
        FileSize:    chunkInfo.FileSize,
        ContentType: "application/octet-stream",
        FileExt:     s.getExtension(filename),
        Category:    category,
        StorageType: s.cfg.Type,
    }
    
    if err := s.attachmentRepo.Create(attachment); err != nil {
        return nil, err
    }
    
    return &UploadResult{
        ID:       attachment.ID,
        URL:      url,
        Filename: filename,
        Size:     chunkInfo.FileSize,
    }, nil
}

func (s *UploadService) needChunkUpload(size int64) bool {
    return s.cfg.Chunk.Enabled && size >= int64(s.cfg.Chunk.Threshold)
}

func (s *UploadService) needCompress(filename string, size int64) bool {
    if !s.cfg.Compress.Enabled {
        return false
    }
    if size < int64(s.cfg.Compress.MaxSize) {
        return false
    }
    ext := strings.ToLower(s.getExtension(filename))
    for _, t := range s.cfg.Compress.Types {
        if t == ext {
            return true
        }
    }
    return false
}

func (s *UploadService) generateKey(filename string) string {
    ext := s.getExtension(filename)
    datePath := time.Now().format("2006/01/02")
    return fmt.Sprintf("uploads/%s/%s.%s", datePath, uuid.New().String(), ext)
}

func (s *UploadService) getExtension(filename string) string {
    return strings.TrimPrefix(filepath.Ext(filename), ".")
}

func (s *UploadService) validateFile(filename string, size int64) error {
    if filename == "" {
        return ErrFileEmpty
    }
    if size > int64(s.cfg.MaxSize) {
        return ErrFileTooLarge
    }
    ext := strings.ToLower(s.getExtension(filename))
    allowed := false
    for _, t := range s.cfg.AllowedTypes {
        if t == ext {
            allowed = true
            break
        }
    }
    if !allowed {
        return ErrFileTypeNotAllowed
    }
    return nil
}
```

### 上传接口

```go
// handler/upload_handler.go
package handler

import (
    "net/http"
    
    "github.com/gin-gonic/gin"
    
    "myapp/internal/storage/service"
)

type UploadHandler struct {
    uploadService *service.UploadService
}

func NewUploadHandler(uploadService *service.UploadService) *UploadHandler {
    return &UploadHandler{uploadService: uploadService}
}

// Upload 上传文件（自动判断小文件/大文件）
func (h *UploadHandler) Upload(c *gin.Context) {
    file, header, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "文件不能为空"})
        return
    }
    defer file.Close()
    
    category := c.DefaultPostForm("category", "default")
    
    result, err := h.uploadService.Upload(
        header.Filename,
        header.Size,
        header.Header.Get("Content-Type"),
        file,
        category,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

// InitChunkUpload 初始化分片上传
func (h *UploadHandler) InitChunkUpload(c *gin.Context) {
    filename := c.PostForm("filename")
    // 注意：实际需要从请求中获取文件大小
    // 这里简化处理
    
    result, err := h.uploadService.InitChunkUpload(filename, 0)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

// UploadChunk 上传分片
func (h *UploadHandler) UploadChunk(c *gin.Context) {
    uploadID := c.Param("upload_id")
    chunkIndex := c.GetInt("chunk_index")
    
    file, _, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "分片文件不能为空"})
        return
    }
    defer file.Close()
    
    if err := h.uploadService.UploadChunk(uploadID, chunkIndex, file); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"code": 200, "message": "分片上传成功"})
}

// MergeChunks 合并分片
func (h *UploadHandler) MergeChunks(c *gin.Context) {
    uploadID := c.Param("upload_id")
    filename := c.PostForm("filename")
    category := c.DefaultPostForm("category", "default")
    
    result, err := h.uploadService.MergeChunks(uploadID, filename, category)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

// GetUploadedChunks 获取已上传分片
func (h *UploadHandler) GetUploadedChunks(c *gin.Context) {
    uploadID := c.Param("upload_id")
    
    chunks, err := h.uploadService.GetUploadedChunks(uploadID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"code": 200, "data": chunks})
}
```

### 路由注册

```go
// router/storage.go
package router

import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    
    "myapp/internal/storage/config"
    "myapp/internal/storage/handler"
    "myapp/internal/storage/service"
)

func RegisterStorageRoutes(r *gin.RouterGroup, db *gorm.DB, cfg config.StorageConfig) {
    uploadService := service.NewUploadService(db, cfg)
    downloadService := service.NewDownloadService(db, cfg)
    attachmentService := service.NewAttachmentService(db)
    
    uploadHandler := handler.NewUploadHandler(uploadService)
    downloadHandler := handler.NewDownloadHandler(downloadService)
    attachmentHandler := handler.NewAttachmentHandler(attachmentService)
    
    storage := r.Group("/storage")
    {
        // 上传
        storage.POST("/upload", uploadHandler.Upload)
        storage.POST("/upload/chunk/init", uploadHandler.InitChunkUpload)
        storage.POST("/upload/chunk/:upload_id/:chunk_index", uploadHandler.UploadChunk)
        storage.POST("/upload/chunk/:upload_id/merge", uploadHandler.MergeChunks)
        storage.GET("/upload/chunk/:upload_id/chunks", uploadHandler.GetUploadedChunks)
        
        // 下载/预览
        storage.GET("/download/:id", downloadHandler.Download)
        storage.GET("/preview/:id", downloadHandler.Preview)
        
        // 附件管理
        storage.GET("/attachment/list", attachmentHandler.List)
        storage.GET("/attachment/:id", attachmentHandler.Get)
        storage.DELETE("/attachment/:id", attachmentHandler.Delete)
    }
}
```

## 数据库模型

```go
// model/attachment.go
package model

import (
    "time"
    
    "gorm.io/gorm"
)

type Attachment struct {
    ID           uint           `gorm:"primaryKey" json:"id"`
    Filename     string         `gorm:"size:255;not null" json:"filename"`
    FilePath     string         `gorm:"size:500;not null" json:"file_path"`
    FileURL      string         `gorm:"size:500;not null" json:"file_url"`
    FileSize     int64          `gorm:"not null" json:"file_size"`
    ContentType  string         `gorm:"size:100" json:"content_type"`
    FileExt      string         `gorm:"size:20" json:"file_ext"`
    Category     string         `gorm:"size:50;default:default" json:"category"`
    StorageType  string         `gorm:"size:20;not null" json:"storage_type"`
    UploaderID   *uint          `json:"uploader_id"`
    IsCompressed bool           `gorm:"default:false" json:"is_compressed"`
    CreatedAt    time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
    DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (Attachment) TableName() string {
    return "{prefix}_attachment"
}
```

```go
// model/chunk_info.go
package model

import (
    "time"
    
    "gorm.io/gorm"
)

type ChunkInfo struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    UploadID    string         `gorm:"size:64;uniqueIndex;not null" json:"upload_id"`
    Filename    string         `gorm:"size:255;not null" json:"filename"`
    FileSize    int64          `gorm:"not null" json:"file_size"`
    ChunkSize   int64          `gorm:"not null" json:"chunk_size"`
    TotalChunks int            `gorm:"not null" json:"total_chunks"`
    Status      int            `gorm:"default:0" json:"status"` // 0-上传中 1-已完成 2-已取消
    CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (ChunkInfo) TableName() string {
    return "{prefix}_chunk_info"
}
```

## 接口契约要点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/storage/upload | 上传文件（自动判断） |
| POST | /api/storage/upload/chunk/init | 初始化分片上传 |
| POST | /api/storage/upload/chunk/{upload_id}/{index} | 上传分片 |
| POST | /api/storage/upload/chunk/{upload_id}/merge | 合并分片 |
| GET | /api/storage/upload/chunk/{upload_id}/chunks | 获取已上传分片 |
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

1. 不重复生成 Go Gin 基础骨架。
2. 表名统一 `{prefix}_attachment`、`{prefix}_chunk_info`。
3. 所有删除为软删除（`deleted_at`）。
4. 分片上传必须支持断点续传。
5. 压缩功能必须可配置开关。
6. 所有注释、文档用中文。
7. 与 `springboot-storage-module-skill` 保持 API 字段完全一致。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**

## 触发关键词

```
静态资源模块、Go 文件上传、Gin 文件上传、大文件上传、
文件压缩、storage module、资源管理、分片上传、断点续传
```
