export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// ============================================
// Office-Sync: 비품/도서 관리 대시보드
// ============================================

// 비품 카테고리 정의
export const CATEGORIES = [
  { id: 'equipment', label: '장비', icon: '💻' },
  { id: 'furniture', label: '가구', icon: '🪑' },
  { id: 'books', label: '도서', icon: '📚' },
  { id: 'supplies', label: '소모품', icon: '📦' },
] as const;

// 비품 상태 정의
export const ITEM_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  MAINTENANCE: 'maintenance',
} as const;

// 샘플 비품 데이터 (초기 데이터)
export const SAMPLE_ITEMS = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    category: 'equipment',
    status: 'available',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: '개발용 노트북',
  },
  {
    id: '2',
    name: 'MacBook Pro 16"',
    category: 'equipment',
    status: 'borrowed',
    borrowedBy: '김철수',
    borrowedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: '고성능 개발용 노트북',
  },
  {
    id: '3',
    name: '모니터 (27인치)',
    category: 'equipment',
    status: 'available',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: '4K 해상도 모니터',
  },
  {
    id: '4',
    name: '사무용 의자',
    category: 'furniture',
    status: 'available',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: '인체공학 의자',
  },
  {
    id: '5',
    name: 'Clean Code',
    category: 'books',
    status: 'borrowed',
    borrowedBy: '이영희',
    borrowedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Robert C. Martin 저',
  },
  {
    id: '6',
    name: 'Design Patterns',
    category: 'books',
    status: 'available',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: 'Gang of Four 저',
  },
  {
    id: '7',
    name: '포스트잇 팩',
    category: 'supplies',
    status: 'available',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: '노란색 포스트잇 100장',
  },
  {
    id: '8',
    name: '프로젝터',
    category: 'equipment',
    status: 'maintenance',
    borrowedBy: null,
    borrowedAt: null,
    returnDate: null,
    description: '회의실용 프로젝터 (수리 중)',
  },
]
