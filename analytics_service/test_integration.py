import requests
import jwt
import time
from datetime import datetime

# Configuration
API_URL = "http://localhost:8000"
JWT_SECRET = "super-secret-jwt-token" # Must match config.py

def generate_supabase_token(user_id):
    """Mocks a Supabase JWT"""
    payload = {
        "sub": user_id,
        "role": "authenticated",
        "aud": "authenticated",
        "exp": int(time.time()) + 3600
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def main():
    print(f"--- Starting Integration Test against {API_URL} ---")
    
    # 1. Mock Supabase Webhook (Sign Up)
    print("\n[1] Mocking User Sign Up (Supabase Webhook)...")
    user_payload = {
        "id": "user_123_abc",
        "email": "will@example.com",
        "name": "Will the Admin"
    }
    # Note: Webhooks usually have a shared secret signature check, we skipped for dev
    resp = requests.post(f"{API_URL}/hooks/supabase-user", json=user_payload)
    if resp.status_code == 200:
        print("✅ User Synced:", resp.json())
    else:
        print("❌ Failed to Sync User:", resp.text)
        return

    # 2. Mock Frontend Tracking (Action)
    print("\n[2] Mocking Frontend Action (Track)...")
    token = generate_supabase_token("user_123_abc")
    headers = {"Authorization": f"Bearer {token}"}
    
    action_payload = {
        "id": f"evt_{int(time.time())}",
        "type": "view_dashboard",
        "created_at": datetime.utcnow().isoformat(),
        "metadata": {
            "page": "/analytics/overview",
            "referrer": "google"
        }
    }
    
    resp = requests.post(f"{API_URL}/track", json=action_payload, headers=headers)
    if resp.status_code == 200:
        print("✅ Action Recorded:", resp.json())
    else:
        print("❌ Failed to Track:", resp.text)
        
    print("\n--- Test Complete ---")

if __name__ == "__main__":
    main()
