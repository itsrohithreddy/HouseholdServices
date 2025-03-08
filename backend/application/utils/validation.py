import jwt
from flask import current_app as app
from flask import session ,request ,make_response ,jsonify, redirect, flash
from functools import wraps
import secrets
import jwt
import uuid
from PIL import Image
from io import BytesIO
import base64
import random
import string
# from flask_sse import sse
from datetime import datetime, timedelta


# Generate a random OTP
def generate_otp(length=6):
    otp = ''.join(random.choices(string.digits, k=length))  # Generates a 6-digit OTP
    return otp


# Function to check OTP expiration
def is_otp_expired():
    if 'otp_expiration' in session:
        expiration_time = datetime.fromisoformat(session['otp_expiration'])
        return datetime.now() > expiration_time
    return False



#Generates unique id(PK) for Tables in SQLite Database
def gen_uuid():
    return str(uuid.uuid4())




def base64encode(img):
    image = Image.open(img)
    print(f"Original size of the image: ",image.size)
    image_sz = image.resize((190,190))
    print(f"After resizing - size of the image: ",image_sz.size)
    buffered = BytesIO()
    image_sz.save(buffered, format="PNG")
    image_io= base64.b64encode(buffered.getvalue())
    return image_io


#Decode base64 image
def decodeutf8(value):
    decoded_value = value.decode('utf-8')
    return decoded_value
app.jinja_env.filters['decodeutf8'] = decodeutf8



#CSRF Token generator. CSRF Token will be included in the header of each each api request to prevent Cross Site Request Forgery(CSRF attack).
def generate_csrf_token():
    session['csrf_token'] = secrets.token_hex(32)
    # print(session['csrf_token'])
    return session['csrf_token']


#To inject the csrf token to the frontend via flask's context processor.
# @app.context_processor
# def inject_csrf_token():
#     return {'csrf_token': generate_csrf_token()}




#Decorator to check for cookie expiry
#Custom decorator
def check_loggedIn_jwt_expiration(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('token')
        response = None
        if not token:
            # If no token is found, redirect or return an error response
            response = make_response(jsonify({"message": "Token is missing!","status": "failure"}), 401)
            response.headers['Content-Type'] = 'application/json'
            return response

        try:
            # Simply trying to Decode the token is enough here
            # If the token expires then bolow line throws exception `jwt.ExpiredSignatureError` 
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # print("Inside.............. jwt decor try after decoding")
            # print("Decoded Token(Cookie) : ",decoded_token)
            # print("Token(Cookie) not expired")
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            # If token has expired (based on 'exp' claim)
            # print("Expired and changed...................")
            generate_csrf_token()
            # print("CSRF Token : ",session.get('csrf_token'))
            session.pop('google_token', None)
            # session.pop('csrf_token',None)
            # response = make_response(jsonify({"message": "Cookie expired. Please LogIn again to continue","status": "failure"}), 403)
            # response.set_cookie('token', '',expires=0)  # Clear the token cookie
            # response.headers['Content-Type'] = 'application/json'
            # return response
            # print("Inside....... jwt decor except")
            flash("Your session has expired. Please log in again.", "error")  # Flash message
            response = make_response(redirect("/"))
            response.set_cookie('token', '',expires=0)  # Clear the token cookie
            # response.delete_cookie('token')
            return response
    return decorated_function


#Decorator to check for cookie expiry(Admin)
#Custom decorator
def check_loggedIn_jwt_expiration_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('admin_token')
        response = None
        if not token:
            # If no token is found, redirect or return an error response
            response = make_response(jsonify({"message": "Admin Token is missing!","status": "failure"}), 401)
            response.headers['Content-Type'] = 'application/json'
            return response

        try:
            # Simply trying to Decode the token is enough here
            # If the token expires then bolow line throws exception `jwt.ExpiredSignatureError` 
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # print("Inside.............. admin jwt decor try after decoding")
            # print("Decoded Token(Cookie) : ",decoded_token)
            # print("Token(Cookie) not expired")
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            # If token has expired (based on 'exp' claim)
            # print("Expired and changed...................")
            generate_csrf_token()
            # print("CSRF Token : ",session.get('csrf_token'))
            # session.pop('csrf_token',None)
            # response = make_response(jsonify({"message": "Cookie expired. Please LogIn again to continue","status": "failure"}), 403)
            # response.set_cookie('admin_token', '',expires=0)  # Clear the token cookie
            # response.headers['Content-Type'] = 'application/json'
            # return response
            # print("Inside....... admin jwt decor except")
            # flash("Your session has expired. Please log in again.", "error")  # Flash message
            response = make_response(redirect("/admin"))
            response.set_cookie('admin_token', '',expires=0)  # Clear the token cookie
            return response
    return decorated_function
    

#Custom decorator to chose between check_loggedIn_jwt_expiration_admin or check_loggedIn_jwt_expiration
def use_decor_exp(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        chosen_decor = check_loggedIn_jwt_expiration_admin if request.cookies.get('admin_token') else check_loggedIn_jwt_expiration
        # Apply the chosen decorator to the original function
        decorated = chosen_decor(f)
        # Call the decorated function
        return decorated(*args, **kwargs)
    return decorated_function



#Decorator to validate if the API request's header has csrf token or not
# Custom CSRF protection decorator
def csrf_protect(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        csrf_token = request.headers.get('X-CSRF-Token')
        
        if not csrf_token or csrf_token != session.get('csrf_token'):
            response = make_response(jsonify({"message":"Invalid or missing CSRF token. Operation Aborted!!!","flag":0,"status":"failure"}),401)
            response.headers['Content-Type'] = 'application/json'
            return response
        # print("CSRF Token : ",session.get('csrf_token'))
        # print("checked")
        print("CSRF Token present.")
        return f(*args, **kwargs)
    
    return decorated_function



#Custom LoggedIn status check decorator
def check_loggedIn_status(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = None
        decoded_token = None
        decoded_token_admin = None
        if request.cookies.get('token'):
            decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        elif request.cookies.get('admin_token'):
            decoded_token_admin = jwt.decode(request.cookies.get('admin_token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        if (decoded_token_admin and decoded_token_admin["admin_loggedIn"] == "1") or (decoded_token and decoded_token["loggedIn"] == "1"):
            print("Here..........Logged In status decor.........")
            return f(*args,**kwargs)
        else:
            response = make_response(jsonify({"message": "Please Signin to make API request.","flag":0,"status": "failure"}), 401)
            response.headers['Content-Type'] = 'application/json'
            return response
    return decorated_function




#Custom customer check decorator 
# def check_role_cust(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         response = None
#         decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#         if decoded_token["role"] == "cust":
#             return f(*args,**kwargs)
#         else:
#             response = make_response(jsonify({"message": "Access Denied!","flag":0,"status": "failure"}), 403)
#             response.headers['Content-Type'] = 'application/json'
#             return response
#     return decorated_function


# Custom professional check decorator 
def check_role_prof(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = None
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        if decoded_token["role"] == "prof":
            return f(*args,**kwargs)
        else:
            response = make_response(jsonify({"message": "Access Denied!","flag":0,"status": "failure"}), 403)
            response.headers['Content-Type'] = 'application/json'
            return response
    return decorated_function





def checkEmpty(x):
    if not x:
        return False
    return True


def checkPswd(x1,x2):
    if not x1:
        return False
    else:
        if x1==x2:
            return True
def checkDob(x):
    if x is None:
        return False
    else:
        return True



#To encode the user picture url so as to send is as other url's parameter.
def replace_with_ascii(input_str):
    # Create a mapping of characters to their ASCII values
    ascii_map = {
        '.': '@',
        '/': '*',
        ':': '#'
    }
    # Replace characters in the input string with their ASCII values
    for char, ascii_value in ascii_map.items():
        input_str = input_str.replace(char, ascii_value)
    
    return input_str

#To decode the user picture url from other url's parameter.
def replace_with_chars(input_str):
    # Create a mapping of ASCII values to their characters
    char_map = {
        '@': '.',
        '*': '/',
        '#': ':'
    }

    # Replace ASCII values in the input string with their corresponding characters
    for ascii_value, char in char_map.items():
        input_str = input_str.replace(ascii_value, char)
    
    return input_str


