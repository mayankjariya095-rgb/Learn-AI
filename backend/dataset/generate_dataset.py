"""
Dataset Generator for LearnAI — Learning Outcome Prediction System
Generates a representative synthetic academic training dataset (student_data_train.csv)
with realistic pedagogical correlations, variance, and diverse student academic profiles.

DISCLAIMER:
This dataset is synthetic and created strictly for development, demonstration, and college
minor project evaluation. Meaningful real-world deployment requires validated institutional records.
"""

import os
import csv
import random
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

COURSES = [
    "Computer Science & Engineering",
    "Information Technology",
    "Data Science & AI",
    "Electronics & Communication",
    "Electrical Engineering",
]

def generate_synthetic_dataset(num_records=750, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    first_names = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna",
        "Ishaan", "Shaurya", "Atharva", "Dhruv", "Kabir", "Rohan", "Ananya", "Diya", "Isha",
        "Aadhya", "Pari", "Saanvi", "Kiara", "Myra", "Riya", "Avani", "Navya", "Meera",
        "Sneha", "Tanvi", "Pooja", "Vikram", "Neha", "Rahul", "Priya", "Amit", "Kavya",
        "Manish", "Shreya", "Kunal", "Divya", "Suresh", "Swati", "Nikhil", "Simran", "Alok"
    ]
    last_names = [
        "Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Mehta", "Joshi", "Patel",
        "Reddy", "Nair", "Rao", "Chopra", "Singhania", "Kapoor", "Agarwal", "Bansal", "Trivedi",
        "Mishra", "Pandey", "Yadav", "Kumar", "Singh", "Das", "Mukherjee", "Chatterjee", "Sen"
    ]

    records = []
    used_ids = set()

    for i in range(1, num_records + 1):
        # Generate unique Student ID: STU-2024-XXXX
        student_id = f"STU-2024-{i:04d}"
        used_ids.add(student_id)

        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        course = random.choice(COURSES)

        # Diverse student profiles:
        # Profile types: 0: Struggling, 1: Average, 2: Hardworking/Improving, 3: High Performer, 4: Inconsistent
        profile = random.choices([0, 1, 2, 3, 4], weights=[0.18, 0.40, 0.18, 0.18, 0.06])[0]

        if profile == 0:  # Struggling
            study_hours = round(np.random.uniform(0.5, 2.5), 1)
            attendance = round(np.random.uniform(35.0, 68.0), 1)
            assignment = round(np.random.uniform(30.0, 58.0), 1)
            previous_marks = round(np.random.uniform(28.0, 52.0), 1)
            noise = np.random.normal(0, 4.0)
        elif profile == 1:  # Average
            study_hours = round(np.random.uniform(2.5, 4.5), 1)
            attendance = round(np.random.uniform(65.0, 82.0), 1)
            assignment = round(np.random.uniform(55.0, 75.0), 1)
            previous_marks = round(np.random.uniform(52.0, 72.0), 1)
            noise = np.random.normal(0, 3.5)
        elif profile == 2:  # Hardworking / Improving
            study_hours = round(np.random.uniform(4.0, 7.5), 1)
            attendance = round(np.random.uniform(80.0, 96.0), 1)
            assignment = round(np.random.uniform(70.0, 88.0), 1)
            previous_marks = round(np.random.uniform(58.0, 78.0), 1)
            noise = np.random.normal(2.0, 3.0)  # positive boost
        elif profile == 3:  # High Performer
            study_hours = round(np.random.uniform(5.0, 9.0), 1)
            attendance = round(np.random.uniform(85.0, 98.5), 1)
            assignment = round(np.random.uniform(82.0, 98.0), 1)
            previous_marks = round(np.random.uniform(80.0, 97.0), 1)
            noise = np.random.normal(1.5, 2.5)
        else:  # Inconsistent (e.g. good previous marks but poor attendance/study hours)
            study_hours = round(np.random.uniform(1.0, 3.0), 1)
            attendance = round(np.random.uniform(45.0, 65.0), 1)
            assignment = round(np.random.uniform(50.0, 70.0), 1)
            previous_marks = round(np.random.uniform(65.0, 85.0), 1)
            noise = np.random.normal(-3.0, 4.0)

        # Pedagogical formula for realistic target outcome (0-100 scale)
        # Weights: Previous Exam: 38%, Assignment: 25%, Attendance: 20%, Study Hours: 17% (scaled to 100)
        study_hours_scaled = min(study_hours * 10.0, 100.0)
        calculated_marks = (
            (previous_marks * 0.38) +
            (assignment * 0.25) +
            (attendance * 0.20) +
            (study_hours_scaled * 0.17) +
            noise
        )

        final_exam_marks = round(max(10.0, min(100.0, calculated_marks)), 1)

        records.append({
            "student_id": student_id,
            "name": name,
            "course": course,
            "study_hours_per_day": study_hours,
            "attendance_percentage": attendance,
            "assignment_score": assignment,
            "previous_exam_marks": previous_marks,
            "final_exam_marks": final_exam_marks
        })

    output_csv = BASE_DIR / "student_data_train.csv"
    fieldnames = [
        "student_id", "name", "course", "study_hours_per_day",
        "attendance_percentage", "assignment_score", "previous_exam_marks", "final_exam_marks"
    ]

    with open(output_csv, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"[Dataset Generator] Successfully generated {len(records)} realistic training records.")
    print(f"[Dataset Generator] Saved to: {output_csv}")
    return output_csv

if __name__ == "__main__":
    generate_synthetic_dataset()
