# app/routers/__init__.py

# Импортируем модули из папки routers
from .users import router as users_router
from .memberships import router as memberships_router
from .trainers import router as trainers_router
from .workouts import router as workouts_router
from .bookings import router as bookings_router
from .queries import router as queries_router
