from django.urls import path
from .views import ModelInfoView, ModelRetrainView

urlpatterns = [
    path('info/', ModelInfoView.as_view(), name='ml-model-info'),
    path('retrain/', ModelRetrainView.as_view(), name='ml-model-retrain'),
]
