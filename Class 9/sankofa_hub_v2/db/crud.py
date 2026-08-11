from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import AuditLog, Conversation, Message, User, UserRole


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession, email: str, name: str, password_hash: str
) -> User:
    user = User(
        id=str(uuid4()),
        email=email,
        name=name,
        password_hash=password_hash,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_conversation(
    db: AsyncSession, user_id: str, title: str | None = None
) -> Conversation:
    conv = Conversation(
        id=str(uuid4()),
        user_id=user_id,
        title=title,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


async def get_conversation(
    db: AsyncSession, conversation_id: str
) -> Conversation | None:
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()


async def get_user_conversations(
    db: AsyncSession, user_id: str
) -> list[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())


async def save_message(
    db: AsyncSession,
    conversation_id: str,
    role: str,
    content: str,
    bot_id: str | None = None,
    bot_name: str | None = None,
    route_taken: str | None = None,
) -> Message:
    msg = Message(
        id=str(uuid4()),
        conversation_id=conversation_id,
        role=role,
        content=content,
        bot_id=bot_id,
        bot_name=bot_name,
        route_taken=route_taken,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_conversation_messages(
    db: AsyncSession, conversation_id: str
) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())


async def get_conversation_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Conversation.id)))
    return result.scalar() or 0


async def get_message_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Message.id)))
    return result.scalar() or 0


async def get_messages_today(db: AsyncSession) -> int:
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    result = await db.execute(
        select(func.count(Message.id)).where(Message.created_at >= today_start)
    )
    return result.scalar() or 0


async def get_messages_by_bot(db: AsyncSession) -> dict[str, int]:
    result = await db.execute(
        select(Message.bot_name, func.count(Message.id)).group_by(
            Message.bot_name
        )
    )
    return {row[0]: row[1] for row in result.all()}


async def get_all_users_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[User]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    return list(result.scalars().all())


async def get_all_conversations_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[Conversation]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(Conversation)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def update_user_role(
    db: AsyncSession, user_id: str, role: UserRole
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        user.role = role
        await db.commit()
        await db.refresh(user)
    return user


async def toggle_user_active(
    db: AsyncSession, user_id: str
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        user.is_active = not user.is_active
        await db.commit()
        await db.refresh(user)
    return user


async def create_audit_log(
    db: AsyncSession,
    action: str,
    user_id: str | None = None,
    detail: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    log = AuditLog(
        id=str(uuid4()),
        user_id=user_id,
        action=action,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_audit_logs_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[AuditLog]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def update_user_profile(
    db: AsyncSession, user_id: str, name: str | None = None, email: str | None = None
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        await db.commit()
        await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: str) -> bool:
    user = await get_user_by_id(db, user_id)
    if user:
        await db.delete(user)
        await db.commit()
        return True
    return False


async def get_user_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(User.id)))
    return result.scalar() or 0


async def search_users(db: AsyncSession, query: str, page: int = 1, limit: int = 20) -> list[User]:
    offset = (page - 1) * limit
    search = f"%{query}%"
    result = await db.execute(
        select(User)
        .where(User.name.ilike(search) | User.email.ilike(search))
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def search_users_count(db: AsyncSession, query: str) -> int:
    search = f"%{query}%"
    result = await db.execute(
        select(func.count(User.id)).where(User.name.ilike(search) | User.email.ilike(search))
    )
    return result.scalar() or 0
