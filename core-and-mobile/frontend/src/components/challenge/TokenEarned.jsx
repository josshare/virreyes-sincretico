import { useLocation, useNavigate } from 'react-router-dom';

export default function TokenEarned() {
  const location = useLocation();
  const navigate = useNavigate();
  const { txHash, points, tourId } = location.state || { txHash: '0x...', points: 0 };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center">
        <div className="text-6xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-yellow-400">Points Earned!</h2>
        <p className="text-5xl font-bold text-white my-2">+{points} SNT</p>
        <p className="text-gray-400 text-sm">
          Great! You earned tokens for supporting the local economy.
        </p>
        {txHash && (
          <p className="text-xs text-gray-500 mt-2 break-all">
            Tx: {txHash.slice(0, 10)}...
          </p>
        )}
        <button
          onClick={() => navigate(tourId ? `/passport/${tourId}` : '/')}
          className="mt-4 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300"
        >
          See Passport
        </button>
      </div>
    </div>
  );
}