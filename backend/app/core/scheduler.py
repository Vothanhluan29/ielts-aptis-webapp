from apscheduler.schedulers.asyncio import AsyncIOScheduler #type: ignore
from apscheduler.triggers.cron import CronTrigger #type: ignore
from app.core.database import SessionLocal
from app.modules.subscriptions.service import SubscriptionService


# Global Scheduler
scheduler = AsyncIOScheduler()

def reset_quota_job():
    """
    Reset usage quotas for all users.
    This job runs twice a day.
    """
    db = SessionLocal()

    try:
        print("Scheduler: Starting quota reset job...")
        SubscriptionService.reset_all_quotas(db)
        print("Scheduler: Quota reset completed.")

    except Exception as e:
        print(f"Scheduler Error: {e}")

    finally:
        db.close()


def start_scheduler():
    """
    Initialize and start APScheduler
    """
    if scheduler.running:
        print("Scheduler already running.")
        return

    # Run at 00:00 and 12:00 every day
    trigger = CronTrigger(
        hour="0,12",
        minute="0",
        timezone="Asia/Ho_Chi_Minh"
    )

    scheduler.add_job(
        reset_quota_job,
        trigger=trigger,
        id="reset_quota_job",
        replace_existing=True
    )

    scheduler.start()

    print("Scheduler started.")
    print("Quotas reset at 00:00 and 12:00 daily.")