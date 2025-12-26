from supabase import create_client, Client
from ..config import Config
from ..interfaces import TemplateConfig
from typing import Optional

class SupabaseClient:
    def __init__(self, url: str = None, key: str = None):
        self.url = url or Config.SUPABASE_URL
        self.key = key or Config.SUPABASE_KEY
        self.client: Client = None
        if self.url and self.key:
            self.client = create_client(self.url, self.key)

    def get_template_config(self, template_id: str) -> Optional[TemplateConfig]:
        """Fetch template details and mappings from DB."""
        if not self.client:
            return None # Mock or fail

        # 1. Fetch Template
        res = self.client.table("doc_templates").select("*").eq("id", template_id).execute()
        if not res.data:
            return None
        
        template_data = res.data[0]
        
        # 2. Fetch Mappings
        res_map = self.client.table("template_mappings").select("*").eq("template_id", template_id).execute()
        mappings = []
        for m in res_map.data:
            mappings.append({
                "figma_node": m["figma_node_name"],
                "doc_var": m["doc_var_name"]
            })
            
        return TemplateConfig(
            id=template_data["id"],
            figma_file_key=template_data["figma_file_key"],
            google_doc_id=template_data["google_doc_id"],
            mappings=mappings
        )

    # In a real async queue scenario, we'd have:
    # def create_job(self, ...)
    # def update_job_status(self, ...)
