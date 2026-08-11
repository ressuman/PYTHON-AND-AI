import os
import ssl

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./sankofa_dev.db",
)

engine_kwargs = {
    "echo": False,
    "poolclass": NullPool,
}
if DATABASE_URL.startswith("postgresql"):
    ctx = ssl.create_default_context()
    engine_kwargs["connect_args"] = {"ssl": ctx}

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[DB] Tables created successfully.")
    except Exception as e:
        print(f"[DB] WARNING: Could not connect to database: {e}")
        print("[DB] Server will start but database features will be unavailable.")
        print("[DB] Fix your DATABASE_URL in .env and restart.")
