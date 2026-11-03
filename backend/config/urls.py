from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """Health check endpoint to verify backend status."""
    return Response({
        'status': 'healthy',
        'service': 'LearnAI Academic Prediction Platform',
        'version': '1.0.0',
        'database': 'SQLite',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/students/', include('students.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ml/', include('ml.urls')),
    re_path(r'^(?!api/|admin/|static/).*$', TemplateView.as_view(template_name='index.html')),
]
