import { usePoints } from '../../contexts/PointsContext';

export default function PointsBadge() {
  const { balance, loading } = usePoints();

  return (
    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
      <span>⭐</span>
      {loading ? '...' : balance}
    </div>
  );
}