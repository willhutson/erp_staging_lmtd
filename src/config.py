import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FIGMA_TOKEN = os.getenv("FIGMA_TOKEN")
    GOOGLE_CREDENTIALS_JSON = os.getenv("GOOGLE_CREDENTIALS") # Content of json file
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    # Defaults
    API_PREFIX = "/api"
