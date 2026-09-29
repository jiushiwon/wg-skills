# 岗位管理路由

from fastapi import APIRouter, Depends, HTTPException
from src.auth.schemas import PageRequest, PageResponse
from src.auth.dependencies import get_current_user
from src.auth.services.post_service import PostService
from src.auth.schemas import CurrentUser
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/posts", tags=["岗位管理"])


class PostCreateRequest(BaseModel):
    name: str
    code: str
    sort_order: int = 0
    status: int = 1


class PostUpdateRequest(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    sort_order: Optional[int] = None
    status: Optional[int] = None


class PostResponse(BaseModel):
    id: int
    name: str
    code: str
    sort_order: int
    status: int


@router.get("")
async def list_posts(
    page: int = 1,
    page_size: int = 10,
    name: str = None,
    code: str = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    """岗位列表"""
    return await PostService.list_posts(page, page_size, name, code)


@router.get("/{post_id}")
async def get_post(
    post_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """岗位详情"""
    post = await PostService.get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="岗位不存在")
    return post


@router.post("")
async def create_post(
    req: PostCreateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """创建岗位"""
    return await PostService.create_post(req, current_user)


@router.put("/{post_id}")
async def update_post(
    post_id: int,
    req: PostUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    """更新岗位"""
    await PostService.update_post(post_id, req)
    return {"code": 0, "message": "更新成功"}


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: CurrentUser = Depends(get_current_user)
):
    """删除岗位（软删除）"""
    await PostService.delete_post(post_id)
    return {"code": 0, "message": "删除成功"}


@router.get("/all")
async def get_all_posts(
    current_user: CurrentUser = Depends(get_current_user)
):
    """获取所有岗位（用于下拉选择）"""
    return await PostService.get_all_posts()
