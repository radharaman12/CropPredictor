import streamlit as st
import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

# =========================
# CONFIG
# =========================
st.set_page_config(page_title="Smart Crop Yield App", page_icon="🌾", layout="wide")

# =========================
# CACHED DATA LOADING
# =========================
@st.cache_data
def load_data():
    df = pd.read_csv("../data/crop_yield.csv")
    return df

@st.cache_data
def get_encoded_columns(df):
    categorical_cols = ["Region", "Soil_Type", "Crop", "Weather_Condition"]
    encoded_df = pd.get_dummies(df, columns=categorical_cols, drop_first=False)
    X = encoded_df.drop("Yield_tons_per_hectare", axis=1)
    return categorical_cols, X.columns

# Load Data
try:
    df = load_data()
    categorical_cols, columns = get_encoded_columns(df)
except FileNotFoundError:
    st.error("Dataset 'crop_yield.csv' not found. Please ensure it's in the same directory.")
    st.stop()

# =========================
# SIDEBAR
# =========================
st.sidebar.title("🌾 Crop Yield Dashboard")
st.sidebar.info("Analyze agricultural data and predict crop yields using machine learning.")
st.sidebar.markdown("---")

# =========================
# MAIN APP
# =========================
st.title("🌾 Smart Crop Yield Prediction")

tab1, tab2, tab3 = st.tabs(["📊 Data Exploration (EDA)", "🤖 Model Evaluation", "🚜 Yield Prediction"])

# =========================
# 📊 EDA TAB
# =========================
with tab1:
    st.header("Interactive Data Exploration")
    
    # Interactive Filters in columns
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        selected_regions = st.multiselect("Filter by Region", options=df["Region"].unique(), default=df["Region"].unique())
    with col_f2:
        selected_crops = st.multiselect("Filter by Crop", options=df["Crop"].unique(), default=df["Crop"].unique())
        
    filtered_df = df[(df["Region"].isin(selected_regions)) & (df["Crop"].isin(selected_crops))]
    
    if filtered_df.empty:
        st.warning("No data available for the selected filters.")
    else:
        st.write(f"**Showing {len(filtered_df)} records based on filters:**")
        st.dataframe(filtered_df.head(100), use_container_width=True)

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("Yield Distribution")
            fig, ax = plt.subplots()
            sns.histplot(filtered_df['Yield_tons_per_hectare'], bins=30, kde=True, color='green', ax=ax)
            st.pyplot(fig)

        with col2:
            st.subheader("Numeric Feature Correlation")
            fig, ax = plt.subplots()
            corr = filtered_df.select_dtypes(include=['float64', 'int64']).corr()
            sns.heatmap(corr, annot=True, cmap="Greens", ax=ax, fmt=".2f")
            st.pyplot(fig)

        st.subheader("Average Yield by Region & Crop")
        c1, c2 = st.columns(2)
        with c1:
            region_data = filtered_df.groupby("Region")["Yield_tons_per_hectare"].mean()
            st.bar_chart(region_data, color="#0288d1")
        with c2:
            crop_data = filtered_df.groupby("Crop")["Yield_tons_per_hectare"].mean()
            st.bar_chart(crop_data, color="#2e7d32")

# =========================
# 🤖 MODEL TAB
# =========================
with tab2:
    st.header("Model Performance Leaderboard")

    if os.path.exists("../models/model_comparison.csv"):
        results_df = pd.read_csv("../models/model_comparison.csv")
        results_df = results_df.sort_values(by="R2 Score", ascending=False)
        results_df.set_index("Model", inplace=True)

        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.subheader("Metrics Table")
            st.dataframe(results_df.style.highlight_max(subset=['R2 Score'], color='#81c784'), use_container_width=True)
            best_model = results_df.index[0]
            st.success(f"🏆 Top Performing Model: **{best_model}**")

        with col2:
            st.subheader("R² Score Comparison (Higher is Better)")
            st.bar_chart(results_df["R2 Score"], color="#2e7d32")
            
    else:
        st.warning("Run the training script first to generate `model_comparison.csv`")

# =========================
# 🌾 PREDICTION TAB
# =========================
with tab3:
    st.header("Simulate & Predict Yield")

    with st.form("prediction_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            region = st.selectbox("Region", df["Region"].unique())
            soil = st.selectbox("Soil Type", df["Soil_Type"].unique())
            crop = st.selectbox("Crop", df["Crop"].unique())
            
        with col2:
            weather = st.selectbox("Weather Condition", df["Weather_Condition"].unique())
            fert = st.selectbox("Fertilizer Used", ["Yes", "No"])
            irr = st.selectbox("Irrigation Used", ["Yes", "No"])
            
        with col3:
            rainfall = st.slider("Rainfall (mm)", int(df["Rainfall_mm"].min()), int(df["Rainfall_mm"].max()), int(df["Rainfall_mm"].mean()))
            temp = st.slider("Temperature (°C)", int(df["Temperature_Celsius"].min()), int(df["Temperature_Celsius"].max()), int(df["Temperature_Celsius"].mean()))
            days = st.slider("Days to Harvest", int(df["Days_to_Harvest"].min()), int(df["Days_to_Harvest"].max()), int(df["Days_to_Harvest"].mean()))

        st.markdown("---")
        
        model_option = st.radio("Prediction Mode", ["Use Best Model", "Compare All Models"], horizontal=True)

        models = ["linear", "ridge", "decision_tree", "random_forest", "gradient_boosting", "knn", "xgboost"]
        
        if os.path.exists("../models/model_comparison.csv"):
            best_model_name = pd.read_csv("../models/model_comparison.csv").sort_values(by="R2 Score", ascending=False).iloc[0]["Model"]
        else:
            best_model_name = "random_forest"
            
        submitted = st.form_submit_button("Predict Yield 🚀")

    if submitted:
        input_df = pd.DataFrame([{
            "Region": region,
            "Soil_Type": soil,
            "Crop": crop,
            "Weather_Condition": weather,
            "Rainfall_mm": rainfall,
            "Temperature_Celsius": temp,
            "Fertilizer_Used": 1 if fert == "Yes" else 0,
            "Irrigation_Used": 1 if irr == "Yes" else 0,
            "Days_to_Harvest": days,
        }])

        input_df_encoded = pd.get_dummies(input_df, columns=categorical_cols, drop_first=False)
        input_df_encoded = input_df_encoded.reindex(columns=columns, fill_value=0)

        st.subheader("Prediction Results")

        if model_option == "Use Best Model":
            try:
                model = joblib.load(f"../models/{best_model_name}.pkl")
                pred = model.predict(input_df_encoded)[0]
                
                col_res1, col_res2 = st.columns([1, 2])
                with col_res1:
                    st.metric(label=f"{best_model_name} Prediction", value=f"{pred:.2f} tons/ha")
                with col_res2:
                    st.progress(min(pred / df['Yield_tons_per_hectare'].max(), 1.0))
                
            except Exception as e:
                st.error(f"Error loading model {best_model_name}.pkl: {e}")

        else:
            results = {}
            for m in models:
                try:
                    model = joblib.load(f"../models/{m}.pkl")
                    pred = model.predict(input_df_encoded)[0]
                    results[m] = round(pred, 2)
                except Exception:
                    pass
                    
            if results:
                results_df = pd.DataFrame(list(results.items()), columns=["Model", "Prediction"]).set_index("Model")
                results_df = results_df.sort_values(by="Prediction", ascending=False)
                
                col_res1, col_res2 = st.columns([1, 2])
                with col_res1:
                    st.dataframe(results_df, use_container_width=True)
                with col_res2:
                    st.bar_chart(results_df, color="#2e7d32")
            else:
                st.error("No trained models found.")
