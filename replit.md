# Quiz Master V2

## Overview

Quiz Master V2 is a multi-user quiz preparation platform built with Flask and Vue.js. The application serves as an exam preparation site for multiple courses, featuring two distinct user roles: administrators (quiz masters) who manage content, and regular users who take quizzes. The system provides a comprehensive quiz management system with subjects, chapters, and questions organized hierarchically.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Vue.js 3 with CDN delivery (no CLI build process)
- **Styling**: Bootstrap 5 with dark theme for consistent UI components
- **Icons**: Bootstrap Icons for visual elements
- **Template Engine**: Jinja2 serves only the entry point (index.html)
- **State Management**: Local browser storage for authentication tokens and user data
- **HTTP Client**: Axios with interceptors for API communication and authentication

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens) with Flask-JWT-Extended
- **CORS**: Flask-CORS for cross-origin requests
- **Database**: SQLite with SQLAlchemy declarative models
- **Security**: Password hashing with Werkzeug security utilities
- **Middleware**: ProxyFix for deployment behind reverse proxies

## Key Components

### Authentication System
- JWT-based authentication with non-expiring tokens
- Role-based access control (admin vs user)
- Password hashing using Werkzeug's security functions
- Registration with email validation using regex patterns

### Database Models
- **User**: Stores user credentials, profile info, and role assignment
- **Subject**: Top-level course categories
- **Chapter**: Subdivisions within subjects
- **Quiz**: Individual quizzes with timing and metadata
- **Question**: Quiz questions with multiple choice options
- **Score**: User quiz attempt results and scoring

### API Structure
- RESTful endpoints following `/api/` prefix convention
- JWT protection on authenticated routes
- Role-based authorization for admin operations
- JSON request/response format throughout

### User Interface
- Single Page Application (SPA) architecture
- Component-based views managed through Vue.js data properties
- Bootstrap responsive grid system
- Custom CSS for quiz-specific styling and theming

## Data Flow

1. **Authentication Flow**: Users login/register → JWT token generated → Token stored in localStorage → Included in API requests
2. **Content Management**: Admin creates subjects → chapters → quizzes → questions (hierarchical structure)
3. **Quiz Taking**: Users select subject/chapter → start quiz → submit answers → view scores
4. **Data Persistence**: All data stored in SQLite database with proper foreign key relationships

## External Dependencies

### Frontend Dependencies (CDN)
- Vue.js 3 for reactive UI components
- Bootstrap 5 for responsive styling and components
- Bootstrap Icons for iconography
- Axios for HTTP client functionality

### Backend Dependencies (Python packages)
- Flask for web framework
- Flask-SQLAlchemy for database ORM
- Flask-CORS for cross-origin support
- Flask-JWT-Extended for authentication
- Werkzeug for security utilities

### Database
- SQLite as the primary data store (file-based, no external server required)
- SQLAlchemy ORM for database abstraction and model management

## Deployment Strategy

### Development Setup
- Flask development server on localhost:5000
- Debug mode enabled for development
- Database auto-creation on application startup
- Environment variables for configuration (DATABASE_URL, JWT_SECRET_KEY, SESSION_SECRET)

### Production Considerations
- ProxyFix middleware configured for reverse proxy deployment
- Environment-based configuration for secrets and database URLs
- SQLAlchemy connection pooling with health checks
- CORS configured for cross-origin requests

### Configuration Management
- Environment variables used for sensitive configuration
- Default fallback values for development
- Database connection string configurable via DATABASE_URL
- JWT secrets configurable for security

The application is designed to be lightweight and easily deployable, with minimal external dependencies and a simple file-based database that doesn't require additional infrastructure setup.