from ..clients.figma import FigmaClient
from ..clients.google import GoogleClient
from ..clients.supabase import SupabaseClient
from ..interfaces import GenerationResult

class DocEngine:
    def __init__(self):
        self.figma = FigmaClient()
        self.google = GoogleClient()
        self.supabase = SupabaseClient()

    def generate_document(self, template_id: str) -> GenerationResult:
        # 1. Fetch Config
        config = self.supabase.get_template_config(template_id)
        if not config:
            return GenerationResult(status="error", error="Template not found")

        # 2. Fetch Figma Data
        # We need to fetch the whole file to traverse for names, or specific IDs if we had them.
        # Ideally, mappings store IDs. If names, we search.
        figma_file = self.figma.get_file(config.figma_file_key)
        document_root = figma_file["document"]

        replacements = {}
        for mapping in config.mappings:
            figma_node_name = mapping["figma_node"]
            doc_var = mapping["doc_var"]
            
            # Find node by name
            node = self.figma.helper_find_node_by_name(document_root, figma_node_name)
            if node and "characters" in node:
                replacements[doc_var] = node["characters"]
            # TODO: Handle images here later

        # 3. Create Google Doc
        new_doc_id = self.google.copy_file(config.google_doc_id, f"Generated Doc - {template_id}")

        # 4. Update Content
        self.google.replace_text(new_doc_id, replacements)

        # 5. Return Result
        return GenerationResult(
            status="success",
            doc_url=f"https://docs.google.com/document/d/{new_doc_id}/edit"
        )
