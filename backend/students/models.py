from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


def get_performance_category(marks):
    """
    Categorizes student marks based on project-defined academic thresholds:
    - Below 40: At Risk
    - 40 to below 60: Needs Improvement
    - 60 to below 75: Satisfactory
    - 75 to below 90: Good
    - 90 to 100: Excellent

    NOTE: These thresholds are project-defined reference bands and not official
    institutional standards.
    """
    if marks is None:
        return 'Not Evaluated'
    try:
        val = float(marks)
    except (ValueError, TypeError):
        return 'Unknown'

    if val < 40.0:
        return 'At Risk'
    elif val < 60.0:
        return 'Needs Improvement'
    elif val < 75.0:
        return 'Satisfactory'
    elif val < 90.0:
        return 'Good'
    else:
        return 'Excellent'


class Student(models.Model):
    """
    Stores academic profiles and historical performance for students.
    """
    student_id = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique student identifier (e.g., STU1001)"
    )
    name = models.CharField(
        max_length=150,
        help_text="Full legal name of the student"
    )
    course = models.CharField(
        max_length=150,
        help_text="Enrolled degree, department, or subject"
    )
    study_hours_per_day = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(24.0)],
        help_text="Average self-study hours per day (0.0 to 24.0)"
    )
    attendance_percentage = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Class attendance rate (0.0 to 100.0%)"
    )
    assignment_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Average assignment score (0.0 to 100.0)"
    )
    previous_exam_marks = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Previous term examination score (0.0 to 100.0)"
    )
    final_exam_marks = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Actual final semester marks if already evaluated (0.0 to 100.0)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.student_id} - {self.name} ({self.course})"

    @property
    def actual_category(self):
        return get_performance_category(self.final_exam_marks)
