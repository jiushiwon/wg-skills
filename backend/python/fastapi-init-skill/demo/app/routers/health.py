from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.response import EnvelopeRoute
from app.dependencies import get_db

router = APIRouter(route_class=EnvelopeRoute)


@router.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi-init"}


@router.get("/health/db")
async def health_db(db=Depends(get_db)):
    try:
        if hasattr(db, "execute"):
            await db.execute(text("SELECT 1"))
        elif hasattr(db, "command"):
            await db.command("ping")
        else:
            return {"status": "ok", "database": "none"}
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "ok", "database": "disconnected"}