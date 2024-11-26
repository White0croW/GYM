from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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

# Создание сессии (session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовая модель для всех таблиц
Base = declarative_base()


# Функция для получения сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
