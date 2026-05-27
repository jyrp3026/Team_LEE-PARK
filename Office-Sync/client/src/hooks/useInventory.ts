import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:8000/api';

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

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Django API에서 비품 목록 불러오기
  useEffect(() => {
  fetch(`${API_URL}/products/`)
    .then((res) => res.json())
    .then((data) => {
      const mapped = data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category: item.category,
        description: item.description,
        status: item.status,
        borrowedBy: item.borrowed_by,
        borrowedAt: item.borrowed_at,
        returnDate: item.return_date,
      }));
      setItems(mapped);
      setIsLoading(false);
    })
    .catch(() => setIsLoading(false));
}, []);

  // 대여 처리
  const borrowItem = useCallback((itemId: string, borrowerName: string) => {
    fetch(`${API_URL}/products/${itemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'borrowed', borrowedBy: borrowerName }),
    }).then(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, status: 'borrowed', borrowedBy: borrowerName }
            : item
        )
      );
    });
  }, []);

  // 반납 처리
  const returnItem = useCallback((itemId: string) => {
    fetch(`${API_URL}/products/${itemId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'available', borrowedBy: null }),
    }).then(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, status: 'available', borrowedBy: null, borrowedAt: null, returnDate: null }
            : item
        )
      );
    });
  }, []);

  const getItemsByCategory = useCallback(
    (category: string) => items.filter((item) => item.category === category),
    [items]
  );

  const searchItems = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery)
      );
    },
    [items]
  );

  const getStats = useCallback(() => {
    return {
      total: items.length,
      available: items.filter((i) => i.status === 'available').length,
      borrowed: items.filter((i) => i.status === 'borrowed').length,
      maintenance: items.filter((i) => i.status === 'maintenance').length,
    };
  }, [items]);

  return { items, isLoading, borrowItem, returnItem, getItemsByCategory, searchItems, getStats };
}