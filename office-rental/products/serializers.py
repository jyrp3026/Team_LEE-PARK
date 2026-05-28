from rest_framework import serializers
from .models import Product, Rental

class ProductSerializer(serializers.ModelSerializer):
    renting_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_renting_count(self, obj):
        return obj.rental_set.filter(status='renting').count()

class RentalSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Rental
        fields = '__all__'