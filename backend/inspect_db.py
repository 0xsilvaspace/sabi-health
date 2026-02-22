import asyncio
from sqlalchemy import select, func
from data import engine, AsyncSessionLocal
from models import DBUser

async def inspect():
    async with AsyncSessionLocal() as session:
        # Check for duplicates using select()
        print("Checking for duplicate phone numbers...")
        # Get counts grouped by phone
        stmt = select(DBUser.phone).group_by(DBUser.phone).having(func.count(DBUser.phone) > 1)
        result = await session.execute(stmt)
        duplicate_phones = result.scalars().all()
        
        if duplicate_phones:
            print(f"Found {len(duplicate_phones)} phone numbers with multiple records:")
            stmt = select(DBUser).where(DBUser.phone.in_(duplicate_phones))
            result = await session.execute(stmt)
            duplicates = result.scalars().all()
            for u in duplicates:
                print(f"ID: {u.id}, Name: {u.name}, Phone: {u.phone}")
        else:
            print("No duplicate phone numbers found.")

        # Total users
        result = await session.execute(select(func.count(DBUser.id)))
        count = result.scalar()
        print(f"Total users in DB: {count}")

        # Sample user
        result = await session.execute(select(DBUser).limit(1))
        sample = result.scalar_one_or_none()
        if sample:
            print(f"Sample user: {sample.name} ({sample.phone})")

if __name__ == "__main__":
    asyncio.run(inspect())
