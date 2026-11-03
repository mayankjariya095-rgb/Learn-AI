"""
Database Seeding Utility for LearnAI
Populates SQLite with initial realistic student records and historical predictions
so the system is immediately ready for faculty evaluation and demonstration.
"""

import os
import sys
import csv
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from students.models import Student
from predictions.models import Prediction
from ml.predictor import predict_learning_outcome


def seed_database(limit=60):
    csv_path = BASE_DIR / "dataset" / "student_data_train.csv"
    if not csv_path.exists():
        print(f"[Seed] Error: Dataset file not found at {csv_path}")
        return

    print(f"[Seed] Seeding database from {csv_path}...")

    # Clear existing demo records to ensure clean state
    Student.objects.all().delete()
    Prediction.objects.all().delete()

    created_students = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= limit:
                break

            # Let 60% of students have final_exam_marks, 40% awaiting final evaluation
            has_final_marks = (i % 5 != 0 and i % 5 != 2)
            final_marks = float(row["final_exam_marks"]) if has_final_marks else None

            student = Student.objects.create(
                student_id=row["student_id"],
                name=row["name"],
                course=row["course"],
                study_hours_per_day=float(row["study_hours_per_day"]),
                attendance_percentage=float(row["attendance_percentage"]),
                assignment_score=float(row["assignment_score"]),
                previous_exam_marks=float(row["previous_exam_marks"]),
                final_exam_marks=final_marks
            )
            created_students.append(student)

    print(f"[Seed] Successfully populated {len(created_students)} student profiles into SQLite.")

    # Generate initial predictions for the first 25 students using actual ML inference
    predictions_created = 0
    for s in created_students[:25]:
        result = predict_learning_outcome(
            study_hours=s.study_hours_per_day,
            attendance=s.attendance_percentage,
            assignment=s.assignment_score,
            previous_marks=s.previous_exam_marks
        )
        Prediction.objects.create(
            student=s,
            student_id_snapshot=s.student_id,
            student_name_snapshot=s.name,
            study_hours=s.study_hours_per_day,
            attendance_percentage=s.attendance_percentage,
            assignment_score=s.assignment_score,
            previous_exam_marks=s.previous_exam_marks,
            predicted_marks=result["predicted_marks"],
            performance_category=result["performance_category"],
            model_version=result["model_version"],
            risk_factors=result["risk_factors"],
            recommendations=result["recommendations"]
        )
        predictions_created += 1

    print(f"[Seed] Generated {predictions_created} real ML predictions in database.")
    print("[Seed] Database preparation complete!")


if __name__ == "__main__":
    seed_database()
