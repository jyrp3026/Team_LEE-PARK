import { InventoryItem } from '@/hooks/useInventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '@/../../shared/const';

interface InventoryCardProps {
  item: InventoryItem;
  onBorrow?: (itemId: string) => void;
  onReturn?: (itemId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'borrowed':
      return 'bg-blue-100 text-blue-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available':
      return '대여 가능';
    case 'borrowed':
      return '대여 중';
    case 'maintenance':
      return '유지보수 중';
    default:
      return status;
  }
};

const getCategoryIcon = (categoryId: string) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon || '📦';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

export function InventoryCard({ item, onBorrow, onReturn }: InventoryCardProps) {
  const isAvailable = item.status === 'available';
  const isBorrowed = item.status === 'borrowed';
  const isMaintenanceNeeded = item.returnDate && new Date(item.returnDate) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getCategoryIcon(item.category)}</span>
              <CardTitle className="text-lg">{item.name}</CardTitle>
            </div>
            <CardDescription className="text-sm">{item.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(item.status)}>
            {getStatusLabel(item.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 대여 정보 */}
        {isBorrowed && (
          <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-medium">대여자: {item.borrowedBy}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>반납예정: {formatDate(item.returnDate)}</span>
            </div>
            {isMaintenanceNeeded && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">반납 기한 초과</span>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-2">
          {isAvailable && onBorrow && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onBorrow(item.id)}
            >
              대여하기
            </Button>
          )}
          {isBorrowed && onReturn && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onReturn(item.id)}
            >
              반납하기
            </Button>
          )}
          {item.status === 'maintenance' && (
            <div className="text-xs text-gray-500 py-2 px-3 bg-gray-50 rounded flex-1 text-center">
              유지보수 중
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
