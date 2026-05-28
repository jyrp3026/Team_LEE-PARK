from django.contrib import admin
from .models import Product, Rental

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'stock')
    list_filter = ('category', 'status')
    search_fields = ('name',)

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('borrower_name', 'product', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('borrower_name', 'product__name')
