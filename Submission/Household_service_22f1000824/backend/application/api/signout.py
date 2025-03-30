from flask_restful import Resource
from flask import current_app as app
from flask import request,make_response,jsonify,session
from application.utils.validation import csrf_protect,check_loggedIn_jwt_expiration,generate_csrf_token,check_loggedIn_status
import jwt

class SignOutAPI(Resource):
    @check_loggedIn_jwt_expiration
    @check_loggedIn_status
    @csrf_protect
    def get(self):
        """
        Handle GET request to /api/signout
        """
        generate_csrf_token()
        session.pop('google_token', None)
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        decoded_token["loggedIn"] = "0"
        decoded_token["username"] = ""
        decoded_token["name"] = ""
        decoded_token["pic_url"] = ""
        decoded_token['role']= ""
        decoded_token['admin']= "0"
        decoded_token['admin_u'] = ""
        decoded_token.pop('exp')
        new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
        # response = make_response(redirect("/"))
        response = make_response(jsonify({'message': 'Successfully Logged Out.','flag':1,'status': 'success'}),200)
        response.set_cookie("token",new_token)
        response.headers['Content-Type'] = 'application/json'
        return response

