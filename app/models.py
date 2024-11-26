from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Membership(Base):
    __tablename__ = "memberships"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    users = relationship("User", back_populates="membership")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    membership_id = Column(Integer, ForeignKey("memberships.id"))
    membership = relationship("Membership", back_populates="users")


class Trainer(Base):
    __tablename__ = "trainers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String)


class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    trainer = relationship("Trainer")
    date = Column(Date)
    time = Column(Time)
    capacity = Column(Integer, nullable=False)  # Добавляем колонку для вместимости


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    user = relationship("User")
    workout = relationship("Workout")

    # Добавляем уникальное ограничение на комбинацию user_id и workout_id
    __table_args__ = (
        UniqueConstraint("user_id", "workout_id", name="_user_workout_uc"),
    )


# Логика приложения для обеспечения ограничения по вместимости
def book_workout(session, user_id, workout_id):
    workout = session.query(Workout).get(workout_id)
    if workout is None:
        raise ValueError("Тренировка не найдена")

    current_bookings_count = (
        session.query(Booking).filter_by(workout_id=workout_id).count()
    )
    if current_bookings_count >= workout.capacity:
        raise ValueError("Тренировка полностью забронирована")

    booking = Booking(user_id=user_id, workout_id=workout_id)
    session.add(booking)
    session.commit()
