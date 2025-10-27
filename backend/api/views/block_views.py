from rest_framework import generics, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..serializers.block_serializers import BlockCreateSerializer, BlockSerializer
from ..models import Block, Canva


class BlockCreateView(generics.CreateAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockCreateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class BlockUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        canva_id = request.data.get("canva_id")
        block_id = request.data.get("block_id")

        if not canva_id or not block_id:
            return Response(
                {"detail": "canva_id and block_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        block = get_object_or_404(Block, id=block_id, canva=canva)
        serializer = BlockSerializer(block)
        return Response(serializer.data)

    def patch(self, request):
        canva_id = request.data.get("canva_id")
        block_id = request.data.get("block_id")

        if not canva_id or not block_id:
            return Response(
                {"detail": "canva_id and block_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        block = get_object_or_404(Block, id=block_id, canva=canva)
        serializer = BlockSerializer(block, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        canva_id = request.data.get("canva_id")
        block_id = request.data.get("block_id")

        if not canva_id or not block_id:
            return Response(
                {"detail": "canva_id and block_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        canva = get_object_or_404(Canva, id=canva_id, user=request.user)
        block = get_object_or_404(Block, id=block_id, canva=canva)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)