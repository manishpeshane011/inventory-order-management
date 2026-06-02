import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

# ❗ HARD STOP if wrong DB is loaded
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found")

print("DB URL LOADED:", DATABASE_URL)

# ❗ Safety check (IMPORTANT)
if "mysql" in DATABASE_URL:
    raise Exception("MySQL detected. You are still using old config!")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()