import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

const colorMap = {
  green: 'bg-green-50 text-green-600 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

const iconColorMap = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
};

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className={`border-2 ${colorMap[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <Icon className={`w-12 h-12 ${iconColorMap[color]} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
}
