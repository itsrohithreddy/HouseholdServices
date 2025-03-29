from flask_restful import Resource
from flask import current_app as app
from flask import request,make_response,jsonify,render_template,redirect ,session, flash
from application.data.database import db
from application.data.models import Users
from application.utils.validation import generate_csrf_token,replace_with_ascii,replace_with_chars,checkEmpty,checkDob,gen_uuid
from application.jobs import tasks
import jwt
from authlib.integrations.flask_client import OAuth
from datetime import datetime, timedelta, timezone
# from application.controller.sse import server_side_event



oauth  = OAuth(app)
google = oauth.register(
    'google',
    client_id=app.config.get('GOOGLE_CLIENT_ID'),
    client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
    access_token_url=app.config.get('GOOGLE_ACCESS_TOKEN_URL'),
    authorize_url=app.config.get('GOOGLE_AUTHORIZE_URL'),
    api_base_url=app.config.get('GOOGLE_API_BASE_URL'),
    client_kwargs={'scope': 'email profile'},
)



class SignInAPI(Resource):
    #Time Being
    def __init__(self):
        from main import bcrypt
        self.bcrypt = bcrypt
        
    # def get(self):
    #     """
    #     Handle GET request to /api/signin
    #     """
    #     return make_response(render_template('signin.html'), 200, {'Content-Type': 'text/html'})

    def post(self):
        """
        Handle POST request to /api/signin
        """
        data = request.get_json()
        username = data['email']
        password = data['password']
        user_check=Users.query.filter(Users.user_name == username).first()
        if user_check.role == "blckd":
            return make_response(
            render_template(
                'blckd.html',
            ),
            200,
            {'Content-Type': 'text/html'}
            )
        response = None
        if user_check:
            if self.bcrypt.check_password_hash(user_check.password, password):
                print("Password Check Successful.")
                generate_csrf_token()
                print("CSRF Token : ",session.get("csrf_token"))
                decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
                decoded_token["username"] = username
                decoded_token["name"] = user_check.first_name + user_check.last_name
                decoded_token["pic_url"] = user_check.user_image_url
                decoded_token['user_id'] = user_check.user_id
                if user_check.role == "cust":
                    decoded_token["role"] = "cust"
                elif user_check.role == "prof":
                    decoded_token["role"] = "prof"
                decoded_token["loggedIn"] = "1"
                decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
                new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
                # print("Cookie token after login : ",request.cookies.get('token'))
                response = make_response(jsonify({
                    'message': 'Login successful',
                    'flag' : 1,
                    'data' : {"username":user_check.user_name,"loggedIn":"1","role":user_check.role,"user_id":user_check.user_id},
                    'csrf_token' : session.get("csrf_token"),
                    'status': 'success'
                }), 200)
                response.set_cookie("token",new_token)
            else:
                response = make_response(jsonify({
                    'message': 'Login unsuccessful.Password Incorrect',
                    'flag' : 0,
                    'status': 'failure'
                }), 401)
            response.headers['Content-Type'] = 'application/json'
            return response
        else:
            response = make_response(jsonify({
                'message': 'Login unsuccessful.User not registered.',
                'flag' : 0,
                'status': 'failure'
            }), 401)
            response.headers['Content-Type'] = 'application/json'
            return response




class GoogleOAuthAPI(Resource):
    def get(self):
        """
        Handle GET request to /api/signin_google
        """
        # print(dir(google) )
        # print("Cookie token before login : ",request.cookies.get('token'))
        #Time being below sse
        # server_side_event(msg = "Recieved from ghjkl dfghjk" , link = "http://localhost:5000/api/register", type = "customer")
        redirect_uri = 'http://localhost:5000/api/signin_google/callback'
        return google.authorize_redirect(redirect_uri)



class GoogleOAuthCallbackAPI(Resource):
    def get(self):
        """
        Handle GET request to api/signin_google/callback
        """
        resp = google.authorize_access_token()
        # print("Response : ",resp)
        if resp is None or resp.get('access_token') is None:
            return 'Access denied: reason=%s error=%s' % (
                request.args['error_reason'],
                request.args['error_description']
            )
        session['google_token'] = (resp['access_token'],'')
        # print("Session Token  : ",session['google_token'])
        # print("Session : ",session)
        # print("Token Getter : ",google.tokengetter)
        user_info = google.get('userinfo')
        # print("User Info : ",user_info)
        user_data = user_info.json()  # Use .json() to get the data as a dictionary
        # print('Logged in with id :  ' , user_data.get('email')," Name : ",user_data.get('name') , " Given name : ",user_data.get('given_name'), " Family Name : ",user_data.get('family_name'), " Picture : ",user_data.get('picture'))
        username = user_data.get('email')
        firstname = user_data.get('given_name')
        lastname = user_data.get('family_name')
        name = user_data.get('name')
        picture = user_data.get('picture')
        response = None
        user_check=Users.query.filter(Users.user_name == username).first()
        
        if user_check:
            if user_check.role == 'blckd':
                return make_response(
                render_template(
                    'blckd.html',
                ),
                200,
                {'Content-Type': 'text/html'}
                )
            response = self.update_user(user_check, username, firstname, lastname, picture)
        else:
            response = self.handle_new_google_user(username, name, picture)
        return response



    def update_user(self, user_check, username, firstname, lastname, picture):
        response = None
        try:
            user_check.user_name = username
            l = [s.capitalize() for s in firstname.split()]
            user_check.first_name = " ".join(l)
            user_check.last_name = lastname.capitalize()
            user_check.user_image_url = picture
            db.session.commit()
            generate_csrf_token()
            decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
            decoded_token.update({
                "username": username,
                "name": user_check.first_name + " " + user_check.last_name,
                "pic_url": picture,
                "role": user_check.role if user_check.role in ["cust", "prof"] else "blckd",
                "loggedIn": "1",
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
                "user_id": user_check.user_id
            })
            new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
            # print("Cookie token after login : ",request.cookies.get('token'))
            # response = make_response(jsonify({
            #     'message': 'Login successful',
            #     'flag':1,
            #     'data' : {"name":user_check.first_name,"loggedIn":"1","role":user_check.role,"pic_url":user_check.user_image_url},
            #     'status': 'success'
            # }), 200)
            response = make_response(redirect('/index'),200)
            response.set_cookie("token",new_token)
            return response
        except Exception as e:
            print("Rolling Back due to error : ",e)
            db.session.rollback()
            # response = make_response(jsonify({
            #     'message': 'Login unsuccessful, database error. Try again',
            #     'flag':0,
            #     'status': 'failure'
            # }), 503)
            return make_response(redirect('/'),503)

    def handle_new_google_user(self, username, name, picture):
        response = None
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        decoded_token.update({
            "loggedIn" : "0",
            "username" : username,
            "name" : name,
            "pic_url" : picture
        })
        # print(picture)
        encoded_url = replace_with_ascii(picture)
        # print(encoded_url)
        new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
        # response = make_response(jsonify({
        #     'message': 'OAuth Registration successful,check your mail for a link to fill in few more details.Only then you can login back.',
        #     'flag':1,
        #     'status': 'success',
        #     'redirect': '/',
        # }), 200)
        response = make_response(redirect('/index'),200)
        response.set_cookie("token",new_token)
        email = username
        subject = "Registration (Fill few more details)"
        link = f"http://localhost:5000/api/signup_details/oauth/{username}/{name}/{encoded_url}"
        body = f"""
            <p><b>Welcome to Household Services.</b></p>
            <p>Thank you for your interest in us!<p/>
            <p>Loking Forward to serve you :)</p>
            <p>Please click the link below to complete your registration by filling in few more details(***Only then will you be able to login***):</p>
            <p><a href="{link}">Complete Registration by clicking here!!</a></p>
            <p><b>Have a great day.</b></p>
        """
        # Call the Celery task
        job = tasks.send_registration_email.delay(email, subject, body)
        # print("Job status : ",job.status)
        flash("Please check your mail for a link. Click the link and complete your registration. Only then can you signin.", "success")  # Flash message
        return response
    



class SignUpDetailsOAuthAPI(Resource):
    def get(self, username=None, name=None, encoded_url=None):
        """
        Handle GET request to api/signup_details/oauth/<string:username>/<string:name>/<string:encoded_url>
        """
        if username is not None and name is not None and encoded_url is not None:
            if request.cookies.get('token')  is None:
                token_payload = {
                    'username' : username,
                    'name': name,
                    'role': "",
                    'loggedIn':"0",
                    'pic_url': replace_with_chars(encoded_url),
                    'admin' : "0",
                    'admin_u' : "",
                }
                token = jwt.encode(token_payload,app.config['SECRET_KEY'], algorithm='HS256')
                response = make_response(redirect(f"/signup_details_google/{username}/{name}/{encoded_url}"))
                response.set_cookie("token",token)
                return response
            # return render_template('signup_details.html',username = username)
            return make_response(render_template('signup_details.html',username = username), 200, {'Content-Type': 'text/html'})
        else:
            response = make_response(jsonify({'message': 'Something missing','flag':0,'status': 'failure'}),400)
            response.headers['Content-Type'] = 'application/json'
            return response
        

    def post(self):
        """
        Handle POST request to /api/signup_details/oauth
        """
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        data = request.get_json()
        username = data['email']
        firstname = " ".join([s.capitalize() for s in decoded_token['name'].split(' ')][:-1])
        lastname = decoded_token['name'].split(' ')[-1].capitalize()
        dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        gender = data['gender']
        phone = data['phone']
        pincode = data['pincode']
        address = data['address']
        address_link = data['address_link']
        role = "cust"
        response=None
        picture = decoded_token['pic_url']
        user_check=Users.query.filter(Users.user_name == username).first()
        if user_check:
            response = make_response(jsonify({'message': 'User already registered','flag':0,'status': 'failure'}),403)
        else:
            if checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkDob(dob):
                with app.app_context():
                        try:
                            if 'offersCheck' in request.form:
                                new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,dob=dob,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1,user_image_url=picture)
                            else:
                                new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,dob=dob,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,user_image_url=picture)
                            db.session.add(new_user)
                            db.session.commit()
                            email = username
                            subject = "Registration Successfull"
                            body = f"""
                                <p><b>Your Registration is complete.</b></p>
                                <p>You can Signin and use our services.<p>
                                <p>Thank you for your interest in us!<p/>
                                <p>Loking Forward to serve you :)</p>
                                <p><b>Have a great day.</b></p>
                            """
                            # Call the Celery task
                            job = tasks.send_registration_email.delay(email, subject, body)
                            flash("Registration completed. Please SignIn back to use the services.", "success")  # Flash message
                            response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
                        except Exception as e:
                            print("Rolling Back due to Database error  :",e)
                            db.session.rollback()
                            response = make_response(jsonify({
                                'message': 'Database Error. Try again',
                                'flag':0,
                                'status': 'failure'
                            }), 503)
                            flash("Registration could not be completed. Please try again.")  # Flash message
                            response.headers['Content-Type'] = 'application/json'
                            return response



