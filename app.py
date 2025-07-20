import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///quiz_master.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", "jwt-secret-key")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Initialize extensions
db.init_app(app)
CORS(app)
jwt = JWTManager(app)

# Import routes and models
from routes import *
from auth import *

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    
    # Create default admin user if not exists
    from models import User
    admin = User.query.filter_by(email='admin@quizmaster.com').first()
    if not admin:
        from werkzeug.security import generate_password_hash
        admin_user = User(
            username='admin',
            email='admin@quizmaster.com',
            password_hash=generate_password_hash('admin123'),
            full_name='Quiz Master Admin',
            qualification='Administrator',
            dob='1990-01-01',
            role='admin'
        )
        db.session.add(admin_user)
        db.session.commit()
        logging.info("Default admin user created: admin@quizmaster.com / admin123")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
