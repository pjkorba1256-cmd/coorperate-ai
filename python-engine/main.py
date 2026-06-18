from fastapi import FastAPI
from pydantic import BaseModel
from ml_engine import calculate_roi

app = FastAPI()

class PredictionRequest(BaseModel):
    year: int
    ai_adoption_level: float
    ai_investment_usd: float
    automation_rate: float
    productivity_gain: float
    employee_ai_training_hours: float
    ai_maturity_score: float
    deployment_count: int
    industry: str
    country: str

@app.get("/")
def home():
    return {"status": "AI ROI Engine Running"}

@app.post("/predict")
def predict(data: PredictionRequest):
    result = calculate_roi(data.dict())
    return result