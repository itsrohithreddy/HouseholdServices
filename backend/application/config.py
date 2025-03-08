import os
from dotenv import load_dotenv
from pathlib import Path


load_dotenv()
env_path = Path('.env')
load_dotenv(dotenv_path=env_path)

cur_dir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess-this'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class localConfig(Config):
    SQLITE_DB_DIR = os.path.join(cur_dir, "../db_directory")
    SQLALCHEMY_DATABASE_URI ="sqlite:///" + os.path.join(SQLITE_DB_DIR, "household_services.db")
    PORT = 5000
    HOST = "localhost"
    DEBUG = True

    # Google OAuth configurations
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_ACCESS_TOKEN_URL = os.environ.get('GOOGLE_ACCESS_TOKEN_URL')
    GOOGLE_AUTHORIZE_URL = os.environ.get('GOOGLE_AUTHORIZE_URL')
    GOOGLE_API_BASE_URL = os.environ.get('GOOGLE_API_BASE_URL')


    # Flask-Mail configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('EMAIL_USER')  # Your Gmail address
    MAIL_PASSWORD = os.environ.get('EMAIL_PASS')  # Your Gmail password
    MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER')  # Default sender for emails

    # # Celery configuration
    # CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
    # CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

    # Celery configuration
    CELERY_BROKER_URL = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
    REDIS_URL = "redis://localhost:6379/0"

    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
    ADMIN_NAME = os.environ.get("ADMIN_NAME")
    

