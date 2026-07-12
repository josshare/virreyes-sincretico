export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-black rounded-[3rem] shadow-2xl p-3">
        {/* Notch */}
        <div className="relative z-10 flex justify-center">
          <div className="absolute -top-2 w-36 h-7 bg-black rounded-b-2xl flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
          </div>
        </div>
        {/* Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner min-h-[700px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}