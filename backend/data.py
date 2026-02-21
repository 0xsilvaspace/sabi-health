import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Base, User, Log
from typing import Dict, List

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URI")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    # Convert to asyncpg if needed
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = None
AsyncSessionLocal = None

if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    print("⚠️ DATABASE_URI not found in environment")

async def init_db():
    if engine:
        async with engine.begin() as conn:
            # For MVP, we can drop and recreate or just create
            # await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
    else:
        print("⚠️ Skipping DB init: Engine not initialized")

# Keep legacy mocks for fallback if needed during transition, 
# but they will be phased out in main.py
users_db = {}
logs_db = []