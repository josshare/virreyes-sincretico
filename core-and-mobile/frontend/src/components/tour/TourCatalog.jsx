import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TourCatalog() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tours')
      .then(res => setTours(res.data))
      .catch(console.error)
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

  if (loading) return <div className="text-center py-8 text-gray-500">Loading tours...</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tours..."
          className="w-full bg-gray-100 text-gray-800 p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['Culture', 'History', 'Food', 'All'].map(cat => (
          <button key={cat} className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {tours.map(tour => (
          <div key={tour.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-40 overflow-hidden">
            {tour.image_url ? (
                <img src={tour.image_url} alt={tour.name} className="w-full h-full object-cover" />
            ) : (
                <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-4xl">
                🇲🇽
                </div>
            )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-800">{tour.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(tour.date_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-blue-600 font-bold mt-1">${tour.price} USD</p>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>Available Spots</span>
                <span>{tour.booked_count || 0} / {tour.capacity}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-1 text-gray-500">
                  <span>Travelers</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">1</span>
                </div>
                <span className="text-gray-800 font-semibold">Total ${tour.price}</span>
              </div>
              <button
                onClick={() => navigate(`/tour/${tour.id}`)}
                className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}