"""
Machine Learning Pipeline for LearnAI — Learning Outcome Prediction System
Handles dataset loading, validation, preprocessing, model training, comparison,
evaluation (MAE, RMSE, R²), and persistent model serialization using joblib.
"""

import os
import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "student_data_train.csv"
MODEL_DIR = BASE_DIR / "ml" / "saved_models"
MODEL_PATH = MODEL_DIR / "learning_outcome_model.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

FEATURE_NAMES = [
    "study_hours_per_day",
    "attendance_percentage",
    "assignment_score",
    "previous_exam_marks"
]
TARGET_NAME = "final_exam_marks"


def validate_and_clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates data integrity, checks missing values, types, duplicates, and range boundaries.
    Ensures strict prevention of target leakage.
    """
    initial_len = len(df)

    # 1. Ensure required columns exist
    required_cols = FEATURE_NAMES + [TARGET_NAME]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    # 2. Check for and drop complete duplicates
    df = df.drop_duplicates()

    # 3. Handle missing values
    df = df.dropna(subset=required_cols)

    # 4. Cast and validate numeric constraints
    for col in required_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=required_cols)

    # 5. Domain boundary validation
    df = df[
        (df["study_hours_per_day"] >= 0.0) & (df["study_hours_per_day"] <= 24.0) &
        (df["attendance_percentage"] >= 0.0) & (df["attendance_percentage"] <= 100.0) &
        (df["assignment_score"] >= 0.0) & (df["assignment_score"] <= 100.0) &
        (df["previous_exam_marks"] >= 0.0) & (df["previous_exam_marks"] <= 100.0) &
        (df[TARGET_NAME] >= 0.0) & (df[TARGET_NAME] <= 100.0)
    ]

    cleaned_len = len(df)
    if cleaned_len < 30:
        raise ValueError(f"Insufficient valid data points for training: {cleaned_len} (minimum 30 required)")

    print(f"[ML Pipeline] Data validation complete. Rows: {initial_len} -> {cleaned_len} valid rows.")
    return df


def calculate_metrics(y_true, y_pred):
    """Calculates MAE, RMSE, and R² scores."""
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = float(r2_score(y_true, y_pred))
    return {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "r2_score": round(r2, 4)
    }


def train_and_evaluate_models(dataset_path: Path = None):
    """
    Executes the end-to-end model training, baseline comparison, and persistence workflow.
    """
    if dataset_path is None:
        dataset_path = DATASET_PATH

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Training dataset not found at {dataset_path}")

    df_raw = pd.read_csv(dataset_path)
    df = validate_and_clean_data(df_raw)

    X = df[FEATURE_NAMES]
    y = df[TARGET_NAME]

    # Split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    # 1. Baseline Model: Linear Regression Pipeline
    baseline_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LinearRegression())
    ])
    baseline_pipeline.fit(X_train, y_train)
    baseline_preds = baseline_pipeline.predict(X_test)
    baseline_metrics = calculate_metrics(y_test, baseline_preds)

    # 2. Complex Model: Random Forest Regressor Pipeline
    rf_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', RandomForestRegressor(
            n_estimators=120,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_preds = rf_pipeline.predict(X_test)
    rf_metrics = calculate_metrics(y_test, rf_preds)

    # 3. Model Selection based on objective metrics (higher R2, lower RMSE)
    if rf_metrics["r2_score"] >= baseline_metrics["r2_score"]:
        selected_name = "Random Forest Regressor"
        selected_pipeline = rf_pipeline
        selected_metrics = rf_metrics
        # Extract feature importances
        raw_rf = rf_pipeline.named_steps['model']
        importances = raw_rf.feature_importances_
    else:
        selected_name = "Linear Regression (Baseline)"
        selected_pipeline = baseline_pipeline
        selected_metrics = baseline_metrics
        # Linear regression coefficients magnitude as relative importance proxy
        raw_lr = baseline_pipeline.named_steps['model']
        coef_abs = np.abs(raw_lr.coef_)
        importances = coef_abs / np.sum(coef_abs)

    feature_importance_dict = {
        name: round(float(imp) * 100, 2)
        for name, imp in zip(FEATURE_NAMES, importances)
    }

    # 4. Serialize model and metadata
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(selected_pipeline, MODEL_PATH)

    metadata = {
        "selected_model": selected_name,
        "model_version": "RF-v1.2",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_path": str(dataset_path),
        "total_records": len(df),
        "train_records": len(X_train),
        "test_records": len(X_test),
        "features": FEATURE_NAMES,
        "target": TARGET_NAME,
        "baseline_comparison": {
            "model": "Linear Regression (Baseline)",
            "metrics": baseline_metrics
        },
        "complex_model": {
            "model": "Random Forest Regressor",
            "metrics": rf_metrics
        },
        "selected_metrics": selected_metrics,
        "feature_importances_pct": feature_importance_dict,
        "academic_disclaimer": (
            "Model trained on synthetic pedagogical dataset for college minor project demonstration. "
            "Real institutional deployment requires calibration on validated university records."
        )
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[ML Pipeline] Model training successful!")
    print(f"[ML Pipeline] Selected: {selected_name}")
    print(f"[ML Pipeline] Metrics -> MAE: {selected_metrics['mae']}, RMSE: {selected_metrics['rmse']}, R2: {selected_metrics['r2_score']}")
    print(f"[ML Pipeline] Saved to {MODEL_PATH}")

    return metadata


if __name__ == "__main__":
    train_and_evaluate_models()
