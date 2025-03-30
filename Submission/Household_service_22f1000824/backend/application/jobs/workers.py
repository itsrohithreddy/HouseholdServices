from celery import Celery
from flask import current_app as app

clry = Celery('Application Jobs')


class ContextTask(clry.Task):
    def __call__(self,*args,**kwargs):
        with app.app_context():
            return self.run(*args,**kwargs)