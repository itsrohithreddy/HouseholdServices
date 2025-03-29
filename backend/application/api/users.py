from flask_restful import Resource
from application.data.database import db
from application.data.models import Users, Professionals , Services
from flask import request,make_response,jsonify
from application.utils.validation import csrf_protect,use_decor_exp,decodeutf8,check_loggedIn_status
import jwt
from flask import current_app as app
from datetime import datetime
from application.cache_config import cache





class UserAPI(Resource):
    @use_decor_exp
    @check_loggedIn_status
    @csrf_protect
    def get(self):
        """
        Returns users based(user_id) on the data in the request. 
        If no data(user_id) is provided, returns all users.(By admin only)
        """
        # http://localhost:5000/api/users?user_id=dfghjkl;
        query = Users.query
        data = request.args.to_dict() or None
        users = []
        response = None
        if data:
            users = query.filter(Users.user_id == data["user_id"]).all()
        else:
            users = query.all()
        if users:
            details = []
            for user in users:
                details.append({
                                'user_id' : user.user_id,
                                'user_username': user.user_name,
                                'user_fullname': user.first_name + user.last_name,
                                'user_firstname': user.first_name,
                                'user_lastname': user.last_name,
                                'user_image_url': user.user_image_url,
                                'user_dob': user.dob.strftime('%Y-%m-%d'), 
                                'user_gender': user.gender, 
                                'user_phone': user.phone, 
                                'user_role': user.role,
                                'user_address':user.address,
                                'user_address_link': user.address_link,
                                'user_pincode':user.pincode,
                                })

            response = make_response(jsonify({
                "message": "User details fetched successfully.",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        else:
            response = make_response(jsonify({
                "message": "No Users found",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        response.headers['Content-Type'] = 'application/json'
        return response

 
class ServicesListAPI(Resource):
    @cache.cached(timeout=120)
    def get(self):
        servicesList = dict()
        services = Services.query.all()
        for service in services:
            professionals = service.professionals_opted
            details = []
            for professional in professionals:
                if professional.prof_ver == 1:
                    sum_rating = 0
                    count = 0
                    for srvc_req in professional.srvc_reqs:
                        if srvc_req.cust_rating != -1:
                            sum_rating += srvc_req.cust_rating
                            count += 1
                    details.append({"service_name" : professional.prof_service_name,
                                    "service_id" : service.service_id,
                                    "service_image" : "data:image/png;base64,"+decodeutf8(service.service_image),
                                    "service_base_price" : service.service_base_price,
                                    "prof_userid" : professional.prof_userid,
                                    "prof_name" : professional.usr.first_name + professional.usr.last_name,
                                    "prof_gender" : professional.usr.gender,
                                    "prof_dob" : professional.usr.dob,
                                    "prof_exp" : professional.prof_exp,
                                    "prof_join_date" : professional.prof_join_date,
                                    "service_reqs_completed" : len(professional.srvc_reqs),
                                    "avg_rating" : sum_rating/count if count != 0 else 0,
                                    })
            servicesList[service.service_category] = details
        # print(servicesList)
        response = make_response(jsonify({"message" : "All services by professional fetched successfully.",
                                         "data" : servicesList,
                                         "flag" : 1,
                                         "status" : "success"}),200)
        response.headers['Content-Type'] = 'application/json'
        return response

