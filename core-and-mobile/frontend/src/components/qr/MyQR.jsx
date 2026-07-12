import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { usePoints } from '../../contexts/PointsContext';

export default function MyQR() {
  const { user } = useAuth();
  const { balance } = usePoints();
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (!user) return;
    const payload = JSON.stringify({ userId: user.id, wallet: user.walletAddress });
    QRCode.toDataURL(payload, { margin: 2, color: { dark: '#000', light: '#FFF' } })
      .then(url => setQr(url))
      .catch(console.error);
  }, [user]);

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-800">Scan Triple</h3>
      <div className="bg-white border border-gray-200 p-4 rounded-2xl inline-block my-4 shadow-sm">
        {qr ? (
          <img src={qr} alt="QR" className="w-48 h-48" />
        ) : (
          <div className="w-48 h-48 bg-gray-100 animate-pulse rounded" />
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800">{balance} SNT</p>
      <h4 className="text-gray-700 font-semibold mt-4">Recent Activity</h4>
      <ul className="text-left space-y-2 mt-2">
        <li className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
          <span className="text-gray-800">Zocalo</span>
          <span className="text-green-600">+10 SNT</span>
        </li>
        <li className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
          <span className="text-gray-800">Local Market</span>
          <span className="text-green-600">+10 SNT</span>
        </li>
      </ul>
    </div>
  );
}