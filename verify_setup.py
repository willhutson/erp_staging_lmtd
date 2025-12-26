import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    print("Verifying imports...")
    from src.config import Config
    from src.interfaces import GenerateRequest
    from src.clients.figma import FigmaClient
    from src.clients.google import GoogleClient
    from src.clients.supabase import SupabaseClient
    from src.services.engine import DocEngine
    
    print("Initializing classes (Dry Run)...")
    # Initialize without credentials just to check constructor logic
    f = FigmaClient(token="mock")
    g = GoogleClient(credentials_json='{"mock": true}')
    s = SupabaseClient(url="https://mock.supabase.co", key="mock")
    e = DocEngine()
    
    print("Verification Passed: Structure is sound.")

except Exception as e:
    print(f"Verification Failed: {e}")
    sys.exit(1)
