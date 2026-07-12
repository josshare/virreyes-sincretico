import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          setScanResult(data);
          setMessage(`Scanned user: ${data.userId}`);
          html5QrCode.stop();
          api.get('/rewards')
            .then(res => setRewards(res.data))
            .catch(console.error);
        } catch (e) {
          setMessage('Invalid QR code');
        }
      },
      (error) => console.warn(error)
    );

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, []);

  const redeem = async () => {
    if (!scanResult || !selectedReward) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/redeem', {
        userId: scanResult.userId,
        rewardId: selectedReward.id,
      });
      setMessage(`✅ Redeemed! Tx: ${res.data.txHash.slice(0, 10)}...`);
      setScanResult(null);
      setRewards([]);
      setSelectedReward(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Hotel Scanner</h2>
      <div id="reader" className="w-full max-w-md mx-auto" />
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {message}
        </div>
      )}
      {scanResult && (
        <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-gray-800 font-semibold">User: #{scanResult.userId}</p>
          <select
            className="w-full mt-2 bg-white border border-gray-300 rounded-lg p-2 text-gray-800"
            onChange={(e) => setSelectedReward(rewards.find(r => r.id === parseInt(e.target.value)))}
            disabled={loading}
          >
            <option value="">Select reward...</option>
            {rewards.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.points_cost} pts)</option>
            ))}
          </select>
          <button
            className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={redeem}
            disabled={!selectedReward || loading}
          >
            {loading ? 'Processing...' : 'Confirm Redemption'}
          </button>
        </div>
      )}
    </div>
  );
}