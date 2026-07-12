import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { usePoints } from '../../contexts/PointsContext';

export default function ChallengePage() {
  const { checkpointId } = useParams();
  const [checkpoint, setCheckpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { refreshBalance } = usePoints();

  useEffect(() => {
    api.get(`/checkpoints/${checkpointId}`)
      .then(res => setCheckpoint(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [checkpointId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(file);
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    const formData = new FormData();
    formData.append('photo', photo);
    setUploading(true);
    try {
      const res = await api.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoUrl(res.data.url);
      alert('Photo uploaded!');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!photoUrl) {
      alert('Please upload a photo first');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/checkpoints/complete', { 
        checkpointId,
        photoUrl
      });
      refreshBalance();
      navigate('/token-earned', { 
        state: { 
          txHash: res.data.txHash, 
          points: res.data.pointsEarned,
          tourId: checkpoint.tour_id 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete');
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate token payment (for demo)
  const handlePayWithTokens = async () => {
    setSubmitting(true);
    setError('');
    try {
      // For affiliated commerce, we can call a separate endpoint (not implemented yet)
      // For demo, we'll just simulate a successful payment
      // In real scenario, we would scan a commerce QR and call /redeem with a reward
      // For now, we just complete the checkpoint with a dummy tx hash and no photo
      const res = await api.post('/checkpoints/complete', { 
        checkpointId,
        paymentMethod: 'token' // tell backend it's a token payment
      });
      refreshBalance();
      navigate('/token-earned', { 
        state: { 
          txHash: res.data.txHash, 
          points: res.data.pointsEarned,
          tourId: checkpoint.tour_id 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (!checkpoint) return <div className="text-center py-8 text-gray-500">Checkpoint not found</div>;

  return (
    <div className="bg-white p-6 rounded-2xl text-center border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800">{checkpoint.name}</h3>
      <p className="text-gray-500 mt-2">{checkpoint.challenge_type}</p>
      <p className="text-blue-600 font-bold text-3xl mt-4">+{checkpoint.points_reward} SNT</p>
      <p className="text-sm text-gray-500 mt-2">Support a local artisan. Buy something or make a contribution.</p>

      {/* Photo upload section */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload receipt or photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {photo && (
          <button
            onClick={uploadPhoto}
            disabled={uploading}
            className="mt-2 bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        {photoUrl && <p className="text-green-600 text-sm mt-1">✅ Photo uploaded</p>}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleComplete}
          disabled={submitting || !photoUrl}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'I contributed! (with photo)'}
        </button>
        <button
          onClick={handlePayWithTokens}
          disabled={submitting}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
        >
          Pay with tokens (affiliated commerce)
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}