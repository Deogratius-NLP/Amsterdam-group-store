from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.admin_user import AdminUser
from app.schemas.auth import LoginRequest, TokenResponse, AdminUserOut, ChangeCredentialsRequest
from app.api.deps import get_current_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == data.email).first()
    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account has been disabled"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=admin.id, expires_delta=access_token_expires)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_name=admin.name,
        user_email=admin.email,
        user_role=admin.role
    )


@router.get("/me", response_model=AdminUserOut)
def get_admin_profile(current_admin: AdminUser = Depends(get_current_admin)):
    return current_admin


@router.put("/security", response_model=TokenResponse)
def update_security_credentials(
    data: ChangeCredentialsRequest,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Safely updates admin email and/or password after verifying the current password.
    """
    if not verify_password(data.current_password, current_admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # If updating email
    if data.new_email and data.new_email.lower() != current_admin.email.lower():
        existing = db.query(AdminUser).filter(AdminUser.email == data.new_email.lower()).first()
        if existing and existing.id != current_admin.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An admin account with this email address already exists"
            )
        current_admin.email = data.new_email.lower()

    # If updating password
    if data.new_password:
        if len(data.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long"
            )
        if data.confirm_password and data.new_password != data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation do not match"
            )
        current_admin.hashed_password = get_password_hash(data.new_password)

    db.commit()
    db.refresh(current_admin)

    # Issue fresh token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=current_admin.id, expires_delta=access_token_expires)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_name=current_admin.name,
        user_email=current_admin.email,
        user_role=current_admin.role
    )
