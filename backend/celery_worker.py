from application.jobs.workers import clry
# from application.jobs.tasks import send_monthly_report
from celery.schedules import crontab

# Schedule the task to run monthly on the 1st day at 8:00 AM
clry.conf.beat_schedule = {
    'send-monthly-report': {
        'task': 'application.jobs.tasks.send_monthly_report',
        'schedule': crontab(day_of_month=1, hour=8, minute=0),
    }
}

clry.conf.timezone = 'Asia/Kolkata'

if __name__ == '__main__':
    clry.start()
