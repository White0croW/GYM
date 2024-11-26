from faker import Faker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.models import Base, Membership, User, Trainer, Workout, Booking
from urllib.parse import quote_plus

fake = Faker()

# Создание подключения к базе данных
username = "postgres"
password = "09122002"
database_name = "gym"
host = "localhost"

quoted_username = quote_plus(username)
quoted_password = quote_plus(password)

database_url = (
    f"postgresql+psycopg2://{quoted_username}:{quoted_password}@{host}/{database_name}"
)
engine = create_engine(database_url)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Создание сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Генерация тестовых данных
memberships = [
    Membership(
        type=fake.word(),
        start_date=fake.date_between(start_date="-1y", end_date="today"),
        end_date=fake.date_between(start_date="today", end_date="+1y"),
    )
    for _ in range(100)
]

# Добавление данных в таблицу memberships
db.bulk_save_objects(memberships)
db.commit()

users = [
    User(
        name=fake.name(),
        email=fake.email(),
        phone=fake.phone_number(),
        membership_id=fake.random_int(min=1, max=100),
    )
    for _ in range(100)
]

# Добавление данных в таблицу users
db.bulk_save_objects(users)
db.commit()

trainers = [Trainer(name=fake.name(), specialization=fake.job()) for _ in range(100)]

# Добавление данных в таблицу trainers
db.bulk_save_objects(trainers)
db.commit()

workouts = [
    Workout(
        name=fake.word(),
        description=fake.text(),
        trainer_id=fake.random_int(min=1, max=100),
        date=fake.date_between(start_date="today", end_date="+1y"),
        time=fake.time(),
        capacity=fake.random_int(min=1, max=50),  # Добавляем поле capacity
    )
    for _ in range(100)
]

# Добавление данных в таблицу workouts
db.bulk_save_objects(workouts)
db.commit()

# Множество для отслеживания уникальных пар (user_id, workout_id)
unique_pairs = set()

bookings = []
for _ in range(100):
    while True:
        user_id = (fake.random_int(min=1, max=100),)
        workout_id = (fake.random_int(min=1, max=100),)
        if (user_id[0], workout_id[0]) not in unique_pairs:
            unique_pairs.add((user_id[0], workout_id[0]))
            bookings.append(Booking(user_id=user_id[0], workout_id=workout_id[0]))
            break

# Добавление данных в таблицу bookings
db.bulk_save_objects(bookings)
db.commit()

# Закрываем сессию
db.close()
