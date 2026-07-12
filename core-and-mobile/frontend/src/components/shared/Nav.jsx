import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Nav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const tabs = [
    { to: '/', label: 'Tours', icon: '🏛️' },
    { to: '/wallet', label: 'Wallet', icon: '💰' },
    { to: '/my-qr', label: 'QR', icon: '📱' },
  ];
  if (user.role === 'hotel') {
    tabs.push({ to: '/scan', label: 'Scan', icon: '🔍' });
  }

  return (
    <nav className="bg-white border-t border-gray-200 flex justify-around p-2">
      {tabs.map(tab => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`flex flex-col items-center px-3 py-1 rounded ${
            location.pathname === tab.to ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-2xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}