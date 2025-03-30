from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from application.data.database import db
from application.jobs import workers
from application.config import localConfig
from flask_mail import Mail
from flask_bcrypt import Bcrypt
import os
from application.cache_config import cache
# from apscheduler.schedulers.background import BackgroundScheduler




app = None
api = None
clry = None
mail = None
bcrypt = None




def create_app():
    flask_app = Flask(__name__,template_folder=os.path.join('..', 'frontend', 'templates'),static_folder=os.path.join('..', 'frontend', 'static'))
    flask_app.config.from_object(localConfig)
    # print("Secret Key : ",flask_app.config.get('SECRET_KEY'))
    flask_app.secret_key = flask_app.config.get('SECRET_KEY')
    bcrypt = Bcrypt(flask_app)


    # Initialize the database
    db.init_app(flask_app)


    # Initialize Flask-Mail
    mail = Mail(flask_app)


    flask_api = Api(flask_app)
    flask_app.app_context().push()


    # Create Celery
    clry = workers.clry
    # print("BROKER URL : ",flask_app.config['CELERY_BROKER_URL'])
    # print("BACKEND URL : ",flask_app.config['CELERY_RESULT_BACKEND'])
    clry.conf.update(
        broker_url = flask_app.config['CELERY_BROKER_URL'],
        result_backend = flask_app.config['CELERY_RESULT_BACKEND']
    )
    clry.Task = workers.ContextTask
    clry.conf.broker_connection_retry_on_startup = True

    cache.init_app(flask_app)

    # CORS(flask_app, resources={r"/*" : {"origins" : "http://localhost:5000", "allow_headers" : "*"}})
    return flask_app, flask_api ,mail ,clry ,bcrypt


app, api, mail, clry ,bcrypt = create_app()

from application.controller.controllers import *

from application.api.users import UserAPI, ServicesListAPI
from application.api.services import ServiceAPI
from application.api.signout import SignOutAPI
from application.api.signup import SignUpAPI
from application.controller.controllers import HomePage
from application.api.servicereq import ServiceRequestAPI
from application.api.signin import SignInAPI,GoogleOAuthAPI,GoogleOAuthCallbackAPI,SignUpDetailsOAuthAPI
from application.api.professional import ProfessionalAPI
from application.controller.controllers import AdminHomePage

api.add_resource(UserAPI,"/api/users")
api.add_resource(ServiceAPI,"/api/services")
api.add_resource(SignInAPI,"/api/signin")  #
api.add_resource(GoogleOAuthAPI,"/api/signin_google")#
api.add_resource(GoogleOAuthCallbackAPI,"/api/signin_google/callback") #
api.add_resource(SignUpDetailsOAuthAPI,"/api/signup_details/oauth/<string:username>/<string:name>/<string:encoded_url>","/api/signup_details/oauth")#
api.add_resource(SignOutAPI,"/api/signout")    
api.add_resource(SignUpAPI,"/api/signup")#
api.add_resource(HomePage, '/', '/index') #
api.add_resource(ServiceRequestAPI,'/api/srvc_req/<string:id>/<string:flag>','/api/srvc_req')
api.add_resource(ProfessionalAPI,"/api/professional")
api.add_resource(ServicesListAPI,"/api/user/serviceslist")
api.add_resource(AdminHomePage,"/admin")
# API.add_resource(IsAdimn,"/api/isadmin") 
# API.add_resource(IsPro,"/api/ispro") 


if __name__ == '__main__':
    app.run(host=app.config.get('HOST', 'localhost'),
            port=app.config.get('PORT', 5000),
            debug=app.config.get('DEBUG', True))
