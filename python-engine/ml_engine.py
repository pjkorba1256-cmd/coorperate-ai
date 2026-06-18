import pandas as pd
import pickle
import requests
import os

# --- 0. SECURE ENVIRONMENT SETUP ---
# This pulls the hidden key from Render/Hugging Face Spaces without leaking it on GitHub
HF_API_KEY = os.getenv("HUGGINGFACE_TOKEN")

# We will use Mistral-7B because it is blazing fast on the free tier
API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
headers = {"Authorization": f"Bearer {HF_API_KEY}"}

def generate_executive_summary(industry, budget, roi, benefit):
    # The [INST] tags are how Mistral knows it is receiving a direct instruction
    prompt = f"""[INST] Act as a Senior AI Strategy Consultant. A company in the {industry} sector is planning a ${budget} AI investment. 
    Our XGBoost model predicts a {roi}% ROI and a ${benefit} total financial benefit.
    Write a punchy, professional, 3-paragraph executive summary for the Board of Directors explaining why this is a good investment. [/INST]"""
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 200,
            "return_full_text": False # This ensures it only returns the answer, not your prompt
        }
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        # Hugging face returns a list with a dictionary
        return response.json()[0]['generated_text'].strip()
    except Exception as e:
        print(f"LLM Error: {e}")
        return "Executive summary generation unavailable. Please refer to the raw predictive metrics."

# --- 1. THE COMPLETE ARCHITECTURE  ---
EXPECTED_COLUMNS = [
    'year', 'ai_adoption_level', 'ai_investment_usd', 'automation_rate', 
    'productivity_gain', 'employee_ai_training_hours', 'ai_maturity_score', 
    'deployment_count', 'industry_Education', 'industry_Energy', 
    'industry_Financial Services', 'industry_Healthcare', 'industry_Logistics', 
    'industry_Manufacturing', 'industry_Retail', 'industry_Technology', 
    'industry_Telecom', 'country_Brazil', 'country_Canada', 'country_China', 
    'country_France', 'country_Germany', 'country_India', 'country_Japan', 
    'country_Netherlands', 'country_Singapore', 'country_South Korea', 
    'country_Sweden', 'country_UAE', 'country_United Kingdom', 'country_United States'
]

# Wake up the trained XGBoost model
try:
    with open("champion_roi_model.pkl", "rb") as file:
        champion_model = pickle.load(file)
except FileNotFoundError:
    print("WARNING: champion_roi_model.pkl not found! Ensure it is in the same directory.")
    champion_model = None

# --- 2. PREPROCESSING ---
def preprocess_user_data(user_payload):
    # Create the blank 31-column Scantron sheet
    input_df = pd.DataFrame(0, index=[0], columns=EXPECTED_COLUMNS)
    
    # Map all the raw numbers 
    input_df['year'] = user_payload['year']
    input_df['ai_adoption_level'] = user_payload['ai_adoption_level']
    input_df['ai_investment_usd'] = user_payload['ai_investment_usd']
    input_df['automation_rate'] = user_payload['automation_rate']
    input_df['productivity_gain'] = user_payload['productivity_gain']
    input_df['employee_ai_training_hours'] = user_payload['employee_ai_training_hours']
    input_df['ai_maturity_score'] = user_payload['ai_maturity_score']
    input_df['deployment_count'] = user_payload['deployment_count']
    
    # Handle the text-to-binary translation dynamically
    industry_col = f"industry_{user_payload['industry']}"
    if industry_col in input_df.columns:
        input_df[industry_col] = 1
        
    country_col = f"country_{user_payload['country']}"
    if country_col in input_df.columns:
        input_df[country_col] = 1
        
    return input_df


# --- 3. THE PREDICTION ENGINE ---
def calculate_roi(user_payload):
    if champion_model is None:
        return {"error": "Model file missing."}

    # Step A: Translate the text
    processed_matrix = preprocess_user_data(user_payload)
    
    # Step B: Feed it to XGBoost
    predicted_benefit = champion_model.predict(processed_matrix)[0]
    
    # Step C: The Backend Math
    initial_investment = user_payload['ai_investment_usd']
    if initial_investment <= 0:
        roi_percentage = 0
    else:
        roi_percentage = (predicted_benefit / initial_investment) * 100
        
    # Cap the ROI between 0 and 100%
    roi_percentage = max(0, min(100, roi_percentage))
        
    # Round the numbers to look clean on the frontend
    final_benefit_rounded = round(float(predicted_benefit), 2)
    final_roi_rounded = round(float(roi_percentage), 2)

    # Step D: Ask Mistral to write the report using the correct dictionary keys
    llm_report = generate_executive_summary(
        industry=user_payload['industry'],
        budget=user_payload['ai_investment_usd'],
        roi=final_roi_rounded,
        benefit=final_benefit_rounded
    )

    # Step E: Extract Real SHAP / Feature Importances
    importances = champion_model.feature_importances_
    shap_data = []
    for name, imp in zip(EXPECTED_COLUMNS, importances):
        if imp > 0:
            shap_data.append({
                "feature": name.replace('industry_', '').replace('country_', '').replace('_', ' ').title(),
                "importance": round(float(imp) * 100, 1)
            })
    
    shap_data = sorted(shap_data, key=lambda x: x["importance"], reverse=True)[:6]

    # Step F: Package it ALL up in ONE final return statement
    return {
        "predicted_financial_benefit_usd": final_benefit_rounded,
        "roi_percentage": final_roi_rounded,
        "boardroom_report": llm_report,
        "shap_features": shap_data
    }
