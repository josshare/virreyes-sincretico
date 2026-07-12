import { Link } from 'react-router-dom';
import PhoneFrame from '../shared/PhoneFrame';

export default function Welcome() {
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white">
        <div className="text-6xl mb-4">🇲🇽</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Virreyes Sincretico</h1>
        <p className="text-gray-500 mb-8 text-center">Digital Passport & Token Rewards</p>
        <div className="space-y-4 w-full">
          <Link to="/signup" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition text-center">
            Sign Up
          </Link>
          <Link to="/login" className="block w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-300 transition text-center">
            Log In
          </Link>
          <button className="block w-full bg-transparent border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
            Continue as Guest
          </button>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <span>EN</span>
          <span>ES</span>
          <span>FR</span>
        </div>
      </div>
    </PhoneFrame>
  );
}