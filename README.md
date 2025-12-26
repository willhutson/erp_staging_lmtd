# Solar Schrodinger - Document Engine

A standalone Python microservice for generating Google Docs from Figma designs.
Built for Vercel Serverless Functions.

## Features
*   **Figma Integration**: Extracts text and styles from Figma nodes.
*   **Google Docs**: Populates templates with dynamic data.
*   **Supabase**: Manages template configurations and job queues.
*   **FastAPI**: Robust, typed API layer.

## Quick Start

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Setup**:
    Copy `.env.example` (create one based on `src/config.py`) to `.env` and fill in:
    *   `FIGMA_TOKEN`
    *   `GOOGLE_CREDENTIALS`
    *   `SUPABASE_URL`
    *   `SUPABASE_KEY`

3.  **Run Locally**:
    ```bash
    uvicorn api.index:app --reload
    ```

## Deployment
This project is designed to be deployed on **Vercel**.
Simply push to your Git repository and import the project in Vercel.
The `api/` directory will be automatically detected as Serverless Functions.
