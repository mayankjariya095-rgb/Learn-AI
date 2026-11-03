from rest_framework import serializers
from .models import Student, get_performance_category


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializes Student instances with complete field validation.
    """
    actual_category = serializers.SerializerMethodField(read_only=True)
    predictions_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'student_id',
            'name',
            'course',
            'study_hours_per_day',
            'attendance_percentage',
            'assignment_score',
            'previous_exam_marks',
            'final_exam_marks',
            'actual_category',
            'predictions_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'actual_category', 'predictions_count']

    def get_actual_category(self, obj):
        return obj.actual_category

    def get_predictions_count(self, obj):
        return obj.predictions.count()

    def validate_student_id(self, value):
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError("Student ID is required and cannot be blank.")
        # Check uniqueness during creation / update
        instance = getattr(self, 'instance', None)
        qs = Student.objects.filter(student_id__iexact=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Student ID '{val}' is already registered in the system.")
        return val

    def validate_study_hours_per_day(self, value):
        if value < 0.0 or value > 24.0:
            raise serializers.ValidationError("Study hours per day must be between 0.0 and 24.0 hours.")
        return round(float(value), 1)

    def validate_attendance_percentage(self, value):
        if value < 0.0 or value > 100.0:
            raise serializers.ValidationError("Attendance percentage must be between 0.0% and 100.0%.")
        return round(float(value), 1)

    def validate_assignment_score(self, value):
        if value < 0.0 or value > 100.0:
            raise serializers.ValidationError("Assignment score must be between 0.0 and 100.0.")
        return round(float(value), 1)

    def validate_previous_exam_marks(self, value):
        if value < 0.0 or value > 100.0:
            raise serializers.ValidationError("Previous examination marks must be between 0.0 and 100.0.")
        return round(float(value), 1)

    def validate_final_exam_marks(self, value):
        if value is not None:
            if value < 0.0 or value > 100.0:
                raise serializers.ValidationError("Final examination marks must be between 0.0 and 100.0.")
            return round(float(value), 1)
        return value
