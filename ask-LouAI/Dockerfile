FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app app
COPY data data

# Bake the embedding model into the image at build time so the first
# request after a deploy/cold-start doesn't pay a ~90MB Hugging Face
# download (and so the container works with no outbound internet at
# runtime).
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

EXPOSE 8008
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8008"]
