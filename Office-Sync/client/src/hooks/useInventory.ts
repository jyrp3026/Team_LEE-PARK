import { useState, useEffect, useCallback } from 'react';
import { SAMPLE_ITEMS } from '@/../../shared/const';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'borrowed' | 'maintenance';
  borrowedBy: string | null;
  borrowedAt: string | null;
  returnDate: string | null;
  description: string;
}

const STORAGE_KEY = 'office-sync-inventory';

/**
 * 비품 관리 상태 및 로직을 담당하는 커스텀 훅
 * localStorage를 사용하여 데이터 영속성을 보장합니다.
 */
export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 로드 (localStorage 또는 샘플 데이터)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems(SAMPLE_ITEMS as InventoryItem[]);
      }
    } else {
      setItems(SAMPLE_ITEMS as InventoryItem[]);
    }
    setIsLoading(false);
  }, []);

  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  // 비품 대여 처리
  const borrowItem = useCallback((itemId: string, borrowerName: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'borrowed',
              borrowedBy: borrowerName,
              borrowedAt: new Date().toISOString(),
              returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : item
      )
    );
  }, []);

  // 비품 반납 처리
  const returnItem = useCallback((itemId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'available',
              borrowedBy: null,
              borrowedAt: null,
              returnDate: null,
            }
          : item
      )
    );
  }, []);

  // 비품 상태 변경 (유지보수 등)
  const updateItemStatus = useCallback(
    (itemId: string, status: InventoryItem['status']) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status,
                borrowedBy: status === 'available' ? null : item.borrowedBy,
                borrowedAt: status === 'available' ? null : item.borrowedAt,
                returnDate: status === 'available' ? null : item.returnDate,
              }
            : item
        )
      );
    },
    []
  );

  // 카테고리별 필터링
  const getItemsByCategory = useCallback(
    (category: string) => items.filter((item) => item.category === category),
    [items]
  );

  // 검색 기능
  const searchItems = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery) ||
          (item.borrowedBy?.toLowerCase().includes(lowerQuery) ?? false)
      );
    },
    [items]
  );

  // 통계 정보
  const getStats = useCallback(() => {
    const total = items.length;
    const available = items.filter((item) => item.status === 'available').length;
    const borrowed = items.filter((item) => item.status === 'borrowed').length;
    const maintenance = items.filter((item) => item.status === 'maintenance').length;

    return { total, available, borrowed, maintenance };
  }, [items]);

  return {
    items,
    isLoading,
    borrowItem,
    returnItem,
    updateItemStatus,
    getItemsByCategory,
    searchItems,
    getStats,
  };
}
