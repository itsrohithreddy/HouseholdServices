from flask_restful import Resource
from flask import request,make_response,jsonify, flash
from application.data.database import db
from application.data.models import Services
from application.utils.validation import gen_uuid,csrf_protect,decodeutf8,base64encode,check_loggedIn_jwt_expiration_admin,check_loggedIn_status
from application.cache_config import cache

class ServiceAPI(Resource):
    """
    API resource for managing services by Admin Only.
    """
    @check_loggedIn_jwt_expiration_admin
    @check_loggedIn_status
    @csrf_protect
    @cache.cached(timeout=120)
    def get(self):
        # /api/services
        """
        Returns a service based on the data(service_id) in the request.
        If no data(service_id) is provided, returns all services.
        """
        query = Services.query
        data = request.args.to_dict() or None
        services = []
        if data:
            services = query.filter_by(service_id = data['service_id']).all()
        else:
            services = query.all()
        result = []
        for service in services:
            # Create response content
            srvc_names = []
            for professional in service.professionals_opted:
                srvc_names.append(professional.prof_service_name)
            result.append({
                'service_id': service.service_id,
                'service_category': service.service_category,
                'time_req': service.time_req,
                'service_base_price': service.service_base_price,
                'service_image': "data:image/png;base64,"+decodeutf8(service.service_image),
                'service_dscp': service.service_dscp,
                'prof_count' : len(service.professionals_opted),
                'srvc_count': len(set(srvc_names)),
                'srvc_names': list(set(srvc_names))
            })
        response = make_response(jsonify({"message":"Services retrieval successful.","data": result,"status":"success","flag":1}),200)
        response.headers['Content-Type'] = 'application/json'
        return response
    

    @check_loggedIn_jwt_expiration_admin
    @check_loggedIn_status
    @csrf_protect
    def put(self):
        """
        Updates an existing service category.(By admin only)
        """
        query = Services.query
        data = request.get_json()
        response = None
        service_cat = query.filter(Services.service_id == data["service_id"]).first()
        if not service_cat:
            response = make_response(jsonify({"message":f"'{data['service_category']}' service category not found.","flag" : 0,"status":"failure"}),404)
            response.headers['Content-Type'] = 'application/json'
            return response

        for column in ["service_category", "time_req", "service_base_price", "service_dscp"]:
            if column in data:    
                setattr(service_cat, column, data[column])
        try:
            db.session.commit()
            flash("Service Category updated successfully.","success")
            response = make_response(jsonify({"message":"Service updated successfully","flag":1,"status":"success"}),200)
        except Exception as e:
            print("Rolling back. Issue with database Insertion",e)
            db.session.rollback()
            flash("Service Category could not be updated. Please try again.","error")
            response = make_response(jsonify({"message":"Service Updation failed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response




    @check_loggedIn_jwt_expiration_admin
    @check_loggedIn_status
    @csrf_protect
    def post(self):
        """
        Creates a new service.(By admin only)
        """
        query = Services.query
        data = request.form
        print(data)
        response = None
        required_fields = ["time_req", "srvc_cat", "srvc_dscp","base_price"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return make_response(jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400)
        if not 'srvc_catImage' in request.files:
            return make_response(jsonify({"message": "Missing required field: service_image","status":"failure"}), 400)
        check_serviceCategory=query.filter(Services.service_category==data['srvc_cat']).first()
        service_image=request.files['srvc_catImage']
        if check_serviceCategory is None:
            service_image_io = base64encode(service_image)
            service = Services(
                service_id=gen_uuid(),
                service_category=data['srvc_cat'].capitalize(),
                time_req=data['time_req'],
                service_image=service_image_io,
                service_base_price=data['base_price'],
                service_dscp=data['srvc_dscp']
            )
            try:
                db.session.add(service)
                db.session.commit()
                response  = make_response(jsonify({"message":"Service registration successful.",'flag':1,"status":"success"}),200)
            except Exception as e:
                print("Rolling back. Issue with database Insertion",e)
                db.session.rollback()
                response = make_response(jsonify({"message":"Service registration failed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        else:
            response  = make_response(jsonify({"message":"Service registration failed. Service with same category alredy exists.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response