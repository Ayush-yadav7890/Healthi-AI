import pandas as pd

# Load teenon files
diseases = pd.read_csv('../data/diseases.csv')
descriptions = pd.read_csv('../data/symptom_description.csv')
precautions = pd.read_csv('../data/symptom_precaution.csv')

print("=" * 40)
print("DISEASES DATASET")
print("=" * 40)
print("Shape:", diseases.shape)
print("Columns:", list(diseases.columns))
print("Total unique diseases:", diseases['Disease'].nunique())
print("\nFirst 2 rows:")
print(diseases.head(2))

print("\n" + "=" * 40)
print("DESCRIPTION DATASET")
print("=" * 40)
print("Shape:", descriptions.shape)
print("Columns:", list(descriptions.columns))

print("\n" + "=" * 40)
print("PRECAUTION DATASET")
print("=" * 40)
print("Shape:", precautions.shape)
print("Columns:", list(precautions.columns))

print("\n✅ All 3 files loaded successfully!")