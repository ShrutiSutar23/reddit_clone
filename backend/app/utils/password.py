from passlib.context import CryptContext

# bcrypt is the hashing algorithm – industry standard for passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Scramble a plain text password into a bcrypt hash.
    Example:
        "mypassword123" → "$2b$12$xK9mNpQrStUvWxYzAbCdEf..."
    The result is NEVER reversible.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check if a plain password matches a stored hash.
    Used during login to verify the user's password.
    Returns True if match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
