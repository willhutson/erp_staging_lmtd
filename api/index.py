from fastapi import FastAPI
from pydantic import BaseModel
import os
import sys

# Add src to path so imports work in Vercel environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../src'))

app = FastAPI(title="Solar Schrodinger Engine", docs_url="/api/docs", openapi_url="/api/openapi.json")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

from src.services.engine import DocEngine
from src.interfaces import GenerateRequest, GenerationResult

@app.post("/api/generate", response_model=GenerationResult)
async def generate_doc(request: GenerateRequest):
    engine = DocEngine()
    result = engine.generate_document(request.template_id)
    return result
