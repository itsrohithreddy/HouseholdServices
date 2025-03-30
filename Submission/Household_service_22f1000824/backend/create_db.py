from main import create_app  # Import the create_app function
from application.data.database import db  # Import the SQLAlchemy instance
import os

def create_tables():
    app, _ , _ , _ , _ = create_app()  # Create the Flask app and API
    with app.app_context():  # Push the application context
        db.create_all()  # Create all tables based on models
        print("All tables created successfully.")

if __name__ == '__main__':
    create_tables()
