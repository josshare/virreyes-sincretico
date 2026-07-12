import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function BookingDetails() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tourRes, cpRes] = await Promise.all([
          api.get(`/tours/${id}`),
          api.get(`/checkpoints?tourId=${id}`)
        ]);
        setTour(tourRes.data);
        setCheckpoints(cpRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = async () => {
    try {
      await api.post('/bookings', { tourId: id });
      navigate(`/passport/${id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading...</div>;
  if (!tour) return <div className="text-center py-8 text-gray-400">Tour not found</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">{tour.name}</h2>
      <p className="text-gray-400 text-sm">
        {new Date(tour.date_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>

      <div className="mt-4 space-y-2">
        {checkpoints.map(cp => (
          <div key={cp.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl">
            <span className="text-white">{cp.name}</span>
            <span className="text-yellow-400 font-bold">+{cp.points_reward} SNT</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleBook}
        className="mt-6 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition"
      >
        Book Now
      </button>
    </div>
  );
}