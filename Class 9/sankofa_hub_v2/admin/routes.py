from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user, require_admin
from db.base import get_db
from db.crud import (
    create_audit_log,
    delete_user,
    get_all_conversations_paginated,
    get_all_users_paginated,
    get_audit_logs_paginated,
    get_conversation_count,
    get_message_count,
    get_messages_by_bot,
    get_messages_today,
    get_user_count,
    search_users,
    search_users_count,
    toggle_user_active,
    update_user_profile,
    update_user_role,
)
from db.models import User, UserRole

router = APIRouter(prefix="/admin", tags=["Admin"])


class UpdateUserRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return {
        "total_users": await get_user_count(db),
        "total_conversations": await get_conversation_count(db),
        "total_messages": await get_message_count(db),
        "messages_today": await get_messages_today(db),
        "messages_by_bot": await get_messages_by_bot(db),
    }


@router.get("/users")
async def admin_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if search.strip():
        users = await search_users(db, search, page=page, limit=limit)
        total = await search_users_count(db, search)
    else:
        users = await get_all_users_paginated(db, page=page, limit=limit)
        total = await get_user_count(db)
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/users/{user_id}")
async def admin_get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = await update_user_profile(db, user_id, name=body.name, email=body.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(
        db,
        action="admin_update_user",
        user_id=current_user.id,
        detail=f"Updated user {user_id}: {body.model_dump(exclude_none=True)}",
    )
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "is_active": user.is_active,
    }


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await delete_user(db, user_id)
    await create_audit_log(
        db,
        action="admin_delete_user",
        user_id=current_user.id,
        detail=f"Deleted user {user_id} ({user.email})",
    )
    return {"message": "User deleted", "user_id": user_id}


@router.patch("/users/{user_id}")
async def admin_patch_user(
    user_id: str,
    action: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id and action in ("toggle-active", "demote-user"):
        raise HTTPException(status_code=400, detail=f"Cannot {action} your own account")

    if action == "toggle-active":
        user = await toggle_user_active(db, user_id)
    elif action == "promote-admin":
        user = await update_user_role(db, user_id, UserRole.admin)
    elif action == "demote-user":
        user = await update_user_role(db, user_id, UserRole.user)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await create_audit_log(
        db,
        action=f"admin_{action}",
        user_id=current_user.id,
        detail=f"User {user_id} — {action}",
    )
    return {"message": f"User {action} succeeded", "user_id": user_id}


@router.get("/conversations")
async def admin_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    convs = await get_all_conversations_paginated(db, page=page, limit=limit)
    result = []
    for c in convs:
        user = await db.get(User, c.user_id)
        result.append({
            "id": c.id,
            "user_email": user.email if user else "unknown",
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return result


@router.get("/audit-logs")
async def admin_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logs = await get_audit_logs_paginated(db, page=page, limit=limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "detail": log.detail,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
