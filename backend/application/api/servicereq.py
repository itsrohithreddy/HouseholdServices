from flask import current_app as app
from datetime import datetime, timedelta
from flask_restful import Resource
from flask import request, make_response, jsonify
from application.utils.validation import check_loggedIn_jwt_expiration,csrf_protect,check_loggedIn_status,use_decor_exp,decodeutf8,gen_uuid
from application.data.database import db
from application.data.models import ServiceRequests, Services, Professionals
from application.controller.sse import server_side_event
import jwt

class ServiceRequestAPI(Resource):
    """
    API resource for managing service requests.
    /api/srvc_req
    """
    """
    Handle GET request to /api/srvc_req
    """
    @use_decor_exp
    @csrf_protect
    def get(self,id=None,flag=None):
        """
        Retrieves service requests based on user role and provided filters.

        Returns:
            A JSON response containing a list of service requests or an error message.
        """
        role=""
        admin =""
        if request.cookies.get('admin_token'):
            decoded_token = jwt.decode(request.cookies.get('admin_token'), app.config['SECRET_KEY'], algorithms=['HS256'])
            admin = decoded_token['admin_loggedIn']
        else:
            decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
            role = decoded_token['role']
        query = ServiceRequests.query
        if flag == "0":
            # If flag is 0 then fetch accepted and rejected requests
            response = None
            srvcreqs = query.filter((ServiceRequests.customer_id == id) & ((ServiceRequests.srvc_status == "accepted") | (ServiceRequests.srvc_status == "rejected"))).all()
            details = []
            details_prof = []
            for srvcreq in srvcreqs:
                srvcreq_data = {
                    'srvcreq_id': srvcreq.srvcreq_id, 
                    'srvc_id': srvcreq.srvc_id,
                    'srvc_img': "data:image/png;base64,"+decodeutf8(srvcreq.srvc_professional.prof_service.service_image),
                    'srvc_cat': srvcreq.srvc_professional.prof_service.service_category,
                    'srvc_name': srvcreq.srvc_professional.prof_service_name,
                    'customer_id': srvcreq.customer_id,
                    'customer_name':  srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.last_name,
                    'prof_id': srvcreq.prof_id,
                    'prof_name': srvcreq.srvc_professional.usr.first_name + " " + srvcreq.srvc_professional.usr.last_name,
                    'date_srvcreq': srvcreq.date_srvcreq.strftime('%Y-%m-%d %H:%M:%S'), 
                    'date_cmpltreq': srvcreq.date_cmpltreq.strftime("%Y-%m-%d %H:%M:%S"),
                    'srvc_status': srvcreq.srvc_status, 
                    'remarks': srvcreq.remarks, 
                    'cust_rating': srvcreq.cust_rating, 
                    # 'prof_rating': srvcreq.prof_rating, 
                    'cust_review': srvcreq.cust_review, 
                    # 'prof_review': srvcreq.prof_review
                }
                details.append(srvcreq_data)
            # print("Accepted/Rejected Customer Srvc Reqs Details : ",details)
            # response = make_response(jsonify({
            #                 'message': 'Customer services fetched Successfully.',
            #                 'data': details,
            #                 'flag':1,
            #                 'status': 'success'
            #             }), 200)

            if role == "prof" or admin == '1':
                srvcreqs_prof = query.filter((ServiceRequests.prof_id == id) & ((ServiceRequests.srvc_status == "accepted") | (ServiceRequests.srvc_status == "rejected"))).all()
                # srvcreqs_cust = query.filter(ServiceRequests.customer_id == id).order_by(ServiceRequests.date_srvcreq.desc()).all()
                
                for srvcreq in srvcreqs_prof:
                    srvcreq_data = {
                        'srvcreq_id': srvcreq.srvcreq_id, 
                        'srvc_id': srvcreq.srvc_id,
                        'srvc_img': "data:image/png;base64,"+decodeutf8(srvcreq.srvc_professional.prof_service.service_image),
                        'srvc_cat': srvcreq.srvc_professional.prof_service.service_category,
                        'srvc_name': srvcreq.srvc_professional.prof_service_name,
                        'customer_id': srvcreq.customer_id,
                        'customer_name':  srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.last_name,
                        'prof_id': srvcreq.prof_id,
                        'prof_name': srvcreq.srvc_professional.usr.first_name + " " + srvcreq.srvc_professional.usr.last_name,
                        'date_srvcreq': srvcreq.date_srvcreq.strftime('%Y-%m-%d %H:%M:%S'), 
                        'date_cmpltreq': srvcreq.date_cmpltreq.strftime('%Y-%m-%d %H:%M:%S'),
                        'srvc_status': srvcreq.srvc_status, 
                        'remarks': srvcreq.remarks, 
                        # 'cust_rating': srvcreq.cust_rating, 
                        'prof_rating': srvcreq.prof_rating, # -1 by default
                        # 'cust_review': srvcreq.cust_review, 
                        'prof_review': srvcreq.prof_review
                    }
                    details_prof.append(srvcreq_data)

                # print("Accepted/Rejected Professional Srvc Reqs Details : ",details_prof)   
            response = make_response(jsonify({
                            'message': 'Professional services fetched Successfully.',
                            'data_prof': details_prof,
                            'data_cust':details,
                            'flag':1,
                            'status': 'success'
                        }), 200)
            # else:
            #     response = make_response(jsonify({"message": "Unauthorized Access.","flag":0,"status":"failure"}),401)
            response.headers['Content-Type'] = 'application/json'
            return response
        else:
            # If flag is 1 fetch pending requests
            response = None
            srvcreqs = query.filter((ServiceRequests.customer_id == id) & (ServiceRequests.srvc_status == "pending")).all()
            details = []
            details_prof = []
            for srvcreq in srvcreqs:
                srvcreq_data = {
                    'srvcreq_id': srvcreq.srvcreq_id, 
                    'srvc_id': srvcreq.srvc_id,
                    'srvc_img': "data:image/png;base64,"+decodeutf8(srvcreq.srvc_professional.prof_service.service_image),
                    'srvc_cat': srvcreq.srvc_professional.prof_service.service_category,
                    'srvc_name': srvcreq.srvc_professional.prof_service_name,
                    'customer_id': srvcreq.customer_id,
                    'customer_name':  srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.last_name,
                    'prof_id': srvcreq.prof_id,
                    'prof_name': srvcreq.srvc_professional.usr.first_name + " " + srvcreq.srvc_professional.usr.last_name,
                    'srvc_status': srvcreq.srvc_status, 
                    'remarks': srvcreq.remarks,
                    # 'date_srvcreq': srvcreq.date_srvcreq.strftime('%Y-%m-%d %H:%M:%S'),
                }
                details.append(srvcreq_data)
            # print("Pending - Customer Srvc Reqs Details : ",details)
            # response = make_response(jsonify({
            #                 'message': 'Customer pending services fetched Successfully.',
            #                 'data': details,
            #                 'flag':1,
            #                 'status': 'success'
            #             }), 200)
            if role == "prof" or admin == '1':
                srvcreqs_prof = query.filter((ServiceRequests.prof_id == id) & (ServiceRequests.srvc_status == 'pending')).all()
                # srvcreqs_cust = query.filter((ServiceRequests.customer_id == id) & (ServiceRequests.srvc_status == 'pending')).all()
                for srvcreq in srvcreqs_prof:
                    srvcreq_data = {
                        'srvcreq_id': srvcreq.srvcreq_id, 
                        'srvc_id': srvcreq.srvc_id,
                        'srvc_cat': srvcreq.srvc_professional.prof_service.service_category,
                        'srvc_img': "data:image/png;base64,"+decodeutf8(srvcreq.srvc_professional.prof_service.service_image),
                        'srvc_name': srvcreq.srvc_professional.prof_service_name,
                        'customer_id': srvcreq.customer_id,
                        'customer_name':  srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.last_name,
                        'prof_id': srvcreq.prof_id,
                        'prof_name': srvcreq.srvc_professional.usr.first_name + " " + srvcreq.srvc_professional.usr.last_name,
                        'srvc_status': srvcreq.srvc_status, 
                        'remarks': srvcreq.remarks,
                        # 'date_srvcreq': srvcreq.date_srvcreq.strftime('%Y-%m-%d %H:%M:%S'),
                        "phone": srvcreq.srvc_usr.phone,
                        "address":srvcreq.srvc_usr.address,
                        "address_link":srvcreq.srvc_usr.address_link,
                        "pincode":srvcreq.srvc_usr.pincode,
                    }
                    details_prof.append(srvcreq_data)

            response = make_response(jsonify({
                            'message': 'Professional pending services fetched Successfully.',
                            'data_prof': details_prof,
                            'data_cust':details,
                            'flag':1,
                            'status': 'success'
                        }), 200)
            # else:
            #     response = make_response(jsonify({"message": "Unauthorized Access.","flag":0,"status":"failure"}),401)
            response.headers['Content-Type'] = 'application/json'
            return response

    


    """
    Handle POST request to /api/srvc_req
    """
    @check_loggedIn_jwt_expiration
    @check_loggedIn_status
    @csrf_protect
    def post(self):
        """
        Creates a new service request.

        Expects JSON data with the following fields:
            - srvc_id: ID of the service being requested.
            - prof_id: ID of the professional chosen for the service.
            - customer_id: ID of the customer requesting for service. 

        Returns:
            A JSON response with a success message and the created service request ID,
            or an error message if unauthorized or data is missing.
        """
        data = request.get_json()
        required_fields = ["srvc_id", "prof_id", "customer_id"]
        response = None
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            response = make_response(jsonify({
                            'message': f'Missing required feilds : {missing_fields}. Order could not be placed',
                            'flag':0,
                            'status': 'failure'
                        }), 400)
            response.headers['Content-Type'] = 'application/json'
            return response

        srvcreq = ServiceRequests(
            srvcreq_id = gen_uuid(),
            srvc_id=data["srvc_id"],
            customer_id=data["customer_id"],
            prof_id=data["prof_id"],
            srvc_status="pending",
            # remarks=data["remarks"] if data['remarks'] is not None else None
        )
        try:
            db.session.add(srvcreq)
            db.session.commit()
            prof = Professionals.query.filter_by(prof_userid = data['prof_id']).first()
            srvc_name = prof.prof_service_name if prof else ""
            customer_srvc_req = ServiceRequests.query.filter_by(customer_id = data["customer_id"]).first()
            fullname = customer_srvc_req.srvc_usr.first_name if customer_srvc_req else "" + " " + customer_srvc_req.srvc_usr.last_name if customer_srvc_req else ""
            ##########################################################################
            #On navigating to the link below all the requests to be accepted by professional will be shown
            server_side_event(msg = f"Service : `{srvc_name}`  request recieved from Customer : `{fullname}`. Please check pending approvals for furthur details." , type = f"{data["prof_id"]}")
            response = make_response(jsonify({
                            'message': 'Order placed successfully. Waiting for professional to accept it.',
                            'data': "pending",
                            'flag':1,
                            'status': 'success'
                        }), 200)
        except Exception as e:
            print("Rolling back. Issue with database Insertion",e)
            db.session.rollback()
            response = make_response(jsonify({"message":"Order could not be placed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response


    """
    Handle PUT request to /api/srvc_req
    """
    @check_loggedIn_jwt_expiration
    @check_loggedIn_status
    @csrf_protect
    def put(self):
        """
        Updates an existing service request.

        Expects JSON data with the following fields:
            - srvcreq_id: ID of the service request to update.
            - (Optional) cust_rating: Customer rating for the service.
            - (Optional) cust_review: Customer review for the service.
            - (Optional) prof_rating: Professional rating for the customer.
            - (Optional) prof_review: Professional review for the customer.
            - (Optional) srvc_status: Status of the service request.

        Returns:
            A JSON response with a success message or an error message if unauthorized or data is missing.
        """
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        role = decoded_token['role']
        # admin = decoded_token['admin']
        data = request.get_json()
        response = None
        # if role == "cust":
        if 'cust_rating' in data and 'cust_review' in data:
            srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"]).first()
            srvcreq.cust_rating = data['cust_rating']
            srvcreq.cust_review = data['cust_review']
            try:
                db.session.commit()
                ###########################################################################
                response = make_response(jsonify({"message":"Thank you for submitting your opinion. Successful","flag":1,"status":"success"}),200)
            except Exception as e:
                print("Rolling back. Issue with database Insertion",e)
                db.session.rollback()
                response = make_response(jsonify({"message":"Your opinion could not be saved. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        elif role == "prof":
            if 'srvc_status' in data:
                srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"]).first()
                srvcreq.date_srvcreq = datetime.strptime(datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"%Y-%m-%d %H:%M:%S")
                if data["srvc_status"] == "accepted":
                    srvcreq.date_cmpltreq = datetime.strptime((datetime.now() + timedelta(hours=48)).strftime("%Y-%m-%d %H:%M:%S"),"%Y-%m-%d %H:%M:%S")
                else:
                    srvcreq.date_cmpltreq = datetime.strptime(datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"%Y-%m-%d %H:%M:%S")
                srvcreq.srvc_status=data['srvc_status']
                try:
                    db.session.commit()
                    response = make_response(jsonify({"message":"Status updated.","flag":1,"status":"success"}),200)
                except Exception as e:
                    print("Rolling back. Issue with database Insertion",e)
                    db.session.rollback()
                    response = make_response(jsonify({"message":"Database error. Please try again.",'flag':0,"status":"failure"}),503)
            elif 'prof_rating' in data and 'prof_review' in data:
                print("Here.......")
                srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"]).first()
                srvcreq.prof_rating = data['prof_rating']
                srvcreq.prof_review = data['prof_review']
                try:
                    db.session.commit()
                    response = make_response(jsonify({"message":"Thank you for submitting your opinion. Successful","flag":1,"status":"success"}),200)
                except Exception as e:
                    print("Rolling back. Issue with database Insertion",e)
                    db.session.rollback()
                    response = make_response(jsonify({"message":"Your opinion could not be saved. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response    