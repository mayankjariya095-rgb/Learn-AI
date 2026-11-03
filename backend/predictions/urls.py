from django.urls import path
from .views import (
    PredictOutcomeView,
    PredictionHistoryListView,
    PredictionHistoryDetailView,
    PredictionExportCSVView
)

urlpatterns = [
    path('predict/', PredictOutcomeView.as_view(), name='predict-outcome'),
    path('history/', PredictionHistoryListView.as_view(), name='prediction-history-list'),
    path('history/<int:pk>/', PredictionHistoryDetailView.as_view(), name='prediction-history-detail'),
    path('export-csv/', PredictionExportCSVView.as_view(), name='prediction-export-csv'),
]
