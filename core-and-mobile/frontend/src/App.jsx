import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PointsProvider } from './contexts/PointsContext';
import Layout from './components/shared/Layout';
import Welcome from './components/welcome/Welcome';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import TourCatalog from './components/tour/TourCatalog';
import BookingDetails from './components/tour/BookingDetails';
import Passport from './components/passport/Passport';
import ChallengePage from "./components/challenge/ChallengePage";
import TokenEarned from './components/challenge/TokenEarned';
import Wallet from './components/wallet/Wallet';
import MyQR from './components/qr/MyQR';
import Scanner from './components/qr/Scanner';
import { useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/welcome" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PointsProvider>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Layout />}>
              <Route path="/" element={<PrivateRoute><TourCatalog /></PrivateRoute>} />
              <Route path="/tour/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
              <Route path="/passport/:tourId" element={<PrivateRoute><Passport /></PrivateRoute>} />
              <Route path="/challenge/:checkpointId" element={<PrivateRoute><ChallengePage /></PrivateRoute>} />
              <Route path="/token-earned" element={<PrivateRoute><TokenEarned /></PrivateRoute>} />
              <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
              <Route path="/my-qr" element={<PrivateRoute><MyQR /></PrivateRoute>} />
              <Route path="/scan" element={<PrivateRoute><Scanner /></PrivateRoute>} />
            </Route>
          </Routes>
        </PointsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;