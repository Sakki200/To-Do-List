from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404
from ..serializers.canva_serializers import CanvaCreateSerializer, CanvaSerializer
from ..models import Canva

class CanvaCreateView(generics.CreateAPIView):
    queryset = Canva.objects.all()
    serializer_class = CanvaCreateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class CanvaUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        canva_id = request.data.get("id")

        if canva_id:
            canva = get_object_or_404(Canva, id=canva_id, user=request.user)
            serializer = CanvaSerializer(canva)
            return Response(serializer.data)
        else:
            canvas = Canva.objects.filter(user=request.user)
            serializer = CanvaSerializer(canvas, many=True)
            return Response(serializer.data)

    def patch(self, request):
        canva_id = request.data.get("id")
        if not canva_id:
            return Response({"detail": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        serializer = CanvaSerializer(canva, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        canva_id = request.data.get("id")
        if not canva_id:
            return Response({"detail": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        canva.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

