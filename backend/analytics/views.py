from django.db.models import Avg, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response

from students.models import Student, get_performance_category
from predictions.models import Prediction


class DashboardStatsView(APIView):
    """
    Computes real-time dashboard analytics directly from database records.
    Provides aggregations, category distributions, course summaries, and recent activity.
    """
    def get(self, request):
        course_filter = request.query_params.get('course', '').strip()

        student_qs = Student.objects.all()
        pred_qs = Prediction.objects.all()

        if course_filter:
            student_qs = student_qs.filter(course__iexact=course_filter)
            # Filter predictions where linked student is in course
            pred_qs = pred_qs.filter(student__course__iexact=course_filter)

        total_students = student_qs.count()
        total_predictions = pred_qs.count()

        # Average actual marks for students who have evaluated final marks
        evaluated_students = student_qs.filter(final_exam_marks__isnull=False)
        avg_actual = evaluated_students.aggregate(Avg('final_exam_marks'))['final_exam_marks__avg']
        avg_actual_marks = round(avg_actual, 1) if avg_actual is not None else None

        # Average predicted marks across generated predictions
        avg_pred = pred_qs.aggregate(Avg('predicted_marks'))['predicted_marks__avg']
        avg_predicted_marks = round(avg_pred, 1) if avg_pred is not None else None

        # Average attendance and study hours
        avg_attendance = student_qs.aggregate(Avg('attendance_percentage'))['attendance_percentage__avg']
        avg_attendance = round(avg_attendance, 1) if avg_attendance is not None else None

        avg_study_hours = student_qs.aggregate(Avg('study_hours_per_day'))['study_hours_per_day__avg']
        avg_study_hours = round(avg_study_hours, 1) if avg_study_hours is not None else None

        # Students requiring academic support:
        # Based on actual final marks if evaluated (< 60) OR previous exam marks (< 50)
        at_risk_students_count = student_qs.filter(
            Q(final_exam_marks__lt=60.0) |
            Q(final_exam_marks__isnull=True, previous_exam_marks__lt=50.0)
        ).count()

        # Performance category distribution from evaluated students or predictions
        # 1. From predictions
        pred_categories = {
            'At Risk': pred_qs.filter(performance_category='At Risk').count(),
            'Needs Improvement': pred_qs.filter(performance_category='Needs Improvement').count(),
            'Satisfactory': pred_qs.filter(performance_category='Satisfactory').count(),
            'Good': pred_qs.filter(performance_category='Good').count(),
            'Excellent': pred_qs.filter(performance_category='Excellent').count(),
        }

        # 2. Course-wise breakdown
        course_aggregates = (
            student_qs.values('course')
            .annotate(
                student_count=Count('id'),
                avg_attendance=Avg('attendance_percentage'),
                avg_previous_marks=Avg('previous_exam_marks'),
                avg_final_marks=Avg('final_exam_marks')
            )
            .order_by('-student_count')
        )
        course_summary = [
            {
                "course": item["course"],
                "student_count": item["student_count"],
                "avg_attendance": round(item["avg_attendance"], 1) if item["avg_attendance"] else 0.0,
                "avg_previous_marks": round(item["avg_previous_marks"], 1) if item["avg_previous_marks"] else 0.0,
                "avg_final_marks": round(item["avg_final_marks"], 1) if item["avg_final_marks"] else None,
            }
            for item in course_aggregates
        ]

        # Recent 5 registered students
        recent_students = [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "course": s.course,
                "attendance": s.attendance_percentage,
                "previous_marks": s.previous_exam_marks,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for s in student_qs.order_by('-created_at')[:5]
        ]

        # Recent 5 predictions
        recent_predictions = [
            {
                "id": p.id,
                "student_id": p.student_id_snapshot or "Exploratory",
                "student_name": p.student_name_snapshot or "Custom Input",
                "predicted_marks": p.predicted_marks,
                "category": p.performance_category,
                "created_at": p.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for p in pred_qs.order_by('-created_at')[:5]
        ]

        return Response({
            "has_data": total_students > 0 or total_predictions > 0,
            "total_students": total_students,
            "total_predictions": total_predictions,
            "evaluated_students_count": evaluated_students.count(),
            "avg_actual_marks": avg_actual_marks,
            "avg_predicted_marks": avg_predicted_marks,
            "avg_attendance": avg_attendance,
            "avg_study_hours": avg_study_hours,
            "at_risk_students_count": at_risk_students_count,
            "category_distribution": [
                {"name": k, "count": v} for k, v in pred_categories.items()
            ],
            "course_summary": course_summary,
            "recent_students": recent_students,
            "recent_predictions": recent_predictions
        })
