import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CustomerLogin from './pages/Customer/CustomerLogin';
import CustomerDashboard from './pages/Customer/CustomerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Tanıtım Sayfası */}
        <Route path="/" element={<LandingPage />} />

        {/* Yönetici Paneli */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Sakin Paneli */}
        <Route path="/sakin/login" element={<CustomerLogin />} />
        <Route path="/sakin/dashboard" element={<CustomerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;