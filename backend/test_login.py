import requests

res = requests.post('http://localhost:8000/api/auth/login', json={"email": "avianshku841101@gmail.com", "password": "password123"})
if res.status_code == 200:
    token = res.json()['access_token']
    print(f"Token: {token[:20]}...")
    res2 = requests.get('http://localhost:8000/api/dashboard/stats', headers={"Authorization": f"Bearer {token}"})
    print(f"Stats status: {res2.status_code}")
    print(res2.text)
else:
    print(f"Login failed: {res.status_code}")
    print(res.text)
