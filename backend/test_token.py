from app.utils.security import create_access_token, decode_access_token

token = create_access_token({"sub": 2, "role": "member"})
print(f"Token: {token}")

payload = decode_access_token(token)
print(f"Payload: {payload}")
