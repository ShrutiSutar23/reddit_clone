from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    RegisterResponse,
)
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, get_current_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/auth/register
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    Steps:
    1. Check username is not already taken
    2. Check email is not already registered
    3. Hash the password (never store plain text)
    4. Save user to database
    5. Return user info (no password)
    """
    # Step 1 – username must be unique
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Step 2 – email must be unique
    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Step 3 – hash the password
    hashed = hash_password(user_data.password)

    # Step 4 – create and save the user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)   # loads the auto-generated id and created_at

    # Step 5 – return success
    return RegisterResponse(
        message="Account created successfully!",
        user=new_user,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/auth/login
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT token",
)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.

    Steps:
    1. Find user by email
    2. Verify password against stored hash
    3. Create JWT token containing user_id
    4. Return token + user info

    The token must be sent in the Authorization header for all
    protected requests:
        Authorization: Bearer <token>
    """
    # Step 1 – find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Step 2 – verify password (use same error for both cases – security best practice)
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Step 3 – create JWT token
    token = create_access_token(data={
        "user_id":  user.id,
        "username": user.username,
    })

    # Step 4 – return token and user info
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/auth/me   (protected)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently logged-in user",
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently authenticated user.
    Requires a valid JWT token in the Authorization header.

    Used by the frontend to:
    - Show username in the navbar
    - Check if user is logged in on page refresh
    """
    return current_user


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/auth/users/{username}  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/users/{username}",
    response_model=UserResponse,
    summary="Get a user's public profile by username",
)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    """
    Returns public profile of any user by username.
    No authentication required.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{username}' not found",
        )
    return user
