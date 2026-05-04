from app.utils.security import create_access_token
from app.config import settings
from jose import jwt

token = create_access_token({"sub": 2, "role": "member"})
try:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    print(payload)
except Exception as e:
    print("Exception:", type(e), e)
