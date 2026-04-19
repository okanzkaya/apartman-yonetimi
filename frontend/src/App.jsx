import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Login from './pages/Login/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/sakin/dashboard" element={<CustomerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;