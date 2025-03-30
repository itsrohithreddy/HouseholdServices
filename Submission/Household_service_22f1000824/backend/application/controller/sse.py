from flask_sse import sse
from flask import current_app as app
from datetime import datetime


app.register_blueprint(sse, url_prefix='/events')

def server_side_event(msg=None,type=None):
    with app.app_context():
        sse.publish({"message":msg}, type=type)
        print("Time: ",datetime.now())


