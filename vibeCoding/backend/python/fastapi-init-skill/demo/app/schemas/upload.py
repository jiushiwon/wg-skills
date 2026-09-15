from pydantic import BaseModel, Field


class UploadFileResponse(BaseModel):
    url: str = Field(..., description="文件访问 URL")
    filename: str = Field(..., description="原始文件名")
    size: int = Field(..., description="文件大小（字节）")
    mime_type: str = Field(..., alias="mimeType", serialization_alias="mimeType", description="文件 MIME 类型")


class UploadBatchResponse(BaseModel):
    list: list[UploadFileResponse]
    total: int = Field(..., description="上传成功文件数")