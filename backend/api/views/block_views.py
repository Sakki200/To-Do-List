from rest_framework import generics, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..serializers.block_serializers import BlockCreateSerializer, BlockSerializer
from ..serializers.task_serializers import TaskSerializer, TaskCreateSerializer
from ..models import Block, Canva, Task


class BlockCreateView(generics.CreateAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockCreateSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class BlockUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        canva_id = request.query_params.get("canva_id")
        block_id = request.query_params.get("block_id")
        user = request.user

        if not canva_id:
            return Response(
                {"detail": "canva_id is required."},
                status=400,
            )
        canva = user.accessible_canva(canva_id)

        if canva_id and not block_id:
            blocks = Block.objects.filter(canva=canva)
            serializer = BlockSerializer(blocks, many=True)
            return Response(serializer.data)
        else:
            block = get_object_or_404(Block, id=block_id, canva=canva)
            serializer = BlockSerializer(block)
            return Response(serializer.data)

    def patch(self, request):
        canva_id = request.data.get("canva_id")
        block_id = request.data.get("block_id")
        user = request.user

        if not canva_id or not block_id:
            return Response(
                {"detail": "canva_id and block_id are required."},
                status=400,
            )

        canva = user.accessible_canva(canva_id)
        block = get_object_or_404(Block, id=block_id, canva=canva)
        tasks_data = request.data.get("tasks", [])
        serializer = BlockSerializer(block, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        tasks = Task.objects.filter(block=block)
        existing_task_ids = {str(task.id) for task in tasks}
        sent_task_ids = {str(t.get("id")) for t in tasks_data if t.get("id")}

        for task in tasks:
            if str(task.id) not in sent_task_ids:
                task.delete()

        for task_data in tasks_data:
            task_id = task_data.get("id")
            if task_id and task_id in existing_task_ids:

                task_instance = Task.objects.get(id=task_id, block=block)
                task_serializer = TaskSerializer(
                    task_instance, data=task_data, partial=True
                )
                task_serializer.is_valid(raise_exception=True)
                task_serializer.save()
            else:

                create_serializer = TaskCreateSerializer(
                    data=task_data, context={"block": block}
                )
                create_serializer.is_valid(raise_exception=True)
                create_serializer.save()

        updated_block = Block.objects.get(id=block.id)
        output_serializer = BlockSerializer(updated_block)
        return Response(output_serializer.data, status=200)

    def delete(self, request):
        canva_id = request.data.get("canva_id")
        block_id = request.data.get("block_id")
        user = request.user

        if not canva_id or not block_id:
            return Response(
                {"detail": "canva_id and block_id are required."},
                status=400,
            )

        canva = user.accessible_canva(canva_id)
        block = get_object_or_404(Block, id=block_id, canva=canva)
        block.delete()
        return Response(status=204)
