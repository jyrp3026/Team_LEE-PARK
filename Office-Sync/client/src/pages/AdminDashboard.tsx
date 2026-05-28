import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  renting_count: number;
  status: string;
  description: string;
  price_per_day: number;
}

interface Rental {
  id: number;
  product: number;
  product_name: string;
  borrower_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

interface FormData {
  name: string;
  category: string;
  stock: number;
  description: string;
  price_per_day: number;
}

const DEFAULT_FORM: FormData = { name: '', category: '', stock: 1, description: '', price_per_day: 0 };

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  const fetchData = async () => {
    try {
      const [prodRes, rentalRes] = await Promise.all([
        api.get('/products/'),
        api.get('/rentals/?status=renting'),
      ]);
      setProducts(prodRes.data);
      setRentals(rentalRes.data);
    } catch {
      toast.error('데이터를 불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || formData.stock < 1) {
      toast.error('모든 필드를 올바르게 입력해주세요');
      return;
    }
    try {
      await api.post('/products/', formData);
      toast.success(`"${formData.name}" 비품이 추가되었습니다`);
      setFormData(DEFAULT_FORM);
      setAddDialog(false);
      fetchData();
    } catch {
      toast.error('비품 추가에 실패했습니다');
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    if (!formData.name || !formData.category || formData.stock < 0) {
      toast.error('모든 필드를 올바르게 입력해주세요');
      return;
    }
    try {
      await api.patch(`/products/${selectedProduct.id}/`, formData);
      toast.success(`"${formData.name}" 비품이 수정되었습니다`);
      setFormData(DEFAULT_FORM);
      setEditDialog(false);
      setSelectedProduct(null);
      fetchData();
    } catch {
      toast.error('비품 수정에 실패했습니다');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`"${product.name}"을(를) 삭제하시겠습니까?`)) return;
    try {
      await api.delete(`/products/${product.id}/`);
      toast.success(`"${product.name}" 비품이 삭제되었습니다`);
      fetchData();
    } catch {
      toast.error('비품 삭제에 실패했습니다');
    }
  };

  const handleReturnItem = async (rental: Rental) => {
    try {
      await api.post(`/products/${rental.product}/return_item/`, {
        borrower_name: rental.borrower_name,
      });
      toast.success(`"${rental.product_name}" 반납 처리 완료`);
      fetchData();
    } catch {
      toast.error('반납 처리에 실패했습니다');
    }
  };

  const activeRentals = useMemo(() => rentals.filter((r) => r.status === 'renting'), [rentals]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Office-Sync</h1>
                <p className="text-slate-600">관리자 대시보드</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">비품 관리</TabsTrigger>
            <TabsTrigger value="rentals">대여 현황 ({activeRentals.length})</TabsTrigger>
          </TabsList>

          {/* 비품 관리 탭 */}
          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">비품 목록</h2>
              <Button
                onClick={() => {
                  setFormData(DEFAULT_FORM);
                  setSelectedProduct(null);
                  setAddDialog(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 비품 추가
              </Button>
            </div>

            {products.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">등록된 비품이 없습니다.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>카테고리: {product.category}</p>
                        <p>총 수량: {product.stock + product.renting_count}개</p>
                        <p>대여 가능: {product.stock}개</p>
                        <p>대여 중: {product.renting_count}개</p>
                        {product.description && <p>설명: {product.description}</p>}
                        <p>
                          상태:{' '}
                          {product.status === 'available' ? (
                            <span className="text-green-600">✅ 정상</span>
                          ) : product.status === 'maintenance' ? (
                            <span className="text-orange-600">⚠️ 유지보수 중</span>
                          ) : (
                            <span className="text-blue-600">📦 대여 중</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(product);
                            setFormData({
                              name: product.name,
                              category: product.category,
                              stock: product.stock,
                              description: product.description,
                              price_per_day: product.price_per_day,
                            });
                            setEditDialog(true);
                          }}
                          className="flex-1"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 대여 현황 탭 */}
          <TabsContent value="rentals" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">현재 대여 현황</h2>

            {activeRentals.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">현재 대여 중인 비품이 없습니다.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeRentals.map((rental) => (
                  <Card key={rental.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-lg">{rental.product_name}</p>
                        <p className="text-sm text-slate-600">대여자: {rental.borrower_name}</p>
                        <p className="text-sm text-slate-600">
                          대여 시작: {new Date(rental.start_date).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleReturnItem(rental)}
                      >
                        반납 처리
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* 비품 추가 다이얼로그 */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 비품 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">비품명</label>
              <Input
                placeholder="예: MacBook Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">카테고리</label>
              <Input
                placeholder="예: 전자기기"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">수량</label>
              <Input
                type="number"
                min="1"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">설명</label>
              <Input
                placeholder="비품 설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>취소</Button>
            <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 비품 수정 다이얼로그 */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비품 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">비품명</label>
              <Input
                placeholder="예: MacBook Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">카테고리</label>
              <Input
                placeholder="예: 전자기기"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">재고 수량</label>
              <Input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">설명</label>
              <Input
                placeholder="비품 설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>취소</Button>
            <Button onClick={handleEditProduct} className="bg-blue-600 hover:bg-blue-700">수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
