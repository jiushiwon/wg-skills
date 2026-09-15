import mimetypes
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings
from app.exceptions import BusinessException


class UploadService:
    """文件上传服务：负责保存策略、类型校验、大小限制、访问 URL 生成。"""

    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.max_size = settings.upload_max_size * 1024 * 1024
        self.allowed_types = {t.strip().lower() for t in settings.upload_allowed_types.split(",") if t.strip()}

    @staticmethod
    def _safe_filename(filename: str | None) -> str:
        """防御路径穿越与非法字符：只保留文件名本体，替换危险符号。"""
        name = Path(filename or "unknown").name
        # ponytail: 仅做基础过滤，更严格的 MIME 校验可接入 python-magic
        return name.replace("\\", "_").replace("/", "_").replace("..", "_")

    async def save(self, file: UploadFile) -> dict:
        content_type = (file.content_type or "application/octet-stream").lower()
        if self.allowed_types and content_type not in self.allowed_types:
            raise BusinessException(-1032, f"不允许上传该文件类型: {content_type}")

        ext = Path(self._safe_filename(file.filename)).suffix.lower()
        if not ext:
            ext = mimetypes.guess_extension(content_type) or ".bin"
        unique_name = f"{uuid.uuid4().hex}{ext}"

        self.upload_dir.mkdir(parents=True, exist_ok=True)
        target = self.upload_dir / unique_name

        size = 0
        with target.open("wb") as f:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > self.max_size:
                    target.unlink(missing_ok=True)
                    raise BusinessException(-1031, f"文件大小超过限制 {settings.upload_max_size}MB")
                f.write(chunk)

        return {
            "url": f"/static/uploads/{unique_name}",
            "filename": self._safe_filename(file.filename),
            "size": size,
            "mimeType": content_type,
        }

    async def save_batch(self, files: list[UploadFile]) -> dict:
        results = []
        for file in files:
            results.append(await self.save(file))
        return {"list": results, "total": len(results)}