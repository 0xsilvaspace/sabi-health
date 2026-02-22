# reset_db.py
import asyncio
from data import engine
from models import Base

async def reset_db():
    print("⚠️  Resetting database...")
    async with engine.begin() as conn:
        # Drop all tables
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        print("Recreating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_db())
