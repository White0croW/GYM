from datetime import date, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..models import Membership, Trainer, User, Workout, Booking
from app.schemas.trainers import TrainerWorkoutCount


def get_workouts_by_trainer(db: Session, trainer_id: int):
    return db.query(Workout).filter(Workout.trainer_id == trainer_id).all()


def get_bookings_by_user(db: Session, user_id: int):
    return db.query(Booking).filter(Booking.user_id == user_id).all()


def get_workouts_by_date(db: Session, date: date):
    return db.query(Workout).filter(Workout.date == date).all()


def get_most_popular_workout(db: Session):
    # Выполняем запрос к базе данных для получения самой популярной тренировки
    result = (
        db.query(
            Workout.name.label("название"),
            Workout.description.label("описание"),
            Trainer.name.label("тренер"),
            Workout.date.label("дата"),
            Workout.time.label("время"),
            Workout.capacity.label("количество_мест"),
            func.count(Booking.id).label("количество_бронирований"),
        )
        .join(Booking)
        .join(Trainer, Workout.trainer_id == Trainer.id)
        .group_by(Workout.id, Trainer.name)
        .order_by(func.count(Booking.id).desc())
        .first()
    )

    # Преобразуем результат в словарь
    if result:
        return {
            "название": result.название,
            "описание": result.описание,
            "тренер": result.тренер,
            "дата": result.дата.strftime("%Y-%m-%d"),
            "время": result.время.strftime("%H:%M:%S"),
            "количество_мест": result.количество_мест,
            "количество_бронирований": result.количество_бронирований,
        }
    return None


def get_trainers_with_most_workouts(db: Session):
    # Выполняем запрос к базе данных для получения тренеров с наибольшим количеством тренировок
    results = (
        db.query(
            Trainer.id.label("id"),
            Trainer.name.label("name"),
            Trainer.specialization.label("specialization"),
            func.count(Workout.id).label("workout_count"),
        )
        .join(Workout)
        .group_by(Trainer.id)
        .order_by(func.count(Workout.id).desc())
        .limit(10)
        .all()
    )

    # Преобразуем результаты в список словарей
    return [
        {
            "тренер": result.name,
            "специализация": result.specialization,
            "количество_тренировок": result.workout_count,
        }
        for result in results
    ]


def get_users_with_expiring_memberships(db: Session):
    # Выполняем запрос к базе данных для получения пользователей с истекающим членством
    results = (
        db.query(
            User.name.label("имя"),
            User.email.label("email"),
            User.phone.label("телефон"),
            Membership.type.label("тип_членства"),
            Membership.end_date.label("дата_окончания"),
            (Membership.end_date - date.today()).label("оставшиеся_дни"),
        )
        .join(Membership)
        .filter(Membership.end_date <= date.today() + timedelta(days=30))
        .order_by((Membership.end_date - date.today()).label("оставшиеся_дни"))
        .all()
    )

    # Преобразуем результаты в список словарей
    return [
        {
            "имя": result.имя,
            "email": result.email,
            "телефон": result.телефон,
            "тип_членства": result.тип_членства,
            "дата_окончания": result.дата_окончания,
            "оставшиеся_дни": result.оставшиеся_дни,
        }
        for result in results
    ]
