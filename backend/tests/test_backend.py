import json
from io import BytesIO
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from students.models import Student, get_performance_category
from predictions.models import Prediction
from ml.predictor import predict_learning_outcome, load_model_and_metadata


class StudentModelAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_payload = {
            "student_id": "STU-9901",
            "name": "Alex Johnson",
            "course": "Computer Science & Engineering",
            "study_hours_per_day": 4.5,
            "attendance_percentage": 88.0,
            "assignment_score": 82.5,
            "previous_exam_marks": 78.0,
            "final_exam_marks": 84.0
        }

    def test_student_creation_and_persistence(self):
        """Tests that a student can be created and saved in SQLite database."""
        response = self.client.post('/api/students/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Student.objects.filter(student_id="STU-9901").exists())

        student = Student.objects.get(student_id="STU-9901")
        self.assertEqual(student.name, "Alex Johnson")
        self.assertEqual(student.actual_category, "Good")

    def test_duplicate_student_id_prevention(self):
        """Verifies duplicate student IDs are rejected."""
        self.client.post('/api/students/', self.valid_payload, format='json')
        duplicate_response = self.client.post('/api/students/', self.valid_payload, format='json')
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student_id', duplicate_response.data)

    def test_invalid_numeric_ranges(self):
        """Tests that invalid ranges (e.g. attendance > 100 or negative study hours) are rejected."""
        invalid_payload = dict(self.valid_payload)
        invalid_payload["student_id"] = "STU-9902"
        invalid_payload["attendance_percentage"] = 145.0  # Invalid > 100

        response = self.client.post('/api/students/', invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        invalid_payload["attendance_percentage"] = 80.0
        invalid_payload["study_hours_per_day"] = -2.0  # Invalid < 0
        response2 = self.client.post('/api/students/', invalid_payload, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_update_and_delete(self):
        """Tests student editing and deletion after confirmation."""
        create_res = self.client.post('/api/students/', self.valid_payload, format='json')
        pk = create_res.data['id']

        # Update
        patch_res = self.client.patch(f'/api/students/{pk}/', {"attendance_percentage": 94.5}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['attendance_percentage'], 94.5)

        # Delete
        del_res = self.client.delete(f'/api/students/{pk}/')
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Student.objects.filter(pk=pk).exists())


class MLPredictionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            student_id="STU-9903",
            name="Priya Sharma",
            course="Data Science & AI",
            study_hours_per_day=5.0,
            attendance_percentage=90.0,
            assignment_score=85.0,
            previous_exam_marks=80.0,
            final_exam_marks=86.5
        )

    def test_ml_inference_and_category_mapping(self):
        """Tests that the ML pipeline returns valid bounded predictions and expected categories."""
        result = predict_learning_outcome(
            study_hours=5.0,
            attendance=90.0,
            assignment=85.0,
            previous_marks=80.0
        )
        self.assertIn('predicted_marks', result)
        self.assertGreaterEqual(result['predicted_marks'], 0.0)
        self.assertLessEqual(result['predicted_marks'], 100.0)
        self.assertIn(result['performance_category'], ['At Risk', 'Needs Improvement', 'Satisfactory', 'Good', 'Excellent'])
        self.assertIn('recommendations', result)

    def test_prediction_api_endpoint_persists_record(self):
        """Tests POST /api/predictions/predict/ persists prediction and links student."""
        payload = {
            "student_id": self.student.student_id,
            "study_hours": 5.0,
            "attendance": 90.0,
            "assignment": 85.0,
            "previous_marks": 80.0,
            "save_record": True
        }
        res = self.client.post('/api/predictions/predict/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['student_id'], "STU-9903")
        self.assertIsNotNone(res.data['actual_final_marks'])
        self.assertIsNotNone(res.data['variance'])

        # Verify DB persistence
        self.assertTrue(Prediction.objects.filter(student=self.student).exists())

    def test_prediction_api_invalid_input(self):
        """Tests that non-numeric or missing inputs return 400."""
        payload = {
            "study_hours": "abc",  # Invalid
            "attendance": 90.0,
            "assignment": 85.0,
            "previous_marks": 80.0
        }
        res = self.client.post('/api/predictions/predict/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class CSVImportExportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            student_id="STU-EXP-1",
            name="Export Test Student",
            course="Information Technology",
            study_hours_per_day=3.5,
            attendance_percentage=78.0,
            assignment_score=72.0,
            previous_exam_marks=68.0,
            final_exam_marks=74.0
        )

    def test_student_csv_export(self):
        """Tests that CSV export returns 200 with proper headers and content."""
        res = self.client.get('/api/students/export-csv/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv; charset=utf-8')
        self.assertIn('attachment; filename="learnai_students_', res['Content-Disposition'])
        content = res.content.decode('utf-8')
        self.assertIn('STU-EXP-1', content)
        self.assertIn('Export Test Student', content)

    def test_student_csv_import_valid_and_invalid_rows(self):
        """Tests CSV import with successful rows and rejected invalid rows."""
        csv_data = (
            "student_id,name,course,study_hours_per_day,attendance_percentage,assignment_score,previous_exam_marks,final_exam_marks\n"
            "STU-IMP-1,Valid Import 1,Computer Science,4.0,85.0,80.0,75.0,78.0\n"
            "STU-IMP-2,Valid Import 2,Information Technology,3.0,70.0,65.0,60.0,\n"
            "STU-EXP-1,Duplicate Student,Computer Science,5.0,90.0,90.0,90.0,90.0\n"  # Duplicate ID
            "STU-IMP-3,Bad Attendance,Data Science,2.0,150.0,60.0,60.0,60.0\n"       # Invalid Attendance > 100
        )
        file_obj = BytesIO(csv_data.encode('utf-8'))
        file_obj.name = "import_test.csv"

        res = self.client.post('/api/students/import-csv/', {'file': file_obj}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['total_rows'], 4)
        self.assertEqual(res.data['imported_count'], 2)
        self.assertEqual(res.data['rejected_count'], 2)

        # Confirm STU-IMP-1 exists in DB
        self.assertTrue(Student.objects.filter(student_id="STU-IMP-1").exists())


class DashboardAnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Student.objects.create(
            student_id="STU-DASH-1",
            name="Dash Student",
            course="Electronics & Communication",
            study_hours_per_day=4.0,
            attendance_percentage=80.0,
            assignment_score=75.0,
            previous_exam_marks=70.0,
            final_exam_marks=75.0
        )

    def test_dashboard_stats_endpoint(self):
        """Tests that dashboard endpoint returns aggregations from database records."""
        res = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['has_data'])
        self.assertEqual(res.data['total_students'], 1)
        self.assertEqual(res.data['avg_actual_marks'], 75.0)
        self.assertEqual(res.data['course_summary'][0]['course'], "Electronics & Communication")
