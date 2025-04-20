
from flask_restful import Resource
from flask import request,make_response,jsonify
from application.data.database import db
from application.data.models import Users
from application.utils.validation import checkEmpty,checkDob,gen_uuid
from application.jobs import tasks
from datetime import datetime 



class SignUpAPI(Resource):
    def __init__(self):
        from app import bcrypt
        self.bcrypt = bcrypt
    # def get(self):
    #     # return render_template("signup.html")
    #     return make_response(render_template('signup.html'), 200, {'Content-Type': 'text/html'})
    """
    Handel POST request to /api/signup
    """
    def post(self):
        data = request.get_json()
        password = data['password']
        username = data['email']
        l = [s.capitalize() for s in data['firstname'].split()]
        firstname = " ".join(l)
        lastname = data['lastname'].capitalize()
        dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        gender = data['gender']
        phone = data['phone']
        pincode = data['pincode']
        address = data['address']
        address_link = data['address_link']
        role = "cust"
        response = None
        user_check = Users.query.filter_by(user_name = username).first()
        if user_check:
           response = make_response(
                    jsonify({'message': 'User with this email(username) already registered.Use different email or Go for Login.', 'flag': 0, 'status': 'failure'}),
                    503,
                )
        else:
            if checkEmpty(username) and checkEmpty(firstname) and checkEmpty(lastname) and checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkDob(dob):
                try:
                    if 'offersCheck' in data:
                        new_user = Users(
                            user_id=gen_uuid(),
                            user_name=username,
                            role=role,
                            password=self.bcrypt.generate_password_hash(password).decode('utf-8'),
                            first_name=firstname,
                            last_name=lastname,
                            dob=dob,
                            gender=gender,
                            phone=phone,
                            address=address,
                            address_link=address_link,
                            pincode=pincode,
                            offers_mail=1,
                        )
                    else:
                        new_user = Users(
                            user_id=gen_uuid(),
                            user_name=username,
                            role=role,
                            password=self.bcrypt.generate_password_hash(password).decode('utf-8'),
                            first_name=firstname,
                            last_name=lastname,
                            dob=dob,
                            gender=gender,
                            phone=phone,
                            address=address,
                            address_link=address_link,
                            pincode=pincode,
                        )
                    db.session.add(new_user)
                    db.session.commit()
                    print("committed.....")
                    
                    # Send email after successful registration
                    email = username
                    subject = "Registration Successful."
                    body = """
                        <p><b>Welcome to Household Services.</b></p>
                        <p>Login into the website with the registered username and password</p>
                        <p>Looking forward to serve you :)</p>
                        <p><b>Thank you for registering!</b></p>
                    """
                    job = tasks.send_registration_email.delay(email, subject, body)
                    print("dispatched")
                    response = make_response(
                        jsonify({'message': 'Registration successful', 'flag': 1, 'status': 'success'}),
                        200,
                    )
                    
                except Exception as e:
                    print("Rolling back. Issue with database Insertion", e)
                    db.session.rollback()
                    response = make_response(
                        jsonify({'message': 'User could not be registered due to database error.Try after sometime', 'flag': 0, 'status': 'failure'}),
                        503,
                    )
            else:
                response = make_response(
                    jsonify({'message': 'User could not be registered. Something is missing', 'flag': 0, 'status': 'failure'}),
                    400,
                )
        # response.headers['Content-Type'] = 'application/json'
        return response

