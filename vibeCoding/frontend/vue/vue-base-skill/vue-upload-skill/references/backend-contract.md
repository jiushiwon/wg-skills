# 上传接口后端契约

> 前端 `base-upload`（三种 mode）与后端 Web 框架的上传接口契约对齐。
>
> 对齐 `frontend-request-skill` 的响应信封 `{ code, message, data }`。

## 统一响应格式

```typescript
// 成功
{ code: 0, message: 'success', data: { url: 'https://cdn.example.com/uploads/abc.jpg', name: 'photo.jpg', size: 102400 } }

// 失败
{ code: -1001, message: '文件格式不支持', data: null }
```

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `number` | 业务状态码（0=成功，<0=失败） |
| `message` | `string` | 提示信息 |
| `data.url` | `string` | 文件访问 URL |
| `data.name` | `string` | 文件名（后端可能重命名） |
| `data.size` | `number` | 文件大小（字节） |

### 错误码

| code | message | 场景 |
|------|---------|------|
| `-1001` | 文件格式不支持 | accept 校验失败 |
| `-1002` | 文件大小超限 | maxSize 校验失败 |
| `-1003` | 上传数量超限 | maxCount 校验失败 |
| `-1004` | 文件为空 | 未选择文件 |
| `-2000` | 系统繁忙 | 服务器内部错误 |

> 错误码与 `frontend-request-skill` 的 `ERROR_CODE_MAP` 保持一致。

## FastAPI (Python)

### 路由

```python
# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.response import success, error
from app.core.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
import os, uuid

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    """通用文件上传"""
    # 格式校验
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return error(-1001, "文件格式不支持")

    # 大小校验
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        return error(-1002, f"文件大小超过 {MAX_FILE_SIZE // 1024 // 1024}MB 限制")

    # 存储
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    return success({
        "url": f"/uploads/{filename}",
        "name": file.filename,
        "size": len(content),
    })


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """图片上传（额外校验 MIME）"""
    if not file.content_type.startswith("image/"):
        return error(-1001, "仅支持图片格式")
    return await upload_file(file)
```

### 响应工具

```python
# app/core/response.py
from fastapi.responses import JSONResponse


def success(data=None, message="success"):
    return JSONResponse({"code": 0, "message": message, "data": data})


def error(code: int, message: str):
    return JSONResponse({"code": code, "message": message, "data": None})
```

## Spring Boot (Java)

### Controller

```java
// src/main/java/com/example/controller/UploadController.java
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size:10485760}") // 10MB
    private long maxSize;

    @PostMapping("/file")
    public ApiResponse<UploadResult> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ApiResponse.error(-1004, "文件为空");
        }

        if (file.getSize() > maxSize) {
            return ApiResponse.error(-1002, "文件大小超限");
        }

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        Path filepath = Paths.get(uploadDir, filename);
        Files.createDirectories(filepath.getParent());
        file.transferTo(filepath);

        UploadResult result = new UploadResult();
        result.setUrl("/uploads/" + filename);
        result.setName(file.getOriginalFilename());
        result.setSize(file.getSize());

        return ApiResponse.success(result);
    }

    @PostMapping("/image")
    public ApiResponse<UploadResult> uploadImage(
            @RequestParam("file") MultipartFile file) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.error(-1001, "仅支持图片格式");
        }

        return uploadFile(file);
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
```

### ApiResponse

```java
// src/main/java/com/example/common/ApiResponse.java
@Data
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setCode(0);
        r.setMessage("success");
        r.setData(data);
        return r;
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }
}
```

## Go Gin

### Handler

```go
// internal/handler/upload.go
package handler

import (
    "fmt"
    "net/http"
    "os"
    "path/filepath"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

const (
    uploadDir  = "./uploads"
    maxMem     = 10 << 20 // 10MB
)

var allowedExts = map[string]bool{
    ".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
    ".pdf": true, ".doc": true, ".docx": true, ".xls": true, ".xlsx": true,
    ".zip": true, ".rar": true, ".txt": true, ".csv": true,
}

// UploadFile 通用文件上传
func UploadFile(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusOK, gin.H{"code": -1004, "message": "文件为空", "data": nil})
        return
    }

    ext := strings.ToLower(filepath.Ext(file.Filename))
    if !allowedExts[ext] {
        c.JSON(http.StatusOK, gin.H{"code": -1001, "message": "文件格式不支持", "data": nil})
        return
    }

    filename := uuid.New().String() + ext
    dst := filepath.Join(uploadDir, filename)

    os.MkdirAll(uploadDir, os.ModePerm)
    if err := c.SaveUploadedFile(file, dst); err != nil {
        c.JSON(http.StatusOK, gin.H{"code": -2000, "message": "系统繁忙", "data": nil})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "code":    0,
        "message": "success",
        "data": gin.H{
            "url":  fmt.Sprintf("/uploads/%s", filename),
            "name": file.Filename,
            "size": file.Size,
        },
    })
}

// UploadImage 图片上传
func UploadImage(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusOK, gin.H{"code": -1004, "message": "文件为空", "data": nil})
        return
    }

    contentType := file.Header.Get("Content-Type")
    if !strings.HasPrefix(contentType, "image/") {
        c.JSON(http.StatusOK, gin.H{"code": -1001, "message": "仅支持图片格式", "data": nil})
        return
    }

    UploadFile(c)
}
```

### 路由注册

```go
// internal/router/router.go
func Setup(r *gin.Engine) {
    api := r.Group("/api")
    upload := api.Group("/upload")
    {
        upload.POST("/file", handler.UploadFile)
        upload.POST("/image", handler.UploadImage)
    }
}
```

## 前端对接

在 `vue-generate-skill` 生成的骨架项目中，上传 API 模块如下：

```typescript
// src/api/upload.ts
import { upload } from './request'

export interface UploadResult {
  url: string
  name: string
  size: number
}

export function uploadFile(file: File, extra?: Record<string, any>) {
  return upload<UploadResult>({
    url: '/upload/file',
    file,
    name: 'file',
    formData: extra,
  })
}

export function uploadImage(file: File, extra?: Record<string, any>) {
  return upload<UploadResult>({
    url: '/upload/image',
    file,
    name: 'file',
    formData: extra,
  })
}
```

## 静态文件服务

| 框架 | 静态资源配置 |
|------|-------------|
| FastAPI | `app.mount("/uploads", StaticFiles(directory="uploads"))` |
| Spring Boot | `spring.web.resources.static-locations=classpath:/static/,file:./uploads/` |
| Go Gin | `r.Static("/uploads", "./uploads")` |
