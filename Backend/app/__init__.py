from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'main.login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    app.config['SESSION_COOKIE_SECURE'] = True  # Use HTTPS for cookies
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Restrict access to cookies from JavaScript
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    
    CORS(app, supports_credentials=True)
    
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            response = jsonify({'message': 'Preflight request'})
            response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin'))
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    
    from .spotify_auth import spotify_auth_bp
    app.register_blueprint(spotify_auth_bp)

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
