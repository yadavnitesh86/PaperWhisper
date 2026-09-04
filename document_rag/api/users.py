
import uuid
from typing import Optional
import os
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, exceptions, schemas
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

from document_rag.api.database import get_db
from document_rag.api.models import User

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str
  
    email: str


class UserCreate(schemas.CreateUpdateDictModel):
    username: str
    password: str



# ---------------------------------------------------------------------------


async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)




class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    # BaseUserManager requires these to exist even though we never
    # expose password-reset or email-verification endpoints.
    reset_password_token_secret = JWT_SECRET
    verification_token_secret = JWT_SECRET

    async def create(
        self,
        user_create: UserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        existing = await self.user_db.session.execute(
            select(User).where(User.username == user_create.username)
        )
        if existing.scalar_one_or_none() is not None:
            raise exceptions.UserAlreadyExists()

        user_dict = {
            "username": user_create.username,
            "email": f"{user_create.username}@users.local",
            "hashed_password": self.password_helper.hash(user_create.password),
        }
        return await self.user_db.create(user_dict)

    async def authenticate(self, credentials) -> Optional[User]:
        result = await self.user_db.session.execute(
            select(User).where(User.username == credentials.username)
        )
        user = result.scalar_one_or_none()

        if user is None:
            self.password_helper.hash(credentials.password)
            return None

        verified, updated_hash = self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )
        if not verified:
            return None

        if updated_hash is not None:
            user.hashed_password = updated_hash
            await self.user_db.session.commit()

        return user


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)




bearer_transport = BearerTransport(tokenUrl="auth/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=JWT_SECRET, lifetime_seconds=JWT_EXPIRE_MINUTES * 60)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
