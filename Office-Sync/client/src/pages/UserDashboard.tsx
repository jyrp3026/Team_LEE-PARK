import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  status: string;
  description: string;
}

interface Rental {
  id: number;
  product: number;
  product_name: string;
  borrower_name: string;
  start_date: string;
  end_date: string | null;
  status: 'renting' | 'returned';
}

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [borrowDialog, setBorrowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const username = currentUser.username || '';

  const fetchData = async () => {
    try {
      const [prodRes, rentalRes] = await Promise.all([
        api.get('/products/'),
        api.get(`/rentals/?borrower_name=${encodeURIComponent(username)}`),
      ]);
      setProducts(prodRes.data.filter((p: Product) => p.status !== 'maintenance'));
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

  const handleBorrowRequest = async () => {
    if (!selectedProduct || !borrowerName.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    setIsBorrowing(true);
    try {
      await api.post(`/products/${selectedProduct.id}/borrow/`, {
        borrower_name: borrowerName.trim(),
      });
      toast.success(`"${selectedProduct.name}" 대여가 완료되었습니다`);
      setBorrowDialog(false);
      setBorrowerName('');
      setSelectedProduct(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '대여에 실패했습니다');
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleReturn = async (rental: Rental) => {
    try {
      await api.post(`/products/${rental.product}/return_item/`, {
        borrower_name: rental.borrower_name,
      });
      toast.success(`"${rental.product_name}"을(를) 반납했습니다`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || '반납에 실패했습니다');
    }
  };

  const stats = useMemo(() => {
    const renting = rentals.filter((r) => r.status === 'renting').length;
    const returned = rentals.filter((r) => r.status === 'returned').length;
    return { renting, returned };
  }, [rentals]);

  const isOverdue = (rental: Rental) => {
    if (rental.status !== 'renting' || !rental.end_date) return false;
    return new Date(rental.end_date) < new Date();
  };

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
                <p className="text-slate-600">사용자 대시보드 — {username}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.renting}</div>
            <p className="text-sm text-slate-600 mt-1">대여 중</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.returned}</div>
            <p className="text-sm text-slate-600 mt-1">반납 완료</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-slate-600">{products.filter((p) => p.stock > 0).length}</div>
            <p className="text-sm text-slate-600 mt-1">대여 가능 비품</p>
          </Card>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">대여 가능 비품</TabsTrigger>
            <TabsTrigger value="myborrow">내 대여 현황</TabsTrigger>
          </TabsList>

          {/* 대여 가능 비품 탭 */}
          <TabsContent value="available" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">대여 가능한 비품</h2>

            {products.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">대여 가능한 비품이 없습니다.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>카테고리: {product.category}</p>
                        <p>대여 가능: {product.stock}개</p>
                        {product.description && <p>설명: {product.description}</p>}
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedProduct(product);
                          setBorrowDialog(true);
                        }}
                        disabled={product.stock === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {product.stock === 0 ? '대여 불가' : '대여 신청'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 내 대여 현황 탭 */}
          <TabsContent value="myborrow" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">내 대여 현황</h2>

            {rentals.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">대여 기록이 없습니다.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => {
                  const overdue = isOverdue(rental);
                  return (
                    <Card key={rental.id} className={`p-4 ${overdue ? 'border-red-300 bg-red-50' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-slate-900">{rental.product_name}</h3>
                            <div className="space-y-1 mt-2 text-sm text-slate-600">
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                대여: {new Date(rental.start_date).toLocaleDateString('ko-KR')}
                              </p>
                              {rental.end_date && (
                                <p className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  반납: {new Date(rental.end_date).toLocaleDateString('ko-KR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2 ${
                              rental.status === 'renting'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {rental.status === 'renting' ? '✅ 대여 중' : '✓ 반납 완료'}
                          </span>
                        </div>

                        {overdue && (
                          <div className="flex items-center gap-2 p-2 bg-red-100 rounded text-red-800 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>반납 기한이 지났습니다. 빨리 반납해주세요!</span>
                          </div>
                        )}

                        {rental.status === 'renting' && (
                          <Button
                            size="sm"
                            onClick={() => handleReturn(rental)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            반납하기
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* 대여 신청 다이얼로그 */}
      <Dialog open={borrowDialog} onOpenChange={setBorrowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>"{selectedProduct?.name}" 대여 신청</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">대여 가능 수량: {selectedProduct?.stock}개</p>
            <div>
              <label className="text-sm font-medium text-gray-700">대여자 이름</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBorrowDialog(false)}>취소</Button>
            <Button
              onClick={handleBorrowRequest}
              disabled={isBorrowing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isBorrowing ? '처리 중...' : '대여 신청'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
