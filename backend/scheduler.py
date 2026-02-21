# scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
import asyncio
import httpx
from data import users_db

async def check_user_and_call(user_id: str):
    """Internal async function to trigger call for a user."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"http://localhost:8000/call-user/{user_id}")
            resp.raise_for_status()
            print(f"Scheduled call for user {user_id}: {resp.json()}")
        except Exception as e:
            print(f"Failed scheduled call for user {user_id}: {e}")

def run_scheduled_checks():
    """Wrapper to run async checks in sync scheduler thread."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tasks = [check_user_and_call(uid) for uid in users_db.keys()]
    loop.run_until_complete(asyncio.gather(*tasks))
    loop.close()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()
scheduler.add_job(
    func=run_scheduled_checks,
    trigger=IntervalTrigger(hours=1),
    id='hourly_risk_check',
    name='Check all users every hour',
    replace_existing=True
)

# Shut down scheduler on exit
atexit.register(lambda: scheduler.shutdown())