from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentExportCSVView, StudentImportCSVView

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

urlpatterns = [
    path('export-csv/', StudentExportCSVView.as_view(), name='student-export-csv'),
    path('import-csv/', StudentImportCSVView.as_view(), name='student-import-csv'),
    path('', include(router.urls)),
]
