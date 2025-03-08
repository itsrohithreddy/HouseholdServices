# Household Services Application - V2

## Introduction

This project is a multi-user household services platform designed for service professionals, customers, and an admin user with root access. It provides a wide range of home servicing and solutions with functionalities to manage users, services, and service requests.

## Technologies Used

### Backend:
- **Flask** - REST API framework for handling backend logic.
- **SQLite** - Database used to store user data, services, and requests.
- **Redis** - For caching and handling asynchronous tasks.
- **Celery** - Task queue system integrated with Redis for batch job execution.

### Frontend:
- **Vue.js** - For creating the user interface.
- **Bootstrap** - For responsive design and styling.
- **Jinja2** - For server-side template rendering when necessary (excluding UI).

### Other Tools:
- **JWT** - For handling user authentication and role-based access control.
- **Google Chat Webhooks** or **Mail** - For sending reminders and notifications.

## Roles in the Application

### 1. Admin
The admin is the superuser with root access, responsible for overseeing the platform.
- Can monitor all users (customers and service professionals).
- Approves service professionals after verifying their documents.
- Blocks/unblocks users based on performance or fraudulent activity.
- Manages services (create, update, and delete).
- Manages batch jobs and reports.

### 2. Service Professional
The service professional provides various household services such as plumbing, electrical, etc.
- Can register/login.
- Accept/reject service requests.
- View assigned service requests.
- Complete services and close service requests.
- Receives daily reminders for pending service requests.

### 3. Customer
The customer uses the platform to book services.
- Can register/login.
- View and search for available services based on location or service type.
- Create new service requests.
- Edit or close a service request.
- Review and rate service professionals after completion.

## Key Functionalities

### 1. Authentication
- **Role-Based Access Control (RBAC)**: Admin, service professional, and customer have distinct roles with different access levels.
- JWT-based authentication for secure login and registration.

### 2. Admin Dashboard
- Manage users, services, and service requests.
- View reports and export data.

### 3. Service Management (Admin)
- Add, update, and delete services (e.g., service name, price, and description).
- View all available services.

### 4. Service Requests (Customer)
- Create, edit, or close service requests based on available services.
- View history of past service requests.
  
### 5. Service Assignment (Service Professional)
- Accept/reject service requests.
- Mark service requests as completed after execution.

### 6. Backend Jobs
- **Daily Reminders**: Reminds service professionals via G-chat, mail, or SMS if they have pending service requests.
- **Monthly Activity Report**: Generates an HTML or PDF report of customer activities and sends it by email.
- **CSV Export**: Admin can export the details of closed service requests into a CSV file.

### 7. Caching & Performance
- Redis is used to cache frequently accessed data and optimize performance.
- Cached data is periodically refreshed to ensure accuracy.

### 8. Search
- Customers can search for services by name, location, or pin code.
- Admins can search for service professionals to manage their profiles.

### 9. Responsive Design
- The platform is fully responsive, designed to work on both desktop and mobile devices.

## Installation and Setup

### Prerequisites
- Python 3.x
- Node.js (for Vue.js)
- SQLite
- Redis
- Celery

### Steps

1. **Clone the repository:**
   ```
   git clone https://github.com/AddagallaSaiTharun/Household-Services
   ```

2. **Backend Setup:**
   - Create a virtual environment:
     ```
     python3 -m venv venv
     source venv/bin/activate
     ```
   - Install the required Python packages:
     ```
     pip install -r requirements.txt
     ```
   - Run the Flask application:
     ```
     flask run main.py
     ```

3. **Setup Redis and Celery:**
   - Install and start Redis.
   - Run Celery workers:
     ```
     celery -A tasks worker --loglevel=info
     ```

### Configuration
- Adjust configurations for Redis, Flask, and SQLite in the respective environment files or settings.

## Usage

### Admin:
- Login at `/admin`.
- Access the dashboard to manage services, users, and batch jobs.

### Service Professional:
- Register at `/professional`.
- Accept/reject service requests via the dashboard.

### Customer:
- Register at `/customer`.
- Book or close a service request from the available services.

## Future Enhancements

- Integration of payment gateways for seamless payment processing.
- Advanced search filters for better service discovery.
- SMS notifications using third-party services like Twilio.