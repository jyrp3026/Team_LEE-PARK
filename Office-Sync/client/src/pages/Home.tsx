import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryCard } from '@/components/InventoryCard';
import { StatCard } from '@/components/StatCard';
import { SearchFilter } from '@/components/SearchFilter';
import { BorrowDialog } from '@/components/BorrowDialog';
import { Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { items, isLoading, borrowItem, returnItem, getStats, searchItems, getItemsByCategory } =
    useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState('');

  const stats = getStats();

  // 필터링된 비품 목록
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory) {
      result = getItemsByCategory(selectedCategory);
    }

    if (searchQuery) {
      result = searchItems(searchQuery);
    }

    return result;
  }, [items, selectedCategory, searchQuery, getItemsByCategory, searchItems]);

  const handleBorrowClick = (itemId: string, itemName: string) => {
    setSelectedItemId(itemId);
    setSelectedItemName(itemName);
    setBorrowDialogOpen(true);
  };

  const handleBorrowConfirm = (borrowerName: string) => {
    if (selectedItemId) {
      borrowItem(selectedItemId, borrowerName);
      toast.success(`${selectedItemName}을(를) ${borrowerName}님이 대여했습니다.`);
      setBorrowDialogOpen(false);
      setSelectedItemId(null);
      setSelectedItemName('');
    }
  };

  const handleReturnClick = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      returnItem(itemId);
      toast.success(`${item.name}이(가) 반납되었습니다.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Office-Sync</h1>
          </div>
          <p className="text-slate-600">
            소규모 팀을 위한 사내 비품 및 도서 관리 대시보드
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container py-8">
        {/* 통계 섹션 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="전체 비품"
              value={stats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="대여 가능"
              value={stats.available}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="대여 중"
              value={stats.borrowed}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="유지보수 중"
              value={stats.maintenance}
              icon={AlertCircle}
              color="red"
            />
          </div>
        </section>

        {/* 검색 및 필터 섹션 */}
        <section className="mb-8 bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">검색 및 필터</h2>
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        {/* 비품 목록 섹션 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            비품 목록 ({filteredItems.length})
          </h2>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery || selectedCategory
                  ? '검색 결과가 없습니다.'
                  : '비품이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onBorrow={(itemId) => handleBorrowClick(itemId, item.name)}
                  onReturn={handleReturnClick}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 대여 다이얼로그 */}
      <BorrowDialog
        isOpen={borrowDialogOpen}
        itemName={selectedItemName}
        onConfirm={handleBorrowConfirm}
        onCancel={() => {
          setBorrowDialogOpen(false);
          setSelectedItemId(null);
          setSelectedItemName('');
        }}
      />
    </div>
  );
}
