import { useEffect, useState } from 'react';
import { usePoints } from '../../contexts/PointsContext';
import api from '../../services/api';

export default function Wallet() {
  const { balance } = usePoints();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/transactions')
      .then(res => setTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const usdBalance = (balance / 10).toFixed(2); // example conversion

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-gray-500 text-sm">SPENDING BALANCE</p>
        <p className="text-4xl font-bold text-gray-800">{balance} SNT</p>
        <p className="text-gray-500 text-sm">≈ ${usdBalance} USD</p>
        <div className="flex gap-3 mt-4 justify-center">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">Send</button>
          <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full text-sm font-semibold">Receive</button>
        </div>
      </div>

      <h3 className="text-gray-700 font-semibold mt-6 mb-2">Recent Activity</h3>
      <ul className="space-y-2">
        {loading ? (
          <li className="text-gray-500">Loading...</li>
        ) : transactions.length === 0 ? (
          <li className="text-gray-500">No transactions yet</li>
        ) : (
          transactions.map((tx, idx) => (
            <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <p className="text-gray-800 font-medium">{tx.description}</p>
                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '↑' : '↓'} {Math.abs(tx.amount)} SNT
                </span>
                <p className="text-xs text-gray-500">${(Math.abs(tx.amount) / 10).toFixed(2)} USD</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}