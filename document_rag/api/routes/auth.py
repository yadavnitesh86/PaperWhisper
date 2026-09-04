from fastapi import APIRouter, Depends

from document_rag.api.users import UserCreate, UserRead, auth_backend, current_active_user, fastapi_users

router = APIRouter(prefix="/auth", tags=["auth"])

router.include_router(fastapi_users.get_register_router(UserRead, UserCreate))
router.include_router(fastapi_users.get_auth_router(auth_backend))


@router.get("/me", response_model=UserRead)
async def me(current_user=Depends(current_active_user)):
    return current_user
