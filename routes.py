from flask import request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import app, db
from models import User, Subject, Chapter, Quiz, Question, Score
from datetime import datetime
import json

@app.route('/')
def index():
    return render_template('index.html')

# Subject routes
@app.route('/api/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    try:
        subjects = Subject.query.all()
        return jsonify([{
            'id': s.id,
            'name': s.name,
            'description': s.description,
            'created_at': s.created_at.isoformat(),
            'chapter_count': len(s.chapters)
        } for s in subjects]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subjects', methods=['POST'])
@jwt_required()
def create_subject():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'error': 'Subject name is required'}), 400
        
        subject = Subject(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(subject)
        db.session.commit()
        
        return jsonify({
            'message': 'Subject created successfully',
            'subject': {
                'id': subject.id,
                'name': subject.name,
                'description': subject.description,
                'created_at': subject.created_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
@jwt_required()
def update_subject(subject_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        subject = Subject.query.get(subject_id)
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        data = request.get_json()
        if data.get('name'):
            subject.name = data['name']
        if data.get('description') is not None:
            subject.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subject updated successfully',
            'subject': {
                'id': subject.id,
                'name': subject.name,
                'description': subject.description,
                'created_at': subject.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
@jwt_required()
def delete_subject(subject_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        subject = Subject.query.get(subject_id)
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        db.session.delete(subject)
        db.session.commit()
        
        return jsonify({'message': 'Subject deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Chapter routes
@app.route('/api/subjects/<int:subject_id>/chapters', methods=['GET'])
@jwt_required()
def get_chapters(subject_id):
    try:
        subject = Subject.query.get(subject_id)
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'created_at': c.created_at.isoformat(),
            'quiz_count': len(c.quizzes)
        } for c in chapters]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chapters', methods=['POST'])
@jwt_required()
def create_chapter():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        if not data.get('name') or not data.get('subject_id'):
            return jsonify({'error': 'Chapter name and subject_id are required'}), 400
        
        chapter = Chapter(
            subject_id=data['subject_id'],
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(chapter)
        db.session.commit()
        
        return jsonify({
            'message': 'Chapter created successfully',
            'chapter': {
                'id': chapter.id,
                'name': chapter.name,
                'description': chapter.description,
                'subject_id': chapter.subject_id,
                'created_at': chapter.created_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chapters/<int:chapter_id>', methods=['PUT'])
@jwt_required()
def update_chapter(chapter_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({'error': 'Chapter not found'}), 404
        
        data = request.get_json()
        if data.get('name'):
            chapter.name = data['name']
        if data.get('description') is not None:
            chapter.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Chapter updated successfully',
            'chapter': {
                'id': chapter.id,
                'name': chapter.name,
                'description': chapter.description,
                'subject_id': chapter.subject_id,
                'created_at': chapter.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chapters/<int:chapter_id>', methods=['DELETE'])
@jwt_required()
def delete_chapter(chapter_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({'error': 'Chapter not found'}), 404
        
        db.session.delete(chapter)
        db.session.commit()
        
        return jsonify({'message': 'Chapter deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Quiz routes
@app.route('/api/chapters/<int:chapter_id>/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes(chapter_id):
    try:
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({'error': 'Chapter not found'}), 404
        
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        return jsonify([{
            'id': q.id,
            'title': q.title,
            'date_of_quiz': q.date_of_quiz.isoformat(),
            'time_duration': q.time_duration,
            'remarks': q.remarks,
            'created_at': q.created_at.isoformat(),
            'question_count': len(q.questions)
        } for q in quizzes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/quizzes', methods=['POST'])
@jwt_required()
def create_quiz():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        required_fields = ['title', 'chapter_id', 'time_duration']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        quiz = Quiz(
            chapter_id=data['chapter_id'],
            title=data['title'],
            time_duration=data['time_duration'],
            remarks=data.get('remarks', '')
        )
        
        db.session.add(quiz)
        db.session.commit()
        
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz': {
                'id': quiz.id,
                'title': quiz.title,
                'chapter_id': quiz.chapter_id,
                'time_duration': quiz.time_duration,
                'remarks': quiz.remarks,
                'created_at': quiz.created_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/quizzes/<int:quiz_id>', methods=['PUT'])
@jwt_required()
def update_quiz(quiz_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        data = request.get_json()
        if data.get('title'):
            quiz.title = data['title']
        if data.get('time_duration'):
            quiz.time_duration = data['time_duration']
        if data.get('remarks') is not None:
            quiz.remarks = data['remarks']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Quiz updated successfully',
            'quiz': {
                'id': quiz.id,
                'title': quiz.title,
                'chapter_id': quiz.chapter_id,
                'time_duration': quiz.time_duration,
                'remarks': quiz.remarks,
                'created_at': quiz.created_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/quizzes/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
def delete_quiz(quiz_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        db.session.delete(quiz)
        db.session.commit()
        
        return jsonify({'message': 'Quiz deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Question routes
@app.route('/api/quizzes/<int:quiz_id>/questions', methods=['GET'])
@jwt_required()
def get_questions(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Hide correct answers from regular users
        return jsonify([{
            'id': q.id,
            'question_statement': q.question_statement,
            'option1': q.option1,
            'option2': q.option2,
            'option3': q.option3,
            'option4': q.option4,
            'correct_option': q.correct_option if user.role == 'admin' else None
        } for q in questions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions', methods=['POST'])
@jwt_required()
def create_question():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        required_fields = ['quiz_id', 'question_statement', 'option1', 'option2', 'option3', 'option4', 'correct_option']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        if data['correct_option'] not in [1, 2, 3, 4]:
            return jsonify({'error': 'correct_option must be 1, 2, 3, or 4'}), 400
        
        question = Question(
            quiz_id=data['quiz_id'],
            question_statement=data['question_statement'],
            option1=data['option1'],
            option2=data['option2'],
            option3=data['option3'],
            option4=data['option4'],
            correct_option=data['correct_option']
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question created successfully',
            'question': {
                'id': question.id,
                'quiz_id': question.quiz_id,
                'question_statement': question.question_statement,
                'option1': question.option1,
                'option2': question.option2,
                'option3': question.option3,
                'option4': question.option4,
                'correct_option': question.correct_option
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        data = request.get_json()
        if data.get('question_statement'):
            question.question_statement = data['question_statement']
        if data.get('option1'):
            question.option1 = data['option1']
        if data.get('option2'):
            question.option2 = data['option2']
        if data.get('option3'):
            question.option3 = data['option3']
        if data.get('option4'):
            question.option4 = data['option4']
        if data.get('correct_option') and data['correct_option'] in [1, 2, 3, 4]:
            question.correct_option = data['correct_option']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question updated successfully',
            'question': {
                'id': question.id,
                'quiz_id': question.quiz_id,
                'question_statement': question.question_statement,
                'option1': question.option1,
                'option2': question.option2,
                'option3': question.option3,
                'option4': question.option4,
                'correct_option': question.correct_option
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({'message': 'Question deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Quiz attempt and scoring
@app.route('/api/quizzes/<int:quiz_id>/attempt', methods=['POST'])
@jwt_required()
def submit_quiz_attempt(quiz_id):
    try:
        current_user_id = get_jwt_identity()
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404
        
        data = request.get_json()
        answers = data.get('answers', {})  # {question_id: selected_option}
        time_taken = data.get('time_taken', 0)
        
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        total_questions = len(questions)
        correct_answers = 0
        
        for question in questions:
            user_answer = answers.get(str(question.id))
            if user_answer == question.correct_option:
                correct_answers += 1
        
        # Save score
        score = Score(
            quiz_id=quiz_id,
            user_id=current_user_id,
            total_scored=correct_answers,
            total_questions=total_questions,
            time_taken=time_taken
        )
        
        db.session.add(score)
        db.session.commit()
        
        return jsonify({
            'message': 'Quiz submitted successfully',
            'score': {
                'id': score.id,
                'total_scored': correct_answers,
                'total_questions': total_questions,
                'percentage': (correct_answers / total_questions) * 100 if total_questions > 0 else 0,
                'time_taken': time_taken
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User scores and history
@app.route('/api/user/scores', methods=['GET'])
@jwt_required()
def get_user_scores():
    try:
        current_user_id = get_jwt_identity()
        scores = db.session.query(Score, Quiz, Chapter, Subject).join(Quiz).join(Chapter).join(Subject).filter(Score.user_id == current_user_id).order_by(Score.time_stamp_of_attempt.desc()).all()
        
        return jsonify([{
            'id': score.Score.id,
            'quiz_title': score.Quiz.title,
            'subject_name': score.Subject.name,
            'chapter_name': score.Chapter.name,
            'total_scored': score.Score.total_scored,
            'total_questions': score.Score.total_questions,
            'percentage': (score.Score.total_scored / score.Score.total_questions) * 100 if score.Score.total_questions > 0 else 0,
            'time_taken': score.Score.time_taken,
            'attempt_date': score.Score.time_stamp_of_attempt.isoformat()
        } for score in scores]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Search functionality
@app.route('/api/search', methods=['GET'])
@jwt_required()
def search():
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'subjects': [], 'chapters': [], 'quizzes': [], 'users': []}), 200
        
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Search subjects
        subjects = Subject.query.filter(Subject.name.contains(query)).all()
        
        # Search chapters
        chapters = db.session.query(Chapter, Subject).join(Subject).filter(Chapter.name.contains(query)).all()
        
        # Search quizzes
        quizzes = db.session.query(Quiz, Chapter, Subject).join(Chapter).join(Subject).filter(Quiz.title.contains(query)).all()
        
        result = {
            'subjects': [{
                'id': s.id,
                'name': s.name,
                'description': s.description,
                'type': 'subject'
            } for s in subjects],
            'chapters': [{
                'id': c.Chapter.id,
                'name': c.Chapter.name,
                'description': c.Chapter.description,
                'subject_name': c.Subject.name,
                'type': 'chapter'
            } for c in chapters],
            'quizzes': [{
                'id': q.Quiz.id,
                'title': q.Quiz.title,
                'subject_name': q.Subject.name,
                'chapter_name': q.Chapter.name,
                'time_duration': q.Quiz.time_duration,
                'type': 'quiz'
            } for q in quizzes]
        }
        
        # Only admin can search users
        if user.role == 'admin':
            users = User.query.filter(User.full_name.contains(query)).all()
            result['users'] = [{
                'id': u.id,
                'username': u.username,
                'full_name': u.full_name,
                'email': u.email,
                'type': 'user'
            } for u in users]
        else:
            result['users'] = []
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Dashboard statistics
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role == 'admin':
            # Admin statistics
            total_users = User.query.filter_by(role='user').count()
            total_subjects = Subject.query.count()
            total_chapters = Chapter.query.count()
            total_quizzes = Quiz.query.count()
            total_questions = Question.query.count()
            total_attempts = Score.query.count()
            
            return jsonify({
                'total_users': total_users,
                'total_subjects': total_subjects,
                'total_chapters': total_chapters,
                'total_quizzes': total_quizzes,
                'total_questions': total_questions,
                'total_attempts': total_attempts
            }), 200
        else:
            # User statistics
            user_scores = Score.query.filter_by(user_id=current_user_id).all()
            total_attempts = len(user_scores)
            total_score = sum(s.total_scored for s in user_scores)
            total_questions = sum(s.total_questions for s in user_scores)
            average_score = (total_score / total_questions) * 100 if total_questions > 0 else 0
            
            return jsonify({
                'total_attempts': total_attempts,
                'average_score': round(average_score, 2),
                'total_subjects_attempted': len(set(s.quiz.chapter.subject_id for s in user_scores)),
                'best_score': max((s.total_scored / s.total_questions) * 100 for s in user_scores) if user_scores else 0
            }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
