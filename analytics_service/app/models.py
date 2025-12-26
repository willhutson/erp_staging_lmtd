from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class GraphNode(BaseModel):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserNode(GraphNode):
    email: Optional[str] = None
    name: Optional[str] = None
    # We don't store passwords here, Supabase handles that.
    
class ActionNode(GraphNode):
    type: str # 'view', 'click', 'add_to_cart', 'purchase', 'custom'
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
class CampaignNode(GraphNode):
    name: str
    platform: str # 'google', 'facebook', 'email'
    status: str
    budget: Optional[float] = None

class AdGroupNode(GraphNode):
    name: str
    campaign_id: str

class CreativeNode(GraphNode):
    name: str
    type: str # 'image', 'video', 'text'
    url: Optional[str] = None
