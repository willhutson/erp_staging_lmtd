import json
from typing import Dict, Any, List
from google.oauth2 import service_account
from googleapiclient.discovery import build
from ..config import Config

SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive']

class GoogleClient:
    def __init__(self, credentials_json: str = None):
        creds_content = credentials_json or Config.GOOGLE_CREDENTIALS_JSON
        if not creds_content:
             # In a real environment we might fail here, but for now we'll allow it 
             # and fail only when method calls are made if creds are missing.
             self.creds = None
             return

        try:
            info = json.loads(creds_content)
            self.creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        except Exception as e:
            print(f"Error loading credentials: {e}")
            self.creds = None

    def get_docs_service(self):
        return build('docs', 'v1', credentials=self.creds)

    def get_drive_service(self):
        return build('drive', 'v3', credentials=self.creds)

    def copy_file(self, file_id: str, new_name: str) -> str:
        """Copy a file (template) and return the new file ID."""
        drive = self.get_drive_service()
        body = {'name': new_name}
        file = drive.files().copy(fileId=file_id, body=body).execute()
        return file.get('id')

    def replace_text(self, doc_id: str, replacements: Dict[str, str]):
        """Batch replace text placeholders {{key}} with value."""
        if not replacements:
            return

        docs = self.get_docs_service()
        requests = []
        for key, value in replacements.items():
            requests.append({
                'replaceAllText': {
                    'containsText': {
                        'text': '{{' + key + '}}',
                        'matchCase': True
                    },
                    'replaceText': value
                }
            })

        docs.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()

    def replace_image(self, doc_id: str, placeholder_text: str, image_url: str):
        """
        Replace an image based on a text placeholder.
        Note: This is a simplification. Usually finding the right image location 
        is trickier, often using a named range or just appending.
        For this MVP, we will try to find the image PLACEHOLDER TEXT and replace it with an inline image.
        Realistically, to replace an *existing* image, we need its ObjectId.
        To keep it simple: We will insert the image after a text placeholder.
        """
        # TODO: Implement proper image replacement logic. 
        # For now, we'll focus on text replacement as the primary MVP feature.
        pass
