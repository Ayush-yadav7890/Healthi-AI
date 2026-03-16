import pandas as pd
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

print("Loading dataset...")
diseases = pd.read_csv('../data/diseases.csv')
descriptions = pd.read_csv('../data/symptom_description.csv')
precautions = pd.read_csv('../data/symptom_precaution.csv')

print("Converting to text chunks...")
chunks = []

for _, row in diseases.iterrows():
    disease = row['Disease']
    
    # Symptoms collect karo
    symptoms = []
    for col in diseases.columns[1:]:
        if pd.notna(row[col]) and row[col] != '':
            symptoms.append(str(row[col]).strip())
    
    # Description lo
    desc_row = descriptions[descriptions['Disease'] == disease]
    description = desc_row['Description'].values[0] if len(desc_row) > 0 else ""
    
    # Precautions lo
    prec_row = precautions[precautions['Disease'] == disease]
    if len(prec_row) > 0:
        precs = [str(prec_row[f'Precaution_{i}'].values[0]) 
                 for i in range(1, 5) 
                 if pd.notna(prec_row[f'Precaution_{i}'].values[0])]
        precaution_text = ", ".join(precs)
    else:
        precaution_text = ""
    
    # Natural language chunk banao
    chunk = f"Disease: {disease}. Symptoms: {', '.join(symptoms)}. Description: {description}. Precautions: {precaution_text}"
    chunks.append({
        "disease": disease,
        "chunk": chunk,
        "symptoms": symptoms,
        "description": description,
        "precautions": precaution_text
    })

# Duplicates remove karo
unique_chunks = {c['disease']: c for c in chunks}.values()
chunks = list(unique_chunks)
print(f"Total unique diseases: {len(chunks)}")

print("Creating embeddings (thoda time lagega)...")
model = SentenceTransformer('all-MiniLM-L6-v2')
texts = [c['chunk'] for c in chunks]
embeddings = model.encode(texts, show_progress_bar=True)

print("Building FAISS index...")
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

print("Saving index and chunks...")
faiss.write_index(index, '../data/faiss_index.bin')
with open('../data/chunks.pkl', 'wb') as f:
    pickle.dump(chunks, f)

print(f"Done! {len(chunks)} diseases indexed successfully!")