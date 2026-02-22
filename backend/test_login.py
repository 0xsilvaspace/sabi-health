import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    phone = 2348000000000
    password = "password123"
    
    # 1. Register first to be sure
    print(f"Registering user with phone {phone}...")
    reg_data = {
        "name": "Test User",
        "phone": phone,
        "lga": "Kano",
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/register", json=reg_data)
    if resp.status_code == 200:
        print("Registration successful")
    elif resp.status_code == 400 and "already registered" in resp.text:
        print("User already registered")
    else:
        print(f"Registration failed: {resp.status_code} {resp.text}")

    # 2. Try login
    print(f"Logging in with phone {phone}...")
    login_data = {
        "phone": phone,
        "password": password
    }
    try:
        resp = requests.post(f"{BASE_URL}/login", json=login_data)
        if resp.status_code == 200:
            print("Login successful")
            print(f"Response: {json.dumps(resp.json(), indent=2)}")
        else:
            print(f"Login failed: {resp.status_code}")
            print(f"Error detail: {resp.text}")
    except Exception as e:
        print(f"Login request failed: {e}")

if __name__ == "__main__":
    test_login()
