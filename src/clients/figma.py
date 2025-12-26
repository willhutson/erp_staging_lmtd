import requests
from typing import Dict, Any, Optional
from ..config import Config

class FigmaClient:
    def __init__(self, token: str = None):
        self.token = token or Config.FIGMA_TOKEN
        self.base_url = "https://api.figma.com/v1"
        self.headers = {"X-Figma-Token": self.token}

    def get_file(self, file_key: str) -> Dict[str, Any]:
        """Fetch the entire file JSON structure."""
        url = f"{self.base_url}/files/{file_key}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_node_by_id(self, file_key: str, node_id: str) -> Dict[str, Any]:
        """Fetch a specific node from the file."""
        url = f"{self.base_url}/files/{file_key}/nodes?ids={node_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        data = response.json()
        return data.get("nodes", {}).get(node_id, {})

    def get_image_url(self, file_key: str, node_id: str, format: str = "png") -> Optional[str]:
        """Get the S3 export URL for a node."""
        url = f"{self.base_url}/images/{file_key}?ids={node_id}&format={format}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        data = response.json()
        return data.get("images", {}).get(node_id)
    
    def download_image(self, url: str) -> bytes:
        """Download image bytes from the export URL."""
        response = requests.get(url)
        response.raise_for_status()
        return response.content

    def helper_find_node_by_name(self, root: Dict[str, Any], name: str) -> Optional[Dict[str, Any]]:
        """Recursive search for a node by name."""
        if root.get("name") == name:
            return root
        
        if "children" in root:
            for child in root["children"]:
                found = self.helper_find_node_by_name(child, name)
                if found:
                    return found
        return None
