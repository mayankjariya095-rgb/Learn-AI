from rest_framework import status, views
from rest_framework.response import Response

from .predictor import load_model_and_metadata
from .pipeline import train_and_evaluate_models, METADATA_PATH


class ModelInfoView(views.APIView):
    """
    Returns current active ML model specifications, performance metrics,
    baseline comparison, and feature importance weights.
    """
    def get(self, request):
        try:
            _, metadata = load_model_and_metadata()
            return Response(metadata)
        except Exception as e:
            return Response(
                {"error": "Failed to read model metadata", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ModelRetrainView(views.APIView):
    """
    Triggers model retraining against the dataset, evaluates metrics,
    saves the updated model, and refreshes the inference cache.
    """
    def post(self, request):
        try:
            metadata = train_and_evaluate_models()
            # Force reload cache in inference service
            load_model_and_metadata(force_reload=True)
            return Response({
                "success": True,
                "message": "Model successfully retrained and validated.",
                "metadata": metadata
            })
        except Exception as e:
            return Response(
                {"error": "Retraining failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
