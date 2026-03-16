from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import faiss
import pickle
import numpy as np
from groq import Groq
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

load_dotenv('../.env')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (frontend)
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

# Load models
client = Groq(api_key=os.getenv('GROQ_API_KEY'))
model_embed = SentenceTransformer('all-MiniLM-L6-v2')
index = faiss.read_index('../data/faiss_index.bin')

with open('../data/chunks.pkl', 'rb') as f:
    chunks = pickle.load(f)

class SymptomsRequest(BaseModel):
    symptoms: str

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Health AI API running!"}

@app.post("/api/diagnose")
def diagnose(request: SymptomsRequest):
    symptoms_text = request.symptoms

    query_embedding = model_embed.encode([symptoms_text])
    distances, indices = index.search(np.array(query_embedding), k=3)
    top_diseases = [chunks[idx] for idx in indices[0]]
    context = "\n\n".join([c['chunk'] for c in top_diseases])

    prompt = f"""You are a helpful medical assistant.
Medical Knowledge:
{context}

Patient Symptoms: {symptoms_text}

Provide:
1. Most likely disease name
2. Why these symptoms match
3. Key precautions
4. When to see a doctor

Be clear and concise."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "top_matches": [{"disease": d["disease"]} for d in top_diseases],
        "ai_diagnosis": response.choices[0].message.content
    }