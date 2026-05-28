import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BorrowDialogProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: (borrowerName: string) => void;
  onCancel: () => void;
}

export function BorrowDialog({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
}: BorrowDialogProps) {
  const [borrowerName, setBorrowerName] = useState('');

  const handleConfirm = () => {
    if (borrowerName.trim()) {
      onConfirm(borrowerName);
      setBorrowerName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>비품 대여</DialogTitle>
          <DialogDescription>
            "{itemName}"을(를) 대여하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="borrower">대여자 이름</Label>
            <Input
              id="borrower"
              placeholder="이름을 입력하세요"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500">
            반납 예정일: 7일 후 (자동 설정)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!borrowerName.trim()}
          >
            대여하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
