from fastapi import HTTPException
from sqlalchemy import false
from sqlalchemy.orm import Session

from app.modules.users.models import TeacherClass, User


def _role_value(user) -> str:
    role = getattr(user, "role", "")
    return str(getattr(role, "value", role)).lower()


def apply_teacher_submission_scope(query, submission_model, actor):
    """Restrict a submission query to students in the teacher's assigned classes."""
    if _role_value(actor) == "admin":
        return query

    class_codes = []
    for assignment in getattr(actor, "teacher_classes", None) or []:
        code = (getattr(assignment, "class_code", "") or "").strip()
        if code:
            class_codes.append(code)
    if not class_codes:
        return query.filter(false())

    return query.join(User, submission_model.user_id == User.id).filter(
        User.class_code.in_(class_codes)
    )


def ensure_teacher_can_access_student(db: Session, actor, student_id: int) -> None:
    """Hide out-of-scope student records from teacher detail and grading APIs."""
    if _role_value(actor) == "admin":
        return

    class_codes = [
        item.class_code.strip()
        for item in (getattr(actor, "teacher_classes", None) or [])
        if item.class_code and item.class_code.strip()
    ]
    visible = bool(class_codes) and db.query(User.id).join(
        TeacherClass, TeacherClass.class_code == User.class_code
    ).filter(
        User.id == student_id,
        User.role == "student",
        TeacherClass.user_id == actor.id,
        TeacherClass.class_code.in_(class_codes),
    ).first()
    if not visible:
        raise HTTPException(status_code=404, detail="Submission not found")
