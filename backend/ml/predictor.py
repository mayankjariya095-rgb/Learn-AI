"""
Inference engine and prediction service for LearnAI.
Provides cached model loading, input validation, safe execution,
category classification, risk factor detection, and faculty intervention suggestions.
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from ml.pipeline import (
    MODEL_PATH,
    METADATA_PATH,
    FEATURE_NAMES,
    train_and_evaluate_models
)
from students.models import get_performance_category

_CACHED_MODEL = None
_CACHED_METADATA = None


def load_model_and_metadata(force_reload: bool = False):
    """
    Loads and caches the trained ML pipeline and metadata in memory.
    If the model does not exist on disk, trains it automatically.
    """
    global _CACHED_MODEL, _CACHED_METADATA

    if force_reload or _CACHED_MODEL is None:
        if not MODEL_PATH.exists():
            print("[Predictor] Model file not found. Running initial training pipeline...")
            train_and_evaluate_models()

        _CACHED_MODEL = joblib.load(MODEL_PATH)

        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _CACHED_METADATA = json.load(f)
        else:
            _CACHED_METADATA = {
                "selected_model": "Loaded Model",
                "model_version": "v1.0"
            }

    return _CACHED_MODEL, _CACHED_METADATA


def analyze_risk_factors_and_recommendations(study_hours, attendance, assignment, previous_marks, predicted_score):
    """
    Analyzes student inputs and identifies academic vulnerabilities with actionable faculty interventions.
    """
    risk_factors = []
    recommendations = []

    # 1. Attendance analysis
    if attendance < 60.0:
        risk_factors.append(f"Severe attendance deficiency: {attendance:.1f}% (Minimum threshold is 75%)")
        recommendations.append("Issue formal attendance advisory and initiate academic counselor check-in.")
    elif attendance < 75.0:
        risk_factors.append(f"Borderline attendance: {attendance:.1f}% (Risk of semester debarment)")
        recommendations.append("Advise student on mandatory attendance requirements to regain eligibility.")

    # 2. Daily Study Hours
    if study_hours < 2.0:
        risk_factors.append(f"Low dedicated study time: {study_hours:.1f} hrs/day")
        recommendations.append("Recommend structured time-management schedule and library study blocks.")
    elif study_hours > 10.0:
        risk_factors.append(f"Unusually high study hours ({study_hours:.1f} hrs/day) may indicate study burnout or inefficient prep.")
        recommendations.append("Review study methodologies and recommend active recall techniques.")

    # 3. Continuous Assignments
    if assignment < 50.0:
        risk_factors.append(f"Critical coursework deficit: {assignment:.1f}% assignment score")
        recommendations.append("Enroll in faculty-led remedial problem-solving sessions and offer assignment revision.")
    elif assignment < 65.0:
        risk_factors.append(f"Average assignment marks: {assignment:.1f}%")
        recommendations.append("Encourage peer-study groups and lab practice sessions.")

    # 4. Previous Examination Score
    if previous_marks < 40.0:
        risk_factors.append(f"Foundational subject failure in previous examination: {previous_marks:.1f}%")
        recommendations.append("Provide foundational bridge course notes and one-on-one tutorial support.")
    elif previous_marks < 60.0:
        risk_factors.append(f"Historical academic vulnerability: {previous_marks:.1f}% in previous term")
        recommendations.append("Schedule periodic diagnostic tests to gauge concept retention.")

    # Overall recommendation if predicted score is high
    if predicted_score >= 80.0 and not risk_factors:
        recommendations.append("Student exhibits high academic potential. Encourage advanced projects or competitive challenges.")

    if not recommendations:
        recommendations.append("Maintain steady study rhythm and continue regular coursework submissions.")

    return risk_factors, recommendations


def predict_learning_outcome(
    study_hours: float,
    attendance: float,
    assignment: float,
    previous_marks: float
) -> dict:
    """
    Validates input parameters, invokes ML pipeline inference, calculates metrics,
    and returns comprehensive prediction result.
    """
    # 1. Type conversion & range validation
    try:
        study_hours = float(study_hours)
        attendance = float(attendance)
        assignment = float(assignment)
        previous_marks = float(previous_marks)
    except (TypeError, ValueError) as e:
        raise ValueError("All input features must be valid numerical values.") from e

    errors = {}
    if not (0.0 <= study_hours <= 24.0):
        errors['study_hours'] = "Study hours must be between 0.0 and 24.0 hours per day."
    if not (0.0 <= attendance <= 100.0):
        errors['attendance'] = "Attendance must be between 0.0% and 100.0%."
    if not (0.0 <= assignment <= 100.0):
        errors['assignment'] = "Assignment score must be between 0.0 and 100.0."
    if not (0.0 <= previous_marks <= 100.0):
        errors['previous_marks'] = "Previous exam marks must be between 0.0 and 100.0."

    if errors:
        raise ValueError(errors)

    # 2. Load model
    model, metadata = load_model_and_metadata()

    # 3. Create single-row DataFrame with correct column names (prevents sklearn feature name mismatch)
    input_data = pd.DataFrame([{
        "study_hours_per_day": study_hours,
        "attendance_percentage": attendance,
        "assignment_score": assignment,
        "previous_exam_marks": previous_marks
    }])[FEATURE_NAMES]

    # 4. Model inference
    raw_pred = model.predict(input_data)[0]

    # 5. Clamp strictly between 0 and 100
    predicted_marks = round(max(0.0, min(100.0, float(raw_pred))), 1)

    # 6. Performance band
    category = get_performance_category(predicted_marks)

    # 7. Qualitative explanations and risk interventions
    risk_factors, recommendations = analyze_risk_factors_and_recommendations(
        study_hours, attendance, assignment, previous_marks, predicted_marks
    )

    # 8. Feature contribution / breakdown
    feature_breakdown = {
        "study_hours_per_day": {
            "value": study_hours,
            "benchmark": "4.0 hrs/day",
            "status": "Adequate" if study_hours >= 3.5 else "Low"
        },
        "attendance_percentage": {
            "value": attendance,
            "benchmark": "75.0%",
            "status": "Safe" if attendance >= 75.0 else "Critical"
        },
        "assignment_score": {
            "value": assignment,
            "benchmark": "65.0",
            "status": "Good" if assignment >= 70.0 else "Needs Attention"
        },
        "previous_exam_marks": {
            "value": previous_marks,
            "benchmark": "60.0",
            "status": "Strong" if previous_marks >= 70.0 else "Vulnerable"
        }
    }

    return {
        "predicted_marks": predicted_marks,
        "performance_category": category,
        "model_version": metadata.get("model_version", "RF-v1.2"),
        "model_name": metadata.get("selected_model", "Predictor Model"),
        "input_features": {
            "study_hours": study_hours,
            "attendance_percentage": attendance,
            "assignment_score": assignment,
            "previous_exam_marks": previous_marks
        },
        "feature_breakdown": feature_breakdown,
        "risk_factors": risk_factors,
        "recommendations": recommendations,
        "disclaimer": (
            "Project-defined prediction for faculty decision support. "
            "Categories are project benchmarks, not official board certification."
        )
    }
