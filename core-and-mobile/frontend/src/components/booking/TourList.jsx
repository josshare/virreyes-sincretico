import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TourList() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tours')
      .then(res => setTours(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const bookTour = async (tourId) => {
    try {
      await api.post('/bookings', { tourId });
      alert('🎉 Tour booked!');
      const res = await api.get('/tours');
      setTours(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) return <div className="text-center py-8">Loading tours...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-green-800">🇲🇽 Available Tours</h2>
      {tours.map(tour => (
        <div key={tour.id} className="bg-white border border-gray-200 rounded-xl shadow p-4">
          <h3 className="text-xl font-semibold">{tour.name}</h3>
          <p className="text-gray-600">{tour.description}</p>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-500">
              👥 {tour.booked_count || 0} / {tour.capacity} booked
            </span>
            <span className="text-green-700 font-bold">${tour.price}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className={`flex-1 py-2 rounded-lg text-white ${
                (tour.booked_count || 0) >= tour.capacity
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={() => bookTour(tour.id)}
              disabled={(tour.booked_count || 0) >= tour.capacity}
            >
              {(tour.booked_count || 0) >= tour.capacity ? 'Full' : 'Book Now'}
            </button>
            <button
              className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
              onClick={() => navigate(`/passport/${tour.id}`)}
            >
              Passport
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}