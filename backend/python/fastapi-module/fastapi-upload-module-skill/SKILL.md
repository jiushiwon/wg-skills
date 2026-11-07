---
name: fastapi-upload-module-skill
description: FastAPI 文件上传模块技能。面向已有 FastAPI 项目，提供文件上传、本地存储、OSS 存储、图片处理、附件管理等能力的快速集成。触发词："文件上传模块"、"上传模块"、"OSS 集成"、"附件管理"、"upload module"、"文件存储"。
---

# FastAPI Upload Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成文件上传和存储能力。

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

```python
from pydantic_settings import BaseSettings
from typing import Literal

class UploadSettings(BaseSettings):
    # 存储方式: local / aliyun / tencent
    storage_type: Literal["local", "aliyun", "tencent"] = "local"
    
    # 本地存储配置
    local_upload_path: str = "./uploads"
    local_domain: str = "http://localhost:8000"
    
    # 阿里云 OSS 配置
    aliyun_access_key: str = ""
    aliyun_secret_key: str = ""
    aliyun_bucket: str = ""
    aliyun_endpoint: str = "oss-cn-hangzhou.aliyuncs.com"
    
    # 腾讯云 COS 配置
    tencent_secret_id: str = ""
    tencent_secret_key: str = ""
    tencent_bucket: str = ""
    tencent_region: str = "ap-guangzhou"
    
    # 允许的文件类型
    allowed_types: list[str] = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "zip"]
    max_file_size: int = 10 * 1024 * 1024  # 10MB
```

## 存储服务

### 本地存储

```python
import os
import uuid
from pathlib import Path

class LocalStorage:
    def __init__(self, settings: UploadSettings):
        self.base_path = Path(settings.local_upload_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload(self, file: UploadFile) -> str:
        # 生成唯一文件名
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        
        # 按日期分目录
        date_path = datetime.now().strftime("%Y/%m/%d")
        save_dir = self.base_path / date_path
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # 保存文件
        file_path = save_dir / filename
        content = await file.read()
        file_path.write_bytes(content)
        
        # 返回访问 URL
        return f"{settings.local_domain}/uploads/{date_path}/{filename}"
    
    async def delete(self, url: str) -> bool:
        # 从 URL 提取路径并删除
        path = url.replace(settings.local_domain, "")
        file_path = self.base_path / path.lstrip("/")
        if file_path.exists():
            file_path.unlink()
            return True
        return False
```

### 阿里云 OSS

```python
import oss2

class AliyunStorage:
    def __init__(self, settings: UploadSettings):
        auth = oss2.Auth(settings.aliyun_access_key, settings.aliyun_secret_key)
        self.bucket = oss2.Bucket(auth, settings.aliyun_endpoint, settings.aliyun_bucket)
    
    async def upload(self, file: UploadFile) -> str:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        date_path = datetime.now().strftime("%Y/%m/%d")
        key = f"uploads/{date_path}/{filename}"
        
        content = await file.read()
        self.bucket.put_object(key, content)
        
        return f"https://{self.bucket.bucket_name}.{self.aliyun_endpoint}/{key}"
    
    async def delete(self, url: str) -> bool:
        key = url.split(f"https://{self.bucket.bucket_name}.")[-1]
        self.bucket.delete_object(key)
        return True
```

## 上传接口

```python
from fastapi import UploadFile, File, Form
from dataclasses import dataclass

@dataclass
class UploadResult:
    url: str
    filename: str
    size: int
    content_type: str

@router.post("/upload/single")
async def upload_single(file: UploadFile = File(...)):
    """单文件上传"""
    # 验证文件类型
    ext = file.filename.split(".")[-1].lower()
    if ext not in settings.allowed_types:
        raise BusinessException(ErrorCode.FILE_TYPE_NOT_ALLOWED)
    
    # 验证文件大小
    content = await file.read()
    if len(content) > settings.max_file_size:
        raise BusinessException(ErrorCode.FILE_TOO_LARGE)
    
    # 上传
    url = await storage.upload(file)
    
    return Success(data=UploadResult(
        url=url,
        filename=file.filename,
        size=len(content),
        content_type=file.content_type
    ))

@router.post("/upload/multiple")
async def upload_multiple(files: list[UploadFile] = File(...)):
    """多文件上传"""
    results = []
    for file in files:
        url = await storage.upload(file)
        results.append(UploadResult(
            url=url,
            filename=file.filename,
            size=0,
            content_type=file.content_type
        ))
    return Success(data=results)
```

## 图片处理

```python
from PIL import Image
import io

class ImageProcessor:
    @staticmethod
    async def thumbnail(image_bytes: bytes, size: tuple[int, int] = (200, 200)) -> bytes:
        """生成缩略图"""
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail(size, Image.LANCZOS)
        output = io.BytesIO()
        img.save(output, format=img.format or 'JPEG')
        return output.getvalue()
    
    @staticmethod
    async def watermark(image_bytes: bytes, text: str) -> bytes:
        """添加水印"""
        img = Image.open(io.BytesIO(image_bytes))
        draw = ImageDraw.Draw(img)
        
        # 添加文字水印
        draw.text((10, 10), text, fill=(255, 255, 255, 128))
        
        output = io.BytesIO()
        img.save(output, format=img.format or 'JPEG')
        return output.getvalue()
    
    @staticmethod
    async def compress(image_bytes: bytes, quality: int = 85) -> bytes:
        """压缩图片"""
        img = Image.open(io.BytesIO(image_bytes))
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()
```

## 附件管理

### 附件表

```python
class Attachment(Base):
    __tablename__ = "wg_attachment"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)  # 原文件名
    file_path = Column(String(500), nullable=False)  # 存储路径
    file_url = Column(String(500), nullable=False)  # 访问 URL
    file_size = Column(BigInteger)  # 文件大小
    content_type = Column(String(100))  # MIME 类型
    file_ext = Column(String(20))  # 扩展名
    category = Column(String(50))  # 分类：avatar/article/attachment
    uploader_id = Column(BigInteger)  # 上传人
    created_at = Column(DateTime, server_default=func.now())
    deleted_at = Column(DateTime)
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
