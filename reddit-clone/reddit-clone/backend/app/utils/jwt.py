from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db

# This tells FastAPI where users send their token (the /api/auth/login endpoint)
#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    scheme_name="Bearer"
)


def create_access_token(data: dict) -> str:
    """
    Create a signed JWT token containing user data.

    Example input:  { "user_id": 5, "username": "john_doe" }
    Example output: "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1fQ.abc123"

    The token:
    - Contains user_id so we know who is making each request
    - Expires after ACCESS_TOKEN_EXPIRE_MINUTES (default 24 hours)
    - Is signed with SECRET_KEY so nobody can fake or modify it
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_access_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Returns the payload (user data) if valid.
    Raises HTTPException if token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency – extracts the current logged-in user from the JWT token.

    Usage in any route:
        @router.get("/protected")
        def protected_route(current_user = Depends(get_current_user)):
            return { "hello": current_user.username }

    Flow:
    1. FastAPI reads the Authorization: Bearer <token> header
    2. We decode the token to get user_id
    3. We fetch the full User object from DB
    4. We return it to the route function
    """
    # Import here to avoid circular imports
    from app.models.user import User

    payload = verify_access_token(token)
    user_id: int = payload.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    return user


def get_optional_user(
    request: "Request",
    db: Session = Depends(get_db),
):
    """
    Like get_current_user but does NOT raise an error if no token.
    Used for public routes that show extra info when logged in
    (e.g. showing whether the user already voted on a post).
    Returns None if no token or invalid token.
    """
    from app.models.user import User
    from fastapi import Request

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        payload = verify_access_token(token)
        user_id = payload.get("user_id")
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None
