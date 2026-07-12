import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCheckpointArrival } from '../../hooks/useCheckpointArrival';

export default function Passport() {
  const { tourId } = useParams();
  const [checkpoints, setCheckpoints] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  const arrived = useCheckpointArrival(checkpoints, demoMode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cpRes, compRes] = await Promise.all([
          api.get(`/checkpoints?tourId=${tourId}`),
          api.get(`/checkpoints/completions?tourId=${tourId}`)
        ]);
        setCheckpoints(cpRes.data);
        const compMap = {};
        compRes.data.forEach(c => compMap[c.checkpoint_id] = true);
        setCompletions(compMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tourId]);

  const completedCount = Object.keys(completions).length;
  const total = checkpoints.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">My Passport</h2>
        <span className="text-blue-600">{completedCount} / {total} Completed</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <ul className="space-y-3">
        {checkpoints.map(cp => (
          <li key={cp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-gray-800">{cp.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">+{cp.points_reward} SNT</span>
              {completions[cp.id] ? (
                <span className="text-green-500">✅</span>
              ) : (
                <button
                  onClick={() => navigate(`/challenge/${cp.id}`)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
                >
                  Start
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {arrived && !completions[arrived.id] && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-xl text-center">
          <p className="text-blue-700">📍 You are at {arrived.name}!</p>
          <button
            onClick={() => navigate(`/challenge/${arrived.id}`)}
            className="mt-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl"
          >
            Start Challenge
          </button>
        </div>
      )}
    </div>
  );
}