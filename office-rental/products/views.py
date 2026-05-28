from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import Product, Rental, User
from .serializers import ProductSerializer, RentalSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': '아이디와 비밀번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': '아이디 또는 비밀번호가 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': '사용자명과 비밀번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'error': '비밀번호는 6자 이상이어야 합니다.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': '이미 존재하는 사용자명입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
        }
    }, status=status.HTTP_201_CREATED)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['post'])
    def borrow(self, request, pk=None):
        product = self.get_object()
        borrower_name = request.data.get('borrower_name', '').strip()

        if not borrower_name:
            return Response({'error': '대여자 이름을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        if product.stock <= 0:
            return Response({'error': '재고가 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        Rental.objects.create(product=product, borrower_name=borrower_name)
        product.stock -= 1
        if product.stock == 0:
            product.status = 'borrowed'
        product.save()

        return Response(ProductSerializer(product).data)

    @action(detail=True, methods=['post'])
    def return_item(self, request, pk=None):
        product = self.get_object()
        borrower_name = request.data.get('borrower_name', '').strip()

        rental = Rental.objects.filter(
            product=product,
            borrower_name=borrower_name,
            status='renting'
        ).first()

        if not rental:
            return Response({'error': '해당 대여 기록이 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        rental.status = 'returned'
        rental.end_date = timezone.now()
        rental.save()

        product.stock += 1
        product.status = 'available'
        product.save()

        return Response(ProductSerializer(product).data)


class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer

    def get_queryset(self):
        queryset = Rental.objects.all().order_by('-created_at')
        product_id = self.request.query_params.get('product')
        borrower_name = self.request.query_params.get('borrower_name')
        rental_status = self.request.query_params.get('status')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if borrower_name:
            queryset = queryset.filter(borrower_name=borrower_name)
        if rental_status:
            queryset = queryset.filter(status=rental_status)
        return queryset
