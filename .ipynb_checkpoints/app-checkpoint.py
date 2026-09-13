import streamlit as st
import pandas as pd
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

# =========================
# CONFIG
# =========================
st.set_page_config(page_title="Crop Yield App", layout="wide")

st.title("🌾 Smart Crop Yield Prediction Dashboard")

# =========================
# LOAD DATA
# =========================
df = pd.read_csv("crop_yield.csv")

# Get training columns
X = df.drop("Yield_tons_per_hectare", axis=1)
columns = X.columns

# =========================
# TABS
# =========================
tab1, tab2, tab3 = st.tabs(["📊 EDA", "🤖 Models", "🌾 Prediction"])

# =========================
# 📊 EDA TAB
# =========================
with tab1:

    st.subheader("Dataset Preview")
    st.dataframe(df.head())

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Yield Distribution")
        fig, ax = plt.subplots()
        ax.hist(df['Yield_tons_per_hectare'], bins=30)
        st.pyplot(fig)

    with col2:
        st.subheader("Correlation Heatmap")
        fig, ax = plt.subplots()
        sns.heatmap(df.corr(numeric_only=True), annot=True, ax=ax)
        st.pyplot(fig)

    st.subheader("Region vs Yield")
    region_data = df.groupby("Region")["Yield_tons_per_hectare"].mean()
    st.bar_chart(region_data)

# =========================
# 🤖 MODEL TAB
# =========================
with tab2:

    st.subheader("Model Performance")

    if os.path.exists("model_comparison.csv"):
        results_df = pd.read_csv("model_comparison.csv")
        results_df = results_df.sort_values(by="R2 Score", ascending=False)

        st.dataframe(results_df)

        best_model = results_df.iloc[0]["Model"]
        st.success(f"🏆 Best Model: {best_model}")

        st.bar_chart(results_df.set_index("Model")["R2 Score"])

    else:
        st.warning("Run training code first to generate model_comparison.csv")

# =========================
# 🌾 PREDICTION TAB
# =========================
with tab3:

    st.subheader("🌾 Smart Prediction")

    col1, col2 = st.columns(2)

    # Inputs
    with col1:
        region = st.selectbox("Region", ["North", "South", "West", "East"])
        soil = st.selectbox("Soil Type", ["Clay", "Loam", "Sandy", "Silt", "Peaty"])
        crop = st.selectbox("Crop", ["Wheat", "Rice", "Maize", "Cotton", "Soybean"])
        weather = st.selectbox("Weather", ["Sunny", "Rainy"])

    with col2:
        fert = st.selectbox("Fertilizer Used", ["Yes", "No"])
        irr = st.selectbox("Irrigation Used", ["Yes", "No"])
        rainfall = st.slider("Rainfall (mm)", 0, 1000, 100)
        temp = st.slider("Temperature (°C)", 0, 50, 25)
        days = st.slider("Days to Harvest", 50, 200, 100)

    # Model options
    model_option = st.radio("Prediction Mode", ["Single Model", "All Models"])

    models = ["linear", "ridge", "decision_tree", "random_forest",
              "gradient_boosting", "knn", "xgboost"]

    selected_model = st.selectbox("Select Model", models)

    # =========================
    # PREDICT BUTTON
    # =========================
    if st.button("Predict 🚀"):

        # Create empty row
        input_df = pd.DataFrame(columns=columns)
        input_df.loc[0] = 0

        # Numeric features
        input_df["Rainfall_mm"] = rainfall
        input_df["Temperature_Celsius"] = temp
        input_df["Days_to_Harvest"] = days

        input_df["Fertilizer_Used"] = 1 if fert == "Yes" else 0
        input_df["Irrigation_Used"] = 1 if irr == "Yes" else 0

        # Safe encoding
        def set_one_hot(prefix, value):
            col_name = f"{prefix}_{value}"
            if col_name in input_df.columns:
                input_df[col_name] = 1

        set_one_hot("Region", region)
        set_one_hot("Soil_Type", soil)
        set_one_hot("Crop", crop)
        set_one_hot("Weather_Condition", weather)

        # 🔥 CRITICAL FIX
        input_df = input_df.drop(
            columns=["Region", "Soil_Type", "Crop", "Weather_Condition"],
            errors="ignore"
        )

        # 🔥 ALIGN COLUMNS (MOST IMPORTANT)
        input_df = input_df.reindex(columns=columns, fill_value=0)

        # =========================
        # PREDICTION
        # =========================
        if model_option == "Single Model":

            model = joblib.load(f"{selected_model}.pkl")
            pred = model.predict(input_df)[0]

            st.success(f"{selected_model} Prediction: {pred:.2f} tons/hectare")

        else:
            results = {}

            for m in models:
                model = joblib.load(f"{m}.pkl")
                pred = model.predict(input_df)[0]
                results[m] = round(pred, 2)

            results_df = pd.DataFrame(list(results.items()), columns=["Model", "Prediction"])

            st.subheader("📊 Predictions")
            st.dataframe(results_df)
            st.bar_chart(results_df.set_index("Model"))

            best = results_df.loc[results_df["Prediction"].idxmax()]
            st.success(f"🏆 Best Model: {best['Model']} → {best['Prediction']}")

        # Debug (optional)
        with st.expander("🔍 Show Encoded Input"):
            st.dataframe(input_df)