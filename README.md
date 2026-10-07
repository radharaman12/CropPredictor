# Crop Predictor

An Agriculture Crop Yield Prediction system consisting of a FastAPI backend and a web frontend. The system uses various machine learning models (Linear Regression, Ridge, Decision Tree, Random Forest, Gradient Boosting, KNN, XGBoost) to predict crop yields based on input parameters.

## Project Structure

- `main.py`: The FastAPI backend serving the machine learning models.
- `models/`: Contains the pre-trained machine learning models (e.g., joblib files).
- `data/`: Datasets used for training and testing the models.
- `notebooks/`: Jupyter notebooks used for data exploration, model training, and evaluation.
- `frontend/`: The frontend web application.
- `requirements.txt`: Python dependencies for the backend.

## Getting Started

### Backend (FastAPI)

1. **Install dependencies:**
   It is recommended to use a virtual environment.
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FastAPI server:**
   You can run the server using `uvicorn`:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.
   
   You can access the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.

### Frontend

Navigate to the `frontend/` directory and install the necessary dependencies (typically using `npm` or `yarn`), then start the development server.

```bash
cd frontend
npm install
npm start
```
*(Note: adjust commands based on the specific frontend framework used in this project)*

## Machine Learning Models

The API currently supports the following models for prediction:
- Linear Regression (`linear`)
- Ridge Regression (`ridge`)
- Decision Tree (`decision_tree`)
- Random Forest (`random_forest`)
- Gradient Boosting (`gradient_boosting`)
- K-Nearest Neighbors (`knn`)
- XGBoost (`xgboost`)

