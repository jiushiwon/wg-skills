---
name: fastapi-storage-module-skill
description: FastAPI 静态资源库模块技能。面向已有 FastAPI 项目，提供小文件直接上传、大文件切割上传、文件压缩、下载、预览、附件管理等能力。触发词："静态资源模块"、"Python 文件上传"、"FastAPI 文件上传"、"大文件上传"、"文件压缩"、"storage module"、"资源管理"。
---

# FastAPI Storage Module Skill

面向**已有 FastAPI 项目**的开发者，快速集成静态资源管理能力。

## 定位

- 目标：在已有 `fastapi-init-skill` 骨架上，添加可运行的静态资源管理模块。
- 不替代：不重复生成 `fastapi-init-skill` 已经提供的统一响应、JWT、SQLModel 等基础设施。
- 输出：模型、仓储、服务、路由、数据库迁移、接口契约、接入指南。

## 骨架依赖

> 本模块是 `fastapi-init-skill` 的子模块，必须在骨架基础上使用。

**使用前必须满足：**
1. ✅ 已安装 `fastapi-init-skill`（项目骨架）
2. ✅ 骨架包含：JWT、统一响应、SQLModel、分页、目录结构

**检测逻辑：**
1. 读取用户项目根目录 `SKILL.md` 或 `README.md`
2. 检测是否包含 `fastapi-init-skill` 相关内容
3. 如未检测到骨架，提示："本模块需要先安装 fastapi-init-skill 骨架"

## 用户问题（最多 3 个）

```
1. 现有项目的包名是什么？（默认从骨架推断，如 app）
2. 表前缀是什么？（默认 wg）
3. 默认存储方式是什么？（local / aliyun / tencent / minio，默认 local）
```

## 核心能力清单

| # | 能力 | 说明 |
|---|------|------|
| 1 | **小文件上传** | 单文件/多文件直接上传（< 10MB） |
| 2 | **大文件切割上传** | 分片上传 + 断点续传（≥ 10MB） |
| 3 | **文件压缩** | 可选开启，支持 Pillow 压缩图片 |
| 4 | **文件下载** | 流式下载、断点续传下载 |
| 5 | **文件预览** | 图片/视频/文档在线预览 |
| 6 | **存储策略** | 本地存储 / 阿里云 OSS / 腾讯云 COS / MinIO |
| 7 | **附件管理** | 附件 CRUD、分类、标签 |
| 8 | **图片处理** | 缩略图、水印、格式转换 |

## 配置结构

```python
# config.py
from pydantic import BaseSettings
from typing import List, Optional

class ChunkConfig(BaseSettings):
    enabled: bool = True
    size: int = 5 * 1024 * 1024  # 5MB 每片
    threshold: int = 10 * 1024 * 1024  # 10MB 触发分片上传

class CompressConfig(BaseSettings):
    enabled: bool = False
    types: List[str] = ["jpg", "jpeg", "png"]
    quality: float = 0.8
    max_size: int = 1024 * 1024  # 1MB 以上才压缩

class LocalConfig(BaseSettings):
    path: str = "./uploads"
    domain: str = "http://localhost:8000"

class AliyunConfig(BaseSettings):
    access_key: str = ""
    secret_key: str = ""
    bucket: str = ""
    endpoint: str = "oss-cn-hangzhou.aliyuncs.com"

class TencentConfig(BaseSettings):
    secret_id: str = ""
    secret_key: str = ""
    bucket: str = ""
    region: str = "ap-guangzhou"

class MinioConfig(BaseSettings):
    endpoint: str = "http://localhost:9000"
    access_key: str = "minioadmin"
    secret_key: str = "minioadmin"
    bucket: str = "uploads"

class StorageConfig(BaseSettings):
    type: str = "local"  # local / aliyun / tencent / minio
    max_size: int = 100 * 1024 * 1024  # 100MB
    allowed_types: List[str] = [
        "jpg", "jpeg", "png", "gif", "pdf", 
        "doc", "docx", "xls", "xlsx", "zip", "mp4", "mp3"
    ]
    chunk: ChunkConfig = ChunkConfig()
    compress: CompressConfig = CompressConfig()
    local: LocalConfig = LocalConfig()
    aliyun: AliyunConfig = AliyunConfig()
    tencent: TencentConfig = TencentConfig()
    minio: MinioConfig = MinioConfig()

storage_config = StorageConfig()
```

## 模块结构

```
src/storage/
├── __init__.py
├── config.py                   # 配置
├── constants.py                # 常量
├── exceptions.py               # 异常
├── models.py                   # SQLModel 模型
├── schemas.py                  # Pydantic schemas
├── routers/
│   ├── __init__.py
│   ├── upload.py               # 上传接口
│   ├── download.py             # 下载接口
│   └── attachment.py           # 附件管理接口
└── services/
    ├── __init__.py
    ├── storage_service.py      # 存储策略接口
    ├── local_storage.py        # 本地存储
    ├── oss_storage.py          # 阿里云 OSS
    ├── cos_storage.py          # 腾讯云 COS
    ├── minio_storage.py        # MinIO
    ├── upload_service.py       # 上传服务
    ├── download_service.py     # 下载服务
    ├── attachment_service.py   # 附件服务
    └── image_service.py        # 图片处理服务

alembic/versions/storage_module.py  # 迁移文件

api-contract-storage.md             # 接口契约
docs/storage-module-guide.md        # 接入指南
```

## 核心实现

### 存储策略接口

```python
# services/storage_service.py
from abc import ABC, abstractmethod
from typing import BinaryIO, Optional

class StorageService(ABC):
    """存储策略抽象接口"""
    
    @abstractmethod
    async def upload(self, file: BinaryIO, key: str, content_type: str) -> str:
        """上传文件
        
        Args:
            file: 文件流
            key: 存储 key
            content_type: 内容类型
            
        Returns:
            访问 URL
        """
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> None:
        """删除文件"""
        pass
    
    @abstractmethod
    async def get_url(self, key: str) -> str:
        """获取文件 URL"""
        pass
    
    @abstractmethod
    async def download(self, key: str) -> BinaryIO:
        """获取文件流"""
        pass
```

### 本地存储实现

```python
# services/local_storage.py
import os
import aiofiles
from pathlib import Path
from datetime import datetime
from .storage_service import StorageService
from ..config import storage_config

class LocalStorageService(StorageService):
    """本地存储实现"""
    
    def __init__(self):
        self.base_path = Path(storage_config.local.path)
        self.domain = storage_config.local.domain
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload(self, file: BinaryIO, key: str, content_type: str) -> str:
        """上传文件到本地"""
        file_path = self.base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return f"{self.domain}/{key}"
    
    async def delete(self, key: str) -> None:
        """删除本地文件"""
        file_path = self.base_path / key
        if file_path.exists():
            file_path.unlink()
    
    async def get_url(self, key: str) -> str:
        """获取文件 URL"""
        return f"{self.domain}/{key}"
    
    async def download(self, key: str) -> BinaryIO:
        """获取文件流"""
        file_path = self.base_path / key
        if not file_path.exists():
            raise FileNotFoundError(f"文件不存在: {key}")
        return open(file_path, 'rb')
```

### 上传服务（核心）

```python
# services/upload_service.py
import uuid
import math
from datetime import datetime
from typing import List, Optional, BinaryIO
from fastapi import UploadFile
from sqlmodel import Session, select

from ..config import storage_config
from ..models import Attachment, ChunkInfo
from ..schemas import UploadResult, ChunkUploadInit
from ..exceptions import StorageException
from .storage_service import StorageService
from .local_storage import LocalStorageService
from .image_service import ImageService

class UploadService:
    """上传服务"""
    
    def __init__(self, session: Session):
        self.session = session
        self.storage: StorageService = self._get_storage_service()
        self.image_service = ImageService()
    
    def _get_storage_service(self) -> StorageService:
        """获取存储服务实例"""
        storage_type = storage_config.type
        if storage_type == "local":
            return LocalStorageService()
        # elif storage_type == "aliyun":
        #     return OssStorageService()
        # elif storage_type == "tencent":
        #     return CosStorageService()
        # elif storage_type == "minio":
        #     return MinioStorageService()
        else:
            raise StorageException(f"不支持的存储类型: {storage_type}")
    
    async def upload(self, file: UploadFile, category: str = "default") -> UploadResult:
        """上传文件（自动判断小文件/大文件）"""
        # 验证文件
        await self._validate_file(file)
        
        # 判断是否需要分片上传
        if self._need_chunk_upload(file.size):
            return await self._chunk_upload(file, category)
        
        # 小文件直接上传
        return await self._direct_upload(file, category)
    
    async def _direct_upload(self, file: UploadFile, category: str) -> UploadResult:
        """小文件直接上传"""
        key = self._generate_key(file.filename)
        content_type = file.content_type or "application/octet-stream"
        
        # 是否需要压缩
        content = await file.read()
        if self._need_compress(file.filename, len(content)):
            content = await self.image_service.compress(
                content, 
                storage_config.compress.quality
            )
        
        # 上传
        from io import BytesIO
        url = await self.storage.upload(BytesIO(content), key, content_type)
        
        # 保存附件记录
        attachment = Attachment(
            filename=file.filename,
            file_path=key,
            file_url=url,
            file_size=len(content),
            content_type=content_type,
            file_ext=self._get_extension(file.filename),
            category=category,
            storage_type=storage_config.type,
            is_compressed=self._need_compress(file.filename, file.size)
        )
        self.session.add(attachment)
        self.session.commit()
        self.session.refresh(attachment)
        
        return UploadResult(
            id=attachment.id,
            url=url,
            filename=file.filename,
            size=len(content),
            content_type=content_type
        )
    
    async def _chunk_upload(self, file: UploadFile, category: str) -> UploadResult:
        """大文件分片上传"""
        # 1. 初始化分片上传
        upload_id = str(uuid.uuid4())
        chunk_size = storage_config.chunk.size
        total_chunks = math.ceil(file.size / chunk_size)
        
        # 2. 保存分片信息
        chunk_info = ChunkInfo(
            upload_id=upload_id,
            filename=file.filename,
            file_size=file.size,
            chunk_size=chunk_size,
            total_chunks=total_chunks,
            status=0  # 上传中
        )
        self.session.add(chunk_info)
        self.session.commit()
        
        # 3. 分片上传
        for chunk_index in range(total_chunks):
            content = await file.read(chunk_size)
            chunk_key = f"chunks/{upload_id}/{chunk_index}"
            from io import BytesIO
            await self.storage.upload(
                BytesIO(content),
                chunk_key,
                "application/octet-stream"
            )
        
        # 4. 合并分片
        key = self._generate_key(file.filename)
        await self._merge_chunks(upload_id, key, total_chunks)
        
        # 5. 更新状态
        chunk_info.status = 1  # 已完成
        self.session.commit()
        
        # 6. 保存附件记录
        url = await self.storage.get_url(key)
        attachment = Attachment(
            filename=file.filename,
            file_path=key,
            file_url=url,
            file_size=file.size,
            content_type=file.content_type,
            file_ext=self._get_extension(file.filename),
            category=category,
            storage_type=storage_config.type,
            is_compressed=False
        )
        self.session.add(attachment)
        self.session.commit()
        self.session.refresh(attachment)
        
        return UploadResult(
            id=attachment.id,
            url=url,
            filename=file.filename,
            size=file.size,
            content_type=file.content_type
        )
    
    async def get_uploaded_chunks(self, upload_id: str) -> List[int]:
        """获取已上传分片（断点续传）"""
        chunk_info = self.session.exec(
            select(ChunkInfo).where(ChunkInfo.upload_id == upload_id)
        ).first()
        
        if not chunk_info:
            raise StorageException("上传任务不存在")
        
        uploaded = []
        for i in range(chunk_info.total_chunks):
            chunk_key = f"chunks/{upload_id}/{i}"
            try:
                await self.storage.download(chunk_key)
                uploaded.append(i)
            except Exception:
                pass
        
        return uploaded
    
    async def upload_chunk(self, upload_id: str, chunk_index: int, file: UploadFile):
        """上传单个分片（断点续传）"""
        chunk_info = self.session.exec(
            select(ChunkInfo).where(ChunkInfo.upload_id == upload_id)
        ).first()
        
        if not chunk_info:
            raise StorageException("上传任务不存在")
        
        chunk_key = f"chunks/{upload_id}/{chunk_index}"
        content = await file.read()
        from io import BytesIO
        await self.storage.upload(BytesIO(content), chunk_key, "application/octet-stream")
    
    def _need_chunk_upload(self, file_size: int) -> bool:
        """判断是否需要分片上传"""
        return (storage_config.chunk.enabled and 
                file_size >= storage_config.chunk.threshold)
    
    def _need_compress(self, filename: str, file_size: int) -> bool:
        """判断是否需要压缩"""
        if not storage_config.compress.enabled:
            return False
        if file_size < storage_config.compress.max_size:
            return False
        ext = self._get_extension(filename)
        return ext.lower() in storage_config.compress.types
    
    def _generate_key(self, filename: str) -> str:
        """生成存储 key"""
        ext = self._get_extension(filename)
        date_path = datetime.now().strftime("%Y/%m/%d")
        return f"uploads/{date_path}/{uuid.uuid4()}.{ext}"
    
    def _get_extension(self, filename: str) -> str:
        """获取文件扩展名"""
        return filename.rsplit(".", 1)[-1] if "." in filename else ""
    
    async def _validate_file(self, file: UploadFile):
        """验证文件"""
        if not file.filename:
            raise StorageException("文件不能为空")
        if file.size > storage_config.max_size:
            raise StorageException("文件大小超过限制")
        ext = self._get_extension(file.filename)
        if ext.lower() not in storage_config.allowed_types:
            raise StorageException("不支持的文件类型")
```

### 上传路由

```python
# routers/upload.py
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlmodel import Session

from ..schemas import UploadResult, ChunkUploadInit
from ..services.upload_service import UploadService
from ...core.deps import get_session

router = APIRouter(prefix="/api/storage", tags=["存储管理"])

@router.post("/upload", response_model=UploadResult)
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form(default="default"),
    session: Session = Depends(get_session)
):
    """上传文件（自动判断小文件/大文件）"""
    service = UploadService(session)
    return await service.upload(file, category)

@router.post("/upload/chunk/init", response_model=ChunkUploadInit)
async def init_chunk_upload(
    filename: str = Form(...),
    file_size: int = Form(...),
    session: Session = Depends(get_session)
):
    """初始化分片上传"""
    service = UploadService(session)
    return await service.init_chunk_upload(filename, file_size)

@router.post("/upload/chunk/{upload_id}/{chunk_index}")
async def upload_chunk(
    upload_id: str,
    chunk_index: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """上传分片"""
    service = UploadService(session)
    await service.upload_chunk(upload_id, chunk_index, file)
    return {"message": "分片上传成功"}

@router.post("/upload/chunk/{upload_id}/merge", response_model=UploadResult)
async def merge_chunks(
    upload_id: str,
    filename: str = Form(...),
    category: str = Form(default="default"),
    session: Session = Depends(get_session)
):
    """合并分片"""
    service = UploadService(session)
    return await service.merge_chunks(upload_id, filename, category)

@router.get("/upload/chunk/{upload_id}/chunks", response_model=List[int])
async def get_uploaded_chunks(
    upload_id: str,
    session: Session = Depends(get_session)
):
    """获取已上传分片（断点续传）"""
    service = UploadService(session)
    return await service.get_uploaded_chunks(upload_id)
```

### 下载路由

```python
# routers/download.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from ..services.download_service import DownloadService
from ...core.deps import get_session

router = APIRouter(prefix="/api/storage", tags=["存储管理"])

@router.get("/download/{attachment_id}")
async def download_file(
    attachment_id: int,
    session: Session = Depends(get_session)
):
    """下载文件"""
    service = DownloadService(session)
    file_stream, filename, content_type = await service.download(attachment_id)
    
    return StreamingResponse(
        file_stream,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.get("/preview/{attachment_id}")
async def preview_file(
    attachment_id: int,
    session: Session = Depends(get_session)
):
    """预览文件"""
    service = DownloadService(session)
    file_stream, filename, content_type = await service.preview(attachment_id)
    
    return StreamingResponse(
        file_stream,
        media_type=content_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )
```

## 数据库模型

```python
# models.py
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Attachment(SQLModel, table=True):
    __tablename__ = "{prefix}_attachment"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(max_length=255, description="原始文件名")
    file_path: str = Field(max_length=500, description="存储路径")
    file_url: str = Field(max_length=500, description="访问 URL")
    file_size: int = Field(description="文件大小（字节）")
    content_type: Optional[str] = Field(max_length=100, description="内容类型")
    file_ext: Optional[str] = Field(max_length=20, description="文件扩展名")
    category: str = Field(default="default", max_length=50, description="分类")
    storage_type: str = Field(max_length=20, description="存储类型")
    uploader_id: Optional[int] = Field(description="上传者 ID")
    is_compressed: bool = Field(default=False, description="是否已压缩")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    deleted_at: Optional[datetime] = Field(default=None, description="软删除时间")

class ChunkInfo(SQLModel, table=True):
    __tablename__ = "{prefix}_chunk_info"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    upload_id: str = Field(max_length=64, unique=True, description="上传任务 ID")
    filename: str = Field(max_length=255, description="文件名")
    file_size: int = Field(description="文件总大小")
    chunk_size: int = Field(description="分片大小")
    total_chunks: int = Field(description="总分片数")
    status: int = Field(default=0, description="状态 0-上传中 1-已完成 2-已取消")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")
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

1. 不重复生成 FastAPI 基础骨架。
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
静态资源模块、Python 文件上传、FastAPI 文件上传、大文件上传、
文件压缩、storage module、资源管理、分片上传、断点续传
```
