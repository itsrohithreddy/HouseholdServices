from application.jobs.workers import clry
# from celery import shared_task
from flask_mail import Message
import requests



@clry.task(bind=True, max_retries=3, default_retry_delay=60)
def send_registration_email(self, to_email, subject, body):
    """Sends an email with retry on failure."""
    from app import mail
    try:
        msg = Message(subject, recipients=[to_email])
        msg.html = body
        mail.send(msg)
        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        self.retry(exc=e)






@clry.task(bind=True, max_retries=3, default_retry_delay=60)
def send_report_to_professional(self, recipient_email, report_details):
    from app import mail
    try:
        subject = "Monthly Report"
        body = f"""
            <h1>Household Services</h1>
            <p>Spend some time to look at the report sent :)</p>
            <p>Service Name : <b>{report_details["service_name"]}</b></p>
            <p>Service requests received : <b>{report_details["srvcreqs_rcvd"]}</b></p>
            <p>Service requests accepted : <b>{report_details["srvcreqs_acpt"]}</b></p>
            <p>Service requests rejected : <b>{report_details["srvcreqs_rjtd"]}</b></p>
            <p>Service requests pending : <b>{report_details["srvcreqs_pend"]}</b></p>
            <p>Average rating until today : <b>{report_details["avg_rating"]}</b></p>
            <br><br>
            <p><b>Thank you.</b></p>
            <p><b>Keep SMILING and keep SERVING....</b></p>
        """
        
        # Prepare and send email
        msg = Message(subject, recipients=[recipient_email])
        msg.html = body
        mail.send(msg)
        print(f"Monthly report sent to {recipient_email} successfully!")

    except Exception as e:
        print(f"Failed to send email to {recipient_email}: {e}")
        self.retry(exc=e)  # Retry sending the email only for this recipient


@clry.task(bind = True)
def send_monthly_report(self):
    print("Hi from report sending.......")
    try:
        # API call to get emails of professionals
        response = requests.get("http://127.0.0.1:5000/api/professional_emails")
        if response.status_code == 200:
            recipients = response.json().get("data")

            for id, recipient_email in recipients:
                try:
                    # API call to get report details for each professional
                    report_response = requests.get(f"http://127.0.0.1:5000/api/report_details/{id}")
                    if report_response.status_code == 200:
                        report_data = report_response.json().get("data")
                        # Call a separate Celery task for each recipient's email
                        send_report_to_professional.delay(recipient_email, report_data)
                    else:
                        print(f"Failed to retrieve report details for professional ID {id}")

                except Exception as e:
                    print(f"Error occurred while processing professional ID {id}: {e}")

        else:
            print("Failed to retrieve professional emails")

    except Exception as e:
        print(f"Error in send_monthly_report task: {e}")

