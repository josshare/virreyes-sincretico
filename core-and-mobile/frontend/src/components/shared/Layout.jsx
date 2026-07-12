import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import PointsBadge from './PointsBadge';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      {/* iPhone frame */}
      <div className="relative w-full max-w-md mx-auto bg-black rounded-[3rem] shadow-2xl p-3">
        {/* Notch (optional) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-black rounded-b-2xl z-10 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
        </div>
        {/* Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner min-h-[700px] flex flex-col">
          {/* App header */}
          <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-800">🇲🇽 Virreyes Sincretico</h1>
            <PointsBadge />
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 bg-white">
            <Outlet />
          </div>
          <Nav />
        </div>
      </div>
    </div>
  );
}