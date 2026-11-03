import csv
import io
from datetime import datetime, timezone
from django.http import HttpResponse
from django.db.models import Q
from django.db import transaction
from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Student, get_performance_category
from .serializers import StudentSerializer


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Student academic profiles with filtering, sorting, and pagination.
    """
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Student.objects.all()

        # Search by student ID or Name
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(student_id__icontains=search_query)
            )

        # Filter by course
        course = self.request.query_params.get('course', '').strip()
        if course:
            qs = qs.filter(course__iexact=course)

        # Filter by risk/category
        category = self.request.query_params.get('category', '').strip()
        if category:
            # Filter based on marks threshold for evaluated students
            if category == 'At Risk':
                qs = qs.filter(final_exam_marks__lt=40.0)
            elif category == 'Needs Improvement':
                qs = qs.filter(final_exam_marks__gte=40.0, final_exam_marks__lt=60.0)
            elif category == 'Satisfactory':
                qs = qs.filter(final_exam_marks__gte=60.0, final_exam_marks__lt=75.0)
            elif category == 'Good':
                qs = qs.filter(final_exam_marks__gte=75.0, final_exam_marks__lt=90.0)
            elif category == 'Excellent':
                qs = qs.filter(final_exam_marks__gte=90.0)
            elif category == 'Not Evaluated':
                qs = qs.filter(final_exam_marks__isnull=True)

        # Sorting
        ordering = self.request.query_params.get('ordering', '-created_at').strip()
        allowed_orderings = [
            'created_at', '-created_at',
            'name', '-name',
            'student_id', '-student_id',
            'attendance_percentage', '-attendance_percentage',
            'previous_exam_marks', '-previous_exam_marks',
            'final_exam_marks', '-final_exam_marks',
            'study_hours_per_day', '-study_hours_per_day'
        ]
        if ordering in allowed_orderings:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')

        return qs

    def list(self, request, *args, **kwargs):
        # Support unpaginated request when selecting students in dropdowns: ?all=true
        if request.query_params.get('all', '').lower() == 'true':
            qs = self.get_queryset()
            serializer = self.get_serializer(qs, many=True)
            return Response({
                "count": qs.count(),
                "results": serializer.data
            })
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def predictions(self, request, pk=None):
        """Returns predictions associated with this student."""
        student = self.get_object()
        from predictions.serializers import PredictionSerializer
        predictions = student.predictions.all().order_by('-created_at')
        serializer = PredictionSerializer(predictions, many=True)
        return Response(serializer.data)


class StudentExportCSVView(views.APIView):
    """
    Exports student records to a formatted CSV file with support for current filters.
    """
    def get(self, request):
        qs = Student.objects.all()

        search_query = request.query_params.get('search', '').strip()
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(student_id__icontains=search_query)
            )

        course = request.query_params.get('course', '').strip()
        if course:
            qs = qs.filter(course__iexact=course)

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"learnai_students_{timestamp}.csv"

        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)
        writer.writerow([
            'Student ID',
            'Name',
            'Course',
            'Study Hours Per Day',
            'Attendance (%)',
            'Assignment Score',
            'Previous Exam Marks',
            'Final Exam Marks',
            'Performance Category',
            'Created At',
        ])

        for s in qs.order_by('student_id'):
            writer.writerow([
                s.student_id,
                s.name,
                s.course,
                round(float(s.study_hours_per_day), 2) if s.study_hours_per_day is not None else '',
                round(float(s.attendance_percentage), 2) if s.attendance_percentage is not None else '',
                round(float(s.assignment_score), 2) if s.assignment_score is not None else '',
                round(float(s.previous_exam_marks), 2) if s.previous_exam_marks is not None else '',
                round(float(s.final_exam_marks), 2) if s.final_exam_marks is not None else 'N/A',
                s.actual_category if s.actual_category else 'Not Evaluated',
                s.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            ])

        return response


class StudentImportCSVView(views.APIView):
    """
    Uploads and validates a CSV file to batch-import student records.
    Provides detailed error report for invalid or duplicate rows.
    """
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {"error": "No file was uploaded. Please upload a valid CSV file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file.name.lower().endswith('.csv'):
            return Response(
                {"error": "Unsupported file format. Please upload a file with .csv extension."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode file content
            content = file.read().decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(content))
        except Exception as e:
            return Response(
                {"error": f"Failed to parse CSV file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize column header names
        field_map = {}
        for header in (reader.fieldnames or []):
            clean_hdr = header.strip().lower().replace(" ", "_")
            field_map[clean_hdr] = header

        required_fields = [
            'student_id',
            'name',
            'course',
            'study_hours_per_day',
            'attendance_percentage',
            'assignment_score',
            'previous_exam_marks'
        ]

        # Alternative aliases for convenience
        aliases = {
            'study_hours': 'study_hours_per_day',
            'attendance': 'attendance_percentage',
            'assignment': 'assignment_score',
            'previous_marks': 'previous_exam_marks',
            'final_marks': 'final_exam_marks'
        }

        # Check for required columns
        present_fields = set(field_map.keys())
        for alias_k, target_k in aliases.items():
            if alias_k in present_fields and target_k not in present_fields:
                present_fields.add(target_k)

        missing_fields = [f for f in required_fields if f not in present_fields]
        if missing_fields:
            return Response(
                {
                    "error": f"CSV is missing required columns: {', '.join(missing_fields)}",
                    "required_columns": required_fields,
                    "provided_columns": list(reader.fieldnames or [])
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Process rows
        total_rows = 0
        imported_records = []
        rejected_rows = []
        seen_ids = set(Student.objects.values_list('student_id', flat=True))
        file_ids = set()

        for row_idx, row in enumerate(reader, start=2):  # line 2 is first data row
            total_rows += 1
            row_normalized = {k.strip().lower().replace(" ", "_"): v.strip() for k, v in row.items() if k}

            # Map aliases
            for alias_k, target_k in aliases.items():
                if alias_k in row_normalized and target_k not in row_normalized:
                    row_normalized[target_k] = row_normalized[alias_k]

            student_id = row_normalized.get('student_id', '').upper()
            name = row_normalized.get('name', '')
            course = row_normalized.get('course', '')

            # Basic checks
            if not student_id:
                rejected_rows.append({"line": row_idx, "student_id": "N/A", "reason": "Missing student_id"})
                continue
            if not name:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Missing student name"})
                continue
            if not course:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Missing course"})
                continue

            # Duplicate check
            if student_id in seen_ids or student_id in file_ids:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Duplicate Student ID already exists"})
                continue

            # Numeric validation
            try:
                study_hours = float(row_normalized.get('study_hours_per_day', 0))
                if not (0.0 <= study_hours <= 24.0):
                    rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": f"Invalid study_hours ({study_hours}). Must be between 0 and 24."})
                    continue
            except ValueError:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Non-numeric study_hours_per_day"})
                continue

            try:
                attendance = float(row_normalized.get('attendance_percentage', 0))
                if not (0.0 <= attendance <= 100.0):
                    rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": f"Invalid attendance ({attendance}). Must be between 0 and 100."})
                    continue
            except ValueError:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Non-numeric attendance_percentage"})
                continue

            try:
                assignment = float(row_normalized.get('assignment_score', 0))
                if not (0.0 <= assignment <= 100.0):
                    rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": f"Invalid assignment_score ({assignment}). Must be between 0 and 100."})
                    continue
            except ValueError:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Non-numeric assignment_score"})
                continue

            try:
                prev_marks = float(row_normalized.get('previous_exam_marks', 0))
                if not (0.0 <= prev_marks <= 100.0):
                    rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": f"Invalid previous_exam_marks ({prev_marks}). Must be between 0 and 100."})
                    continue
            except ValueError:
                rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Non-numeric previous_exam_marks"})
                continue

            # Final marks (optional)
            final_marks = None
            final_raw = row_normalized.get('final_exam_marks', '')
            if final_raw and final_raw.upper() != 'N/A':
                try:
                    f_val = float(final_raw)
                    if 0.0 <= f_val <= 100.0:
                        final_marks = f_val
                    else:
                        rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": f"Invalid final_exam_marks ({f_val}). Must be between 0 and 100."})
                        continue
                except ValueError:
                    rejected_rows.append({"line": row_idx, "student_id": student_id, "reason": "Non-numeric final_exam_marks"})
                    continue

            # Valid row
            file_ids.add(student_id)
            imported_records.append(Student(
                student_id=student_id,
                name=name,
                course=course,
                study_hours_per_day=study_hours,
                attendance_percentage=attendance,
                assignment_score=assignment,
                previous_exam_marks=prev_marks,
                final_exam_marks=final_marks
            ))

        # Save all valid rows atomically
        if imported_records:
            with transaction.atomic():
                Student.objects.bulk_create(imported_records)

        return Response({
            "success": True,
            "total_rows": total_rows,
            "imported_count": len(imported_records),
            "rejected_count": len(rejected_rows),
            "rejected_rows": rejected_rows
        }, status=status.HTTP_201_CREATED if imported_records else status.HTTP_200_OK)
