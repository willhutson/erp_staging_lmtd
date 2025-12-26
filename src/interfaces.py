from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class GenerateRequest(BaseModel):
    template_id: str
    overrides: Optional[Dict[str, Any]] = None

class TemplateConfig(BaseModel):
    id: str
    figma_file_key: str
    google_doc_id: str
    mappings: List[Dict[str, str]] # e.g. [{"figma_node": "title", "doc_var": "title"}]

class GenerationResult(BaseModel):
    status: str
    doc_url: Optional[str] = None
    error: Optional[str] = None
