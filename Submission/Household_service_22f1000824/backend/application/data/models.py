import uuid
from datetime import datetime
from application.data.database import db

class Services(db.Model): #One (One : Service , Many : Professionals)  
    __tablename__ = "services"
    service_id = db.Column(db.String, primary_key=True)
    service_category = db.Column(db.String,nullable=False,unique=True)
    # service_name = db.Column(db.String(50), nullable=False)
    time_req = db.Column(db.Integer,server_default = db.text('0'),nullable=False)
    service_image=db.Column(db.BLOB) #profile Image
    service_dscp = db.Column(db.String) #Description
    service_base_price = db.Column(db.Float,nullable=False)
    professionals_opted = db.relationship('Professionals',backref='prof_service',lazy=True)



class Professionals(db.Model):  #Many   #One (One : Professionals , One : Users)  #One (One : Professionals , Many : ServiceRequests)
    __tablename__ = "professionals"
    prof_userid = db.Column(db.String,db.ForeignKey('users.user_id'),primary_key=True) #To retrieve details of the professional form the users table 
    prof_exp = db.Column(db.Integer,nullable=False,server_default=db.text('0'))  #Experience
    prof_dscp=db.Column(db.String)
    prof_srvcid = db.Column(db.String, db.ForeignKey('services.service_id'),nullable=False)
    prof_service_name = db.Column(db.String(50), nullable=False)
    prof_ver = db.Column(db.Integer,server_default =  db.text('0')) #Verification
    prof_join_date = db.Column(db.Date)  #Default YYYY-MM-DD
    srvc_reqs = db.relationship('ServiceRequests',backref="srvc_professional",lazy=True)
    usr = db.relationship('Users', uselist=False ,backref="usr_professional",lazy=True)


class Users(db.Model):  #One    #One (One : Users , Many: ServiceRequests)
    __tablename__ = "users"
    user_id = db.Column(db.String,primary_key = True)
    user_name = db.Column(db.String(50),nullable=False,unique=True) #Email
    first_name= db.Column(db.String(50),nullable=False)
    last_name = db.Column(db.String(50))
    dob = db.Column(db.Date) #Default YYYY-MM-DD
    gender = db.Column(db.String)
    role = db.Column(db.String(50),nullable=False)
    user_image_url = db.Column(db.String)
    password = db.Column(db.String)
    phone = db.Column(db.String(10), nullable=False, unique=True)
    address = db.Column(db.String,nullable=False)
    address_link = db.Column(db.String,nullable=False) #For Distance Matrix API from GMaps to measure distance for price calculation
    pincode = db.Column(db.Integer,nullable=False)
    offers_mail = db.Column(db.Integer,nullable=False,server_default=db.text('0'))
    srvc_ords = db.relationship('ServiceRequests',backref="srvc_usr",lazy=True)


class ServiceRequests(db.Model):  #Many
    __tablename__ = "serviceRequests"
    srvcreq_id = db.Column(db.String,primary_key = True)
    srvc_id = db.Column(db.String, db.ForeignKey('services.service_id'),nullable=False)
    customer_id = db.Column(db.String, db.ForeignKey('users.user_id'),nullable=False)
    prof_id = db.Column(db.String, db.ForeignKey('professionals.prof_userid'),nullable=False)
    date_srvcreq = db.Column(db.DateTime)   #Default YYYY-MM-DD HH:MM:SS
    date_cmpltreq = db.Column(db.DateTime)   #Default YYYY-MM-DD HH:MM:SS
    srvc_status = db.Column(db.String,nullable=False)  #"pending" or "accepted" or "rejected" 
    remarks = db.Column(db.String) #Given by customer in Service request(Like visit timings)
    cust_rating = db.Column(db.Float,nullable=False,server_default = db.text('-1'))   #Rating given by customer to Prof
    prof_rating = db.Column(db.Float,nullable=False,server_default = db.text('-1'))   #Rating given by Prof to customer
    cust_review = db.Column(db.String)  #Review given by customer to Prof
    prof_review = db.Column(db.String)  #Review given by customer to Prof
    