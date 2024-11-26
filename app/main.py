# app/main.py
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import (
    users_router,
    memberships_router,
    trainers_router,
    workouts_router,
    bookings_router,
    queries_router,
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(queries_router, prefix="/queries", tags=["queries"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(memberships_router, prefix="/memberships", tags=["memberships"])
app.include_router(trainers_router, prefix="/trainers", tags=["trainers"])
app.include_router(workouts_router, prefix="/workouts", tags=["workouts"])
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])


app.mount("/app/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


# Оотображает раздел с информацией о компании
@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")
