from rest_framework import serializers
from .models import Prediction


class PredictionSerializer(serializers.ModelSerializer):
    """
    Serializes historical Prediction audit records with variance metrics.
    """
    actual_marks = serializers.SerializerMethodField(read_only=True)
    variance = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Prediction
        fields = [
            'id',
            'student',
            'student_id_snapshot',
            'student_name_snapshot',
            'study_hours',
            'attendance_percentage',
            'assignment_score',
            'previous_exam_marks',
            'predicted_marks',
            'performance_category',
            'model_version',
            'risk_factors',
            'recommendations',
            'actual_marks',
            'variance',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'predicted_marks',
            'performance_category',
            'model_version',
            'risk_factors',
            'recommendations',
            'actual_marks',
            'variance',
            'created_at'
        ]

    def get_actual_marks(self, obj):
        return obj.actual_marks

    def get_variance(self, obj):
        return obj.variance
