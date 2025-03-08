from flask import current_app as app
from flask_restful import Resource
from flask import render_template, redirect, request ,make_response, jsonify,session,request,get_flashed_messages
import jwt
import requests
from application.data.models import ServiceRequests, Services, Professionals,Users
from application.controller.sse import server_side_event
from application.utils.validation import check_loggedIn_jwt_expiration,check_loggedIn_status,csrf_protect,check_role_prof,generate_otp,is_otp_expired,generate_csrf_token,check_loggedIn_jwt_expiration_admin,use_decor_exp
from application.jobs import tasks
from datetime import datetime, timedelta, timezone, date




class HomePage(Resource):
    """GET request to / or /index"""

    def get(self):
        token = request.cookies.get('token')

        if token is None:
            # Create a default token payload
            # print("Here Token None.")
            token_payload = {
                'user_id': "",
                'username': "",
                'name': "",
                'role': "",
                'loggedIn': "0",
                'pic_url': "",
            }
            token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')

            # Redirect to "/" and set the token cookie
            response = make_response(redirect("/"))
            response.set_cookie("token", token)
            return response
        try:
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # print("Trying to decode.")
        except jwt.ExpiredSignatureError:
            # If token has expired (based on 'exp' claim)
            # print("Expired and changed...................")
            generate_csrf_token()
            # print("CSRF Token : ",session.get('csrf_token'))
            session.pop('google_token', None)
            response = make_response(redirect("/"))
            response.set_cookie('token', '',expires=0)  # Clear the token cookie
            return response

        # Render the homepage with values from the token
        # print("Here....................................Home")
        # print("Home",decoded_token)
        return make_response(
            render_template(
                'index.html',
                username=decoded_token.get('username'),
                loggedIn=decoded_token.get('loggedIn'),
                role=decoded_token.get('role'),
                admin=decoded_token.get('admin'),
                user_id=decoded_token.get("user_id"),
                csrf_token = session.get("csrf_token") if session.get("csrf_token") else ''
            ),
            200,
            {'Content-Type': 'text/html'}
        )
    

class AdminHomePage(Resource):
    """GET request to /admin"""

    def get(self):
        admin_token = request.cookies.get('admin_token')
        # print("1111111111111111111",admin_token)
        if admin_token is None:
            # Create a default token payload
            token_payload = {
                "admin_username" : "",
                "admin_loggedIn" : "0",
                "admin_name" : ""
            }
            admin_token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')

            # Redirect to "/" and set the token cookie
            response = make_response(redirect("/admin"))
            # print(admin_token)
            response.set_cookie("admin_token", admin_token)
            return response
        try:
            decoded_token = jwt.decode(admin_token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # print("Admin Decoded Token  :",decoded_token)
            # print(session.get("csrf_token"))
        except jwt.ExpiredSignatureError:
            # If token has expired (based on 'exp' claim)
            # print("Expired and changed...................")
            generate_csrf_token()
            # print("CSRF Token : ",session.get('csrf_token'))
            session.pop('google_token', None)
            response = make_response(redirect("/admin"))
            response.set_cookie('admin_token','',expires=0)  # Clear the token cookie
            return response

        # Render the homepage with values from the token
        return make_response(
            render_template(
                'admin.html',
                admin_name=decoded_token.get('admin_name'),
                admin_username=decoded_token.get('admin_username'),
                admin_loggedIn=decoded_token.get('admin_loggedIn'),
                csrf_token = session.get("csrf_token") if session.get("csrf_token") else ''
            ),
            200,
            {'Content-Type': 'text/html'}
        )



@app.route('/api/get_flash_messages')
def get_flash_messages():
    messages = get_flashed_messages(with_categories=True)
    if messages:
        return jsonify({"message": messages[0][1]})  # Send the latest message
    return jsonify({"message": None})



@app.route('/api/generate_otp', methods=['POST'])
def generate_otp_user():
    response = None
    data = request.get_json()
    print(data)
    if "mail_id" in data:
        # print("Hi")
        otp = generate_otp()  # Generate a 6-digit OTP
        # print(otp,"Hiii")
        otp_expiration = datetime.now() + timedelta(minutes=3)  # Set OTP expiration time to 3 minutes

        session[data["mail_id"]] = otp
        session['otp_expiration'] = otp_expiration.isoformat()
        email = data["mail_id"]
        subject = "Email validity verification"
        body = f"""
                            <p><b>Welcome to Household Services.</b></p>
                            <p>OTP : {otp}</p>
                            <p><b>Valid only for 3 minutes only.</b></p>
                            <p>Thank you and have a good day :)</p>
        """
        job = tasks.send_registration_email.delay(email, subject, body)
        response = make_response(jsonify({"message" : "OTP sent successfully.",
                                          "flag" : 1,
                                          "status" : "success"}),200)
    else:
        response = make_response(jsonify({"message" : "Bad Request.OTP could not be sent.",
                                          "flag" : 0,
                                          "status" : "failure"}),400)
    response.headers['Content-Type'] = 'application/json'
    return response



@app.route('/api/verify_otp', methods=['POST'])
def verify_otp():
    response = None
    data = request.get_json()
    if "mail_id" in data and "user_otp" in data:
        if is_otp_expired():
            response = make_response(jsonify({"message" : "OTP expired.Try again.",
                                             "flag" : 0,
                                             "status" : "failure"}),410)
            response.headers['Content-Type'] = 'application/json'
            return response
        if  data["mail_id"]in session and data["user_otp"] == session[data["mail_id"]]:
            response = make_response(jsonify({"message" : "OTP verified successfully.",
                                             "flag" : 1,
                                             "status" : "success"}),200)
        else:
            response = make_response(jsonify({"message" : "OTP mismatch.",
                                             "flag" : 0,
                                             "status" : "failure"}),200)
    else:
        response = make_response(jsonify({"message" : "Bad Request.",
                                             "flag" : 0,
                                             "status" : "failure"}),400)
    response.headers['Content-Type'] = 'application/json'
    return response




#Time being rendering to check the functionality of sse
# @app.route('/api/admin')
# def adminPage():
#     return render_template('admin.html')



# To retrieve service categories from the database
@app.route('/api/srvc_cats',methods=['GET'])
@check_loggedIn_jwt_expiration
@check_loggedIn_status
@csrf_protect
def srvc_cat():
    srvcs = Services.query.all()
    srvc_cat = []
    response = None
    if srvcs:
        for srvc in srvcs:
            srvc_cat.append(srvc.service_category)
        response = make_response(jsonify({
                            'message': 'Srevice Categories data retrieved.',
                            'flag' : 1,
                            'data' : srvc_cat,
                            'status': 'success'
                        }), 200)
    return response 
    

#Route to display customer service request details at professionals end
#On clicking the view button on the service request to be accepted by the professional, request  will be sent to below route
# @app.route('/api/cust_srvcreq/<string:srvcreq_id>',methods=['GET'])
# @check_loggedIn_status
# @check_role_prof
# @csrf_protect
# @check_loggedIn_jwt_expiration
# def cust_srvcreq(srvcreq_id=None):
#     srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
#     response = None
#     if srvcreq:
#         service = Services.query.filter_by(service_id = srvcreq.srvc_id).first()
#         srvc_cat = service.service_category if service else None
#         response = make_response(jsonify({
#                         'message': 'Srevice Request data retrieved.',
#                         'flag' : 1,
#                         'data' : {"srvcreq_id":srvcreq_id,"service_cat":srvc_cat,"service_name":srvcreq.srvc_professional.prof_service_name,"name":srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.first_name,"phone": srvcreq.srvc_usr.phone,"address":srvcreq.srvc_usr.address
#                                   ,"address_link":srvcreq.srvc_usr.address_link,"pincode":srvcreq.srvc_usr.pincode},
#                         'status': 'success'
#                     }), 200)
#     else:
#         response = make_response(jsonify({
#             'message' : 'Service Request data could not be retrieved!! Try again later.',
#             'flag' : 0,
#             'status': 'failure'
#         }),503)
#     response.headers['Content-Type'] = 'application/json'
#     return response



#Route for professional Approval of service  request
@app.route('/api/cust_srvcreq_approval/<string:srvcreq_id>/<string:approval>',methods=['GET'])
@check_loggedIn_jwt_expiration
@check_loggedIn_status
@check_role_prof
@csrf_protect
def cust_srvcreq_approval(srvcreq_id=None,approval=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    if srvcreq:
        service = Services.query.filter_by(service_id = srvcreq.srvc_id).first()
        srvc_cat = service.service_category if service else None
    response = None
    if srvcreq:
        data = {
        "srvcreq_id": srvcreq_id,
        "srvc_status": approval
        }
        url = 'http://localhost:5000/api/srvc_req'

        headers = {
            'Content-Type': 'application/json',
            'X-CSRF-Token': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            if resp.status_code == 200:
                #On navigating to the link below all the pending requests of customer will be shown
                server_side_event(msg = f"Your service request for `{srvcreq.srvc_professional.prof_service_name}` under category {srvc_cat} is {approval} by `{srvcreq.srvc_professional.usr.first_name}`. Please check your profile for changes/updates.",type=f"{srvcreq.customer_id}")
                email = srvcreq.srvc_usr.user_name
                subject = "Update regarding your service request status."
                if approval == "accepted":
                    body = f"""
                            <p><b>This is from Household Services.</b></p>
                            <p>Your service request is : {approval}</p>
                            <p>Service Category : {srvc_cat}</p>
                            <p>Service name : {srvcreq.srvc_professional.prof_service_name}</p>
                            <p>Professional name : {srvcreq.srvc_professional.usr.first_name} {srvcreq.srvc_professional.usr.last_name}</p>
                            <p>Professional phone number : {srvcreq.srvc_professional.usr.phone}</p>
                            <p>Professional will approach you within 48 hrs from {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                            <p><b>Thank you and have a good day :)</b></p>
                        """
                else:
                    body = f"""
                            <p><b>This is from Household Services.</b></p>
                            <p>We regret to inform you that your service request is {approval} by the professional.</p>
                            <p>Service Category : {srvc_cat}</p>
                            <p>Service name : {srvcreq.srvc_professional.prof_service_name}</p>
                            <p>Professional name : {srvcreq.srvc_professional.usr.first_name} {srvcreq.srvc_professional.usr.last_name}</p>
                            <p><b>Thank you and have a good day :)</b></p>
                        """
                job1 = tasks.send_registration_email.delay(email, subject, body)
                email1 = srvcreq.srvc_professional.usr.user_name
                subject1 = "Customer details for your accepted/rejected service request."
                if approval == "accepted":
                    body1 = f"""
                            <p><b>This is from Household Services.</b></p>
                            <p>Details of your accepted service request : </p>
                            <p>Service Category : {srvc_cat}</p>
                            <p>Service name : {srvcreq.srvc_professional.prof_service_name}</p>
                            <p>Customer name : {srvcreq.srvc_usr.first_name} {srvcreq.srvc_usr.last_name}</p>
                            <p>Customer phone number : {srvcreq.srvc_usr.phone}</p>
                            <p>Customer Address : {srvcreq.srvc_usr.address}</p>
                            <p>Customer address Gmaps link : {srvcreq.srvc_usr.address_link}</p>
                            <p>Plese stay in touch with the customer and complete the service within 48 hrs from {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                            <p><b>Thank you and have a good day :)</b></p>
                        """
                else:
                    body1 = f"""
                            <p><b>This is from Household Services.</b></p>
                            <p>Details of your rejected service request : </p>
                            <p>Service Category : {srvc_cat}</p>
                            <p>Service name : {srvcreq.srvc_professional.prof_service_name}</p>
                            <p>Customer name : {srvcreq.srvc_usr.first_name} {srvcreq.srvc_usr.last_name}</p>
                            <p><b>This service request was rejected by you.</b></p>
                            <p><b>Thank you and have a good day :)</b></p>
                        """
                job2 = tasks.send_registration_email.delay(email1,subject1,body1)
                response = make_response(jsonify({
                    'message' : 'Service Request accepted successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response


#Customer Service Request rating
@app.route('/api/rating/cust/<string:srvcreq_id>',methods = ['POST'])
@check_loggedIn_jwt_expiration
@check_loggedIn_status
@csrf_protect
def customerRating(srvcreq_id=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    response = None
    data = request.get_json()
    if srvcreq:
        data = {
        "cust_rating": data['cust_rating'],  
        "cust_review": data['cust_review'] if data['cust_review'] else "",
        "srvcreq_id": srvcreq_id
        }
        url = 'http://localhost:5000/api/srvc_req'  

        headers = {
            'Content-Type': 'application/json',
            'X-CSRF-Token': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            if resp.status_code == 200:
                server_side_event(msg = f"Thank you for rating the service done by professional : `{srvcreq.srvc_professional.usr.first_name}`.", type=f"{srvcreq.customer_id}")
                response = make_response(jsonify({
                    'message' : 'Service Rating successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response






#Professional Service Request rating
@app.route('/api/rating/prof/<string:srvcreq_id>',methods = ['POST'])
@check_loggedIn_jwt_expiration
@check_loggedIn_status
@check_role_prof
@csrf_protect
def professionalRating(srvcreq_id=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    response = None
    data = request.get_json()
    if srvcreq:
        data = {
        "prof_rating": data['prof_rating'],  
        "prof_review": data['prof_review'] if data['prof_review'] else "",
        "srvcreq_id": srvcreq_id
        }
        url = 'http://localhost:5000/api/srvc_req'  

        headers = {
            'Content-Type': 'application/json',
            'X-CSRF-Token': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            print(resp)
            if resp.status_code == 200:
                server_side_event(msg = f"Thank you for rating the customer : `{srvcreq.srvc_usr.first_name}`.", type=f"{srvcreq.prof_id}")
                response = make_response(jsonify({
                    'message' : 'Service Rating successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response



#Summary details in profile page(in admin also)
@app.route('/api/orderSummary/<string:user_id>',methods = ['GET'])
@use_decor_exp
@check_loggedIn_status
@csrf_protect
def customerOrderSummary(user_id=None):
    response = None
    if user_id:
        srvc_reqs_pend = len(ServiceRequests.query.filter((ServiceRequests.customer_id == user_id) & (ServiceRequests.srvc_status == 'pending')).all())
        srvc_reqs_cmpd = len(ServiceRequests.query.filter((ServiceRequests.customer_id == user_id) & (ServiceRequests.srvc_status == 'accepted')).all())
        srvc_reqs_rjtd = len(ServiceRequests.query.filter((ServiceRequests.customer_id == user_id) & (ServiceRequests.srvc_status == 'rejected')).all())
        data = {
                    "srvc_reqs_pend":srvc_reqs_pend,
                    "srvc_reqs_cmpd":srvc_reqs_cmpd,
                    "srvc_reqs_rjtd":srvc_reqs_rjtd
                }
        response = make_response(jsonify({
                        'message': 'Orders Summary data retrieved Successfully',
                        'flag' : 1,
                        'data' : data,
                        'status': 'success'
                    }), 200)
    else:
        response = make_response(jsonify({
                        'message': 'Orders Summary data cannot be retrieved.',
                        'flag' : 0,
                        'status': 'failure'
                    }), 400)
    response.headers['Content-Type'] = 'application/json'
    return response








#All admin routes below


#admin signin route
@app.route("/api/admin_signin",methods = ["POST"])
def adminSignin():
    data = request.get_json()
    admin_username = data['admin_email']
    admin_password = data['admin_password']
    if admin_username == app.config["ADMIN_EMAIL"] and admin_password == app.config["ADMIN_PASSWORD"]:
        print("Admin Password Check Successful.")
        generate_csrf_token()
        print("CSRF Token : ",session.get("csrf_token"))
        decoded_token = jwt.decode(request.cookies.get('admin_token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        decoded_token["admin_username"] = app.config["ADMIN_EMAIL"]
        decoded_token["admin_name"] =app.config["ADMIN_NAME"]
        decoded_token["admin_loggedIn"] = "1"
        decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
        new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
        # print("Cookie token after login : ",request.cookies.get('token'))
        response = make_response(jsonify({
            'message': 'Admin Signin successful',
            'flag' : 1,
            'data' : {"admin_username":app.config["ADMIN_EMAIL"],"admin_loggedIn":"1","admin_name":app.config["ADMIN_NAME"]},
            'csrf_token' : session.get("csrf_token"),
            'status': 'success'
        }), 200)
        response.set_cookie("admin_token",new_token)
    else:
        response = make_response(jsonify({
            'message': 'Admin Signin unsuccessful.Password or username Incorrect',
            'flag' : 0,
            'status': 'failure'
        }), 401)
    response.headers['Content-Type'] = 'application/json'
    return response



# admin signout route
@app.route("/api/admin_signout", methods = ["GET"])
@check_loggedIn_jwt_expiration_admin
@check_loggedIn_status
@csrf_protect
def adminSignout():
    """
    Handle GET request to /api/admin_signout
    """
    generate_csrf_token()
    session.pop('google_token', None)
    decoded_token = jwt.decode(request.cookies.get('admin_token'), app.config['SECRET_KEY'], algorithms=['HS256'])
    decoded_token["admin_loggedIn"] = "0"
    decoded_token["admin_username"] = ""
    decoded_token["admin_name"] = ""
    decoded_token.pop('exp')
    new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
    # response = make_response(redirect("/"))
    response = make_response(jsonify({'message': 'Admin Successfully Logged Out.','flag':1,'status': 'success'}),200)
    response.set_cookie("admin_token",new_token)
    response.headers['Content-Type'] = 'application/json'
    return response



# @app.route('/api/get_flash_messages_admin')
# def get_flash_messages():
#     messages = get_flashed_messages(with_categories=True)
#     if messages:
#         return jsonify({"message": messages[0][1]})  # Send the latest message
#     return jsonify({"message": None})


#Fetch count for admin page
@app.route('/api/fetch_count/<string:flag>',methods = ["GET"])
@check_loggedIn_jwt_expiration_admin
@check_loggedIn_status
@csrf_protect
def fetchCount(flag = None):
    response = None
    count = 0
    if flag:
        # for customer
        if flag == '0':
            count = len(Users.query.filter_by(role = 'cust').all())
        # for professional
        elif flag == '1':
            count = len(Users.query.filter_by(role = 'prof').all())
        # for service categories
        else:
            count = len(Services.query.all())
        response = make_response(jsonify({"message" : "Count fetched successfully.",
                                      "data" : count,
                                      "flag" : 1,
                                      "status" : "success"}),200)
    else:
        response = make_response(jsonify({"message" : "Bad Request",
                                      "flag" : 0,
                                      "status" : "failure"}),400)
    response.headers['Content-Type'] = 'application/json'
    return response





# Pending requests which are to be verified as professional by admin
@app.route('/api/pending_prof_approvals',methods = ["GET"])   #For admin only
@check_loggedIn_jwt_expiration_admin
@check_loggedIn_status
@csrf_protect
def pendingProfApprovals():
    professionals = Professionals.query.filter_by(prof_ver = 0).all()
    result = []
    for professional in professionals:
        dob = professional.usr.dob  # Example: datetime.date(1995, 5, 17)
        # Get the current date
        today = date.today()
        # Calculate age
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        # print(f"User's age: {age}")
        result.append({"prof_userid" : professional.prof_userid,
                        "prof_name" : professional.usr.first_name +" "+ professional.usr.last_name,
                        "prof_gender" : professional.usr.gender,
                        "prof_age" : age,
                        "prof_exp" : professional.prof_exp,
                        "prof_category" : professional.prof_service.service_category,
                        "prof_srvcname" : professional.prof_service_name,
                        "prof_dscp" : professional.prof_dscp,
                        "prof_phone" : professional.usr.phone,
                        "prof_address" : professional.usr.address,
                        "prof_address_link" : professional.usr.address_link,
                        "prof_address_pincode" : professional.usr.pincode,
                        "prof_ver" : professional.prof_ver
                    })
    response = make_response(jsonify({"message" : "Pending approvals retrieved successfully.",
                                      "data" : result,
                                      "flag" : 1,
                                      "status" : "success"}),200)
    response.headers['Content-Type'] = 'application/json'
    return response



# Pending request details which are to be verified as professional by admin
# @app.route('/api/pending_prof_approvals/details/<string:prof_id>',methods = ["GET"])   #For admin only
# @check_role_admin
# @csrf_protect
# @check_loggedIn_jwt_expiration_admin
# def pendingProfApprovalsDetails(prof_id = None):
#     if prof_id:
#         professional = Professionals.query.filter_by(prof_userid = prof_id).first()

#         result = {"prof_userid" : professional.prof_userid,
#                     "prof_name" : professional.usr.first_name +" "+ professional.usr.last_name,
#                     "prof_gender" : professional.usr.gender,
#                     "prof_age" : professional.usr.age,
#                     "prof_exp" : professional.prof_exp,
#                     "prof_category" : professional.prof_service.service_category,
#                     "prof_srvcname" : professional.prof_service_name,
#                     "prof_dscp" : professional.prof_dscp,
#                     "prof_phone" : professional.usr.phone,
#                     "prof_address" : professional.usr.address,
#                     "prof_address_link" : professional.usr.address_link,
#                     "prof_address_pincode" : professional.usr.pincode}
#         response = make_response(jsonify({"message" : "Pending approvals user details retrieved successfully.",
#                                         "data" : result,
#                                         "flag" : 1,
#                                         "status" : "success"}),200)
#     else:
#         response = make_response(jsonify({"message" : "Pending approvals user details could not be retrieved.",
#                                         "data" : result,
#                                         "flag" : 0,
#                                         "status" : "failure"}),400)
#     response.headers['Content-Type'] = 'application/json'
#     return response



@app.route('/api/professional_emails',methods = ["GET"])
def getEmails():
    professionals = Professionals.query.all()
    emails = []
    for professional in professionals:
        emails.append([professional.prof_userid,professional.usr.user_name])
    response = make_response(jsonify({"message" : "Professional's emails retrieved successfully.",
                                      "flag" : 1,
                                      "data" : emails,
                                      "status" : "success"}),200)
    response.headers['Content-Type'] = 'application/json'
    return response
    
    


@app.route('/api/report_details/<string:prof_id>',methods =["GET"])
def reportDetails(prof_id = None):
    response = None
    if prof_id:
        professional = Professionals.query.firter_by(prof_userid = prof_id).first()
        details = dict()
        if professional:
            count_a = 0
            count_r = 0
            count = 0
            for srvc_req in professional.srvc_reqs:
                if srvc_req.srvc_status == "accepted":
                    count_a += 1
                if srvc_req.srvc_status == "rejected":
                    count_r += 1
                if srvc_req.cust_rating != None:
                    sum_rating += srvc_req.cust_rating
                    count += 1
            details = {"service_cat" : professional.prof_service.service_category,
                       "service_name" : professional.prof_service_name,
                       "srvcreqs_rcvd" : len(professional.srvc_reqs),
                       "srvcreqs_acpt" : count_a,
                       "srvcreqs_rjtd" : count_r,
                       "avg_rating" : sum_rating/count}
            response = make_response(jsonify({"message" : "Professional Monthly report details fetched successfully.",
                                              "flag" : 1,
                                              "data" : details,
                                              "status" : "success",}),200) 
        else:
            response = make_response(jsonify({"message" : "Professional with the given id not found!!",
                                              "flag" : 1,
                                              "data" : details,
                                              "status" : "success",}),200)
    else:
        response = make_response(jsonify({"message" : "Professional id missing!!",
                                              "flag" : 0,
                                              "status" : "failure",}),400)
    response.headers['Content-Type'] = 'application/json'
    return response









