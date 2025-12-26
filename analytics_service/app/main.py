from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from .database import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        db.connect()
    except Exception as e:
        print(f"Startup Warning: Could not connect to Neo4j: {e}")
        # We don't raise here so the Vercel function can still "start" and serve /health
    yield
    # Shutdown
    db.close()

app = FastAPI(title="Analytics Platform API", lifespan=lifespan)

from .services import graph_service
from .models import UserNode, ActionNode
from .auth import get_user_id

@app.post("/hooks/supabase-user")
async def sync_supabase_user(user: UserNode, secret_check: str = None):
    # In prod, verify 'secret_check' matches a webhook secret
    graph_service.upsert_user(user)
    return {"status": "synced"}

@app.post("/track")
async def track_event(action: ActionNode, user_id: str = Depends(get_user_id)):
    # user_id comes from the JWT
    graph_service.track_action(user_id, action)
    return {"status": "recorded", "action_id": action.id}

@app.get("/analytics/stats")
async def get_stats(user_id: str = Depends(get_user_id)):
    """
    Returns high-level KPI cards for the dashboard.
    """
    return graph_service.get_dashboard_stats(user_id)

