from fastapi import APIRouter, Depends, File, UploadFile

from app.config import settings
from app.response import EnvelopeRoute
from app.dependencies import optional_current_user
from app.schemas.upload import UploadFileResponse, UploadBatchResponse
from app.services.upload import UploadService

router = APIRouter(route_class=EnvelopeRoute)


@router.post("/upload", summary="单文件上传")
async def upload_file(
    file: UploadFile = File(..., description="待上传文件"),
    _=Depends(optional_current_user),
):
    service = UploadService()
    result = await service.save(file)
    return UploadFileResponse(**result)


@router.post("/uploads", summary="多文件上传")
async def upload_files(
    files: list[UploadFile] = File(..., description="待上传文件列表"),
    _=Depends(optional_current_user),
):
    service = UploadService()
    result = await service.save_batch(files)
    return UploadBatchResponse(**result)