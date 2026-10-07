from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from enum import Enum
import pandas as pd
import joblib
import os

app = FastAPI(
    title="Agriculture Crop Yield API",
    description="A simple API to predict crop yields using multiple machine learning models."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available models
class ModelChoice(str, Enum):
    linear = "linear"
    ridge = "ridge"
    decision_tree = "decision_tree"
    random_forest = "random_forest"
    gradient_boosting = "gradient_boosting"
    knn = "knn"
    xgboost = "xgboost"

# Define the Expected Input Data Structure
class PredictionInput(BaseModel):
    Region: str = Field(..., example="North")
    Soil_Type: str = Field(..., example="Loamy")
    Crop: str = Field(..., example="Wheat")
    Weather_Condition: str = Field(..., example="Sunny")
    Rainfall_mm: float = Field(..., example=500.0)
    Temperature_Celsius: float = Field(..., example=25.5)
    Fertilizer_Used: bool = Field(..., example=True)
    Irrigation_Used: bool = Field(..., example=True)
    Days_to_Harvest: int = Field(..., example=120)

models_cache = {}
categorical_cols = ["Region", "Soil_Type", "Crop", "Weather_Condition"]
dummy_columns = []

@app.on_event("startup")
def load_data_structure():
    global dummy_columns
    try:
        df = pd.read_csv("data/crop_yield.csv")
        encoded_df = pd.get_dummies(df, columns=categorical_cols, drop_first=False)
        dummy_columns = encoded_df.drop("Yield_tons_per_hectare", axis=1).columns.tolist()
        print("Successfully loaded data columns for encoding.")
    except Exception as e:
        print(f"Error loading data: {e}")

def get_model(model_name: str):
    if model_name not in models_cache:
        print(f"Lazy loading {model_name}.pkl into memory...")
        models_cache[model_name] = joblib.load(f"models/{model_name}.pkl")
    return models_cache[model_name]

def prepare_input(data: PredictionInput) -> pd.DataFrame:
    input_dict = data.dict()
    input_dict["Fertilizer_Used"] = 1 if data.Fertilizer_Used else 0
    input_dict["Irrigation_Used"] = 1 if data.Irrigation_Used else 0
    
    input_df = pd.DataFrame([input_dict])
    input_df_encoded = pd.get_dummies(input_df, columns=categorical_cols, drop_first=False)
    return input_df_encoded.reindex(columns=dummy_columns, fill_value=0)

@app.get("/options")
def get_options():
    df = pd.read_csv("data/crop_yield.csv")
    return {
        "regions": df["Region"].unique().tolist(),
        "soil_types": df["Soil_Type"].unique().tolist(),
        "crops": df["Crop"].unique().tolist(),
        "weather_conditions": df["Weather_Condition"].unique().tolist()
    }

@app.get("/eda")
def get_eda():
    df = pd.read_csv("data/crop_yield.csv")
    
    region_yield = df.groupby("Region")["Yield_tons_per_hectare"].mean().to_dict()
    crop_yield = df.groupby("Crop")["Yield_tons_per_hectare"].mean().to_dict()
    soil_yield = df.groupby("Soil_Type")["Yield_tons_per_hectare"].mean().to_dict()
    weather_yield = df.groupby("Weather_Condition")["Yield_tons_per_hectare"].mean().to_dict()
    
    return {
        "total_records": len(df),
        "region_yield": [{"name": k, "yield": round(v, 2)} for k, v in region_yield.items()],
        "crop_yield": [{"name": k, "yield": round(v, 2)} for k, v in crop_yield.items()],
        "soil_yield": [{"name": k, "yield": round(v, 2)} for k, v in soil_yield.items()],
        "weather_yield": [{"name": k, "yield": round(v, 2)} for k, v in weather_yield.items()],
        "numerical_stats": {
            "Rainfall (mm)": {"avg": round(df["Rainfall_mm"].mean(), 1), "min": round(df["Rainfall_mm"].min(), 1), "max": round(df["Rainfall_mm"].max(), 1)},
            "Temperature (°C)": {"avg": round(df["Temperature_Celsius"].mean(), 1), "min": round(df["Temperature_Celsius"].min(), 1), "max": round(df["Temperature_Celsius"].max(), 1)},
            "Days to Harvest": {"avg": round(df["Days_to_Harvest"].mean(), 1), "min": int(df["Days_to_Harvest"].min()), "max": int(df["Days_to_Harvest"].max())}
        },
        "features": list(df.columns)
    }

@app.get("/models_info")
def get_models_info():
    return [
        {"Model": "linear", "R2_Score": 0.9130, "MAE": 0.3995},
        {"Model": "ridge", "R2_Score": 0.9130, "MAE": 0.3995},
        {"Model": "decision_tree", "R2_Score": 0.8151, "MAE": 0.5834},
        {"Model": "random_forest", "R2_Score": 0.9076, "MAE": 0.4114},
        {"Model": "gradient_boosting", "R2_Score": 0.9124, "MAE": 0.4008},
        {"Model": "knn", "R2_Score": 0.6566, "MAE": 0.8043},
        {"Model": "xgboost", "R2_Score": 0.9123, "MAE": 0.4009}
    ]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Crop Yield Prediction API",
        "docs": "Navigate to http://localhost:8000/docs to test the API interactively!"
    }

@app.post("/predict")
def predict_yield(data: PredictionInput, model_name: ModelChoice = ModelChoice.xgboost):
    try:
        model = get_model(model_name.value)
        input_df_encoded = prepare_input(data)
        prediction = model.predict(input_df_encoded)[0]
        
        return {
            "model_used": model_name.value,
            "predicted_yield_tons_per_hectare": round(float(prediction), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

@app.post("/compare")
def compare_all_models(data: PredictionInput):
    input_df_encoded = prepare_input(data)
    results = {}
    
    for m in ModelChoice:
        try:
            model = get_model(m.value)
            prediction = model.predict(input_df_encoded)[0]
            results[m.value] = round(float(prediction), 2)
        except Exception as e:
            results[m.value] = f"Error: {str(e)}"
            
    return {
        "comparison": results
    }
