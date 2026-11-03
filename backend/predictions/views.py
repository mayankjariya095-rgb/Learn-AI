import csv
from datetime import datetime, timezone
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, views, generics
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Prediction
from .serializers import PredictionSerializer
from students.models import Student
from ml.predictor import predict_learning_outcome


class StandardPredictionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PredictOutcomeView(views.APIView):
    """
    Core ML Prediction Endpoint:
    Accepts student features, generates ML prediction, saves record to DB,
    and returns predictions, performance category, risk factors, and actionable interventions.
    """
    def post(self, request):
        data = request.data

        # 1. Extract inputs
        student_ref = data.get('student_id') or data.get('student_pk')
        try:
            study_hours = data.get('study_hours_per_day', data.get('study_hours'))
            attendance = data.get('attendance_percentage', data.get('attendance'))
            assignment = data.get('assignment_score', data.get('assignment'))
            previous_marks = data.get('previous_exam_marks', data.get('previous_marks'))

            if any(v is None or v == '' for v in [study_hours, attendance, assignment, previous_marks]):
                return Response(
                    {"error": "All 4 feature values (study_hours, attendance, assignment, previous_marks) are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            study_hours = float(study_hours)
            attendance = float(attendance)
            assignment = float(assignment)
            previous_marks = float(previous_marks)
        except (ValueError, TypeError) as e:
            return Response(
                {"error": "Features must be valid numerical values.", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Execute ML Pipeline Inference
        try:
            result = predict_learning_outcome(
                study_hours=study_hours,
                attendance=attendance,
                assignment=assignment,
                previous_marks=previous_marks
            )
        except ValueError as e:
            return Response({"error": "Invalid input values", "details": e.args[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "Prediction pipeline failure", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Lookup student if reference provided
        student = None
        student_id_str = ""
        student_name_str = ""
        if student_ref:
            # Check by primary key or string student_id
            if isinstance(student_ref, int) or (isinstance(student_ref, str) and student_ref.isdigit()):
                student = Student.objects.filter(pk=int(student_ref)).first()
            if not student:
                student = Student.objects.filter(student_id__iexact=str(student_ref)).first()

            if student:
                student_id_str = student.student_id
                student_name_str = student.name
            else:
                student_id_str = str(student_ref)

        # 4. Save Prediction record persistently in database
        save_record = data.get('save_record', True)
        saved_prediction = None
        if save_record:
            saved_prediction = Prediction.objects.create(
                student=student,
                student_id_snapshot=student_id_str,
                student_name_snapshot=student_name_str,
                study_hours=study_hours,
                attendance_percentage=attendance,
                assignment_score=assignment,
                previous_exam_marks=previous_marks,
                predicted_marks=result["predicted_marks"],
                performance_category=result["performance_category"],
                model_version=result["model_version"],
                risk_factors=result["risk_factors"],
                recommendations=result["recommendations"]
            )

        # 5. Attach student comparison details if actual final exam marks exist
        actual_final_marks = None
        variance = None
        if student and student.final_exam_marks is not None:
            actual_final_marks = student.final_exam_marks
            variance = round(result["predicted_marks"] - actual_final_marks, 2)

        return Response({
            "success": True,
            "prediction_id": saved_prediction.id if saved_prediction else None,
            "student_id": student_id_str or None,
            "student_name": student_name_str or None,
            "predicted_marks": result["predicted_marks"],
            "performance_category": result["performance_category"],
            "model_version": result["model_version"],
            "model_name": result["model_name"],
            "input_features": result["input_features"],
            "feature_breakdown": result["feature_breakdown"],
            "risk_factors": result["risk_factors"],
            "recommendations": result["recommendations"],
            "actual_final_marks": actual_final_marks,
            "variance": variance,
            "disclaimer": result["disclaimer"]
        }, status=status.HTTP_201_CREATED if saved_prediction else status.HTTP_200_OK)


class PredictionHistoryListView(generics.ListAPIView):
    """
    Returns historical predictions with filtering and pagination.
    """
    serializer_class = PredictionSerializer
    pagination_class = StandardPredictionPagination

    def get_queryset(self):
        qs = Prediction.objects.all().order_by('-created_at')

        student_id = self.request.query_params.get('student_id', '').strip()
        if student_id:
            qs = qs.filter(student_id_snapshot__icontains=student_id)

        category = self.request.query_params.get('category', '').strip()
        if category:
            qs = qs.filter(performance_category__iexact=category)

        return qs


class PredictionHistoryDetailView(generics.RetrieveDestroyAPIView):
    """
    Retrieves or deletes a single historical prediction.
    """
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer


class PredictionExportCSVView(views.APIView):
    """
    Exports prediction historical audits to a CSV file.
    """
    def get(self, request):
        qs = Prediction.objects.all().order_by('-created_at')

        student_id = request.query_params.get('student_id', '').strip()
        if student_id:
            qs = qs.filter(student_id_snapshot__icontains=student_id)

        category = request.query_params.get('category', '').strip()
        if category:
            qs = qs.filter(performance_category__iexact=category)

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"learnai_predictions_{timestamp}.csv"

        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        writer.writerow([
            'Prediction ID',
            'Student ID',
            'Student Name',
            'Study Hours Per Day',
            'Attendance (%)',
            'Assignment Score',
            'Previous Exam Marks',
            'Predicted Marks',
            'Performance Category',
            'Actual Final Marks',
            'Variance (Pred - Actual)',
            'Model Version',
            'Date Created',
        ])

        for p in qs:
            actual = round(float(p.actual_marks), 2) if p.actual_marks is not None else 'N/A'
            var_val = round(float(p.variance), 2) if p.variance is not None else 'N/A'
            writer.writerow([
                p.id,
                p.student_id_snapshot or 'N/A',
                p.student_name_snapshot or 'N/A',
                round(float(p.study_hours), 2) if p.study_hours is not None else '',
                round(float(p.attendance_percentage), 2) if p.attendance_percentage is not None else '',
                round(float(p.assignment_score), 2) if p.assignment_score is not None else '',
                round(float(p.previous_exam_marks), 2) if p.previous_exam_marks is not None else '',
                round(float(p.predicted_marks), 2) if p.predicted_marks is not None else '',
                p.performance_category or '',
                actual,
                var_val,
                p.model_version or '',
                p.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ])

        return response
