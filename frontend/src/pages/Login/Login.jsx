import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../../api/apiClient';
import Toast from '../../components/ui/Toast';
import '../Admin/Admin.css'; 

const Login = () => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [sifre, setSifre] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!kullaniciAdi || !sifre) {
            setToast({ show: true, message: 'Lütfen alanları doldurun.', type: 'warning' });
            return;
        }

        try {
            const res = await apiCall('/auth/login', 'POST', { KullaniciAdi: kullaniciAdi, Sifre: sifre }, null);
            
            if (res.rol === 1) {
                localStorage.setItem('adminToken', res.token);
                navigate('/admin/dashboard');
            } else {
                localStorage.setItem('customerToken', res.token);
                navigate('/sakin/dashboard');
            }
        } catch (error) {
            setToast({ show: true, message: error.message || 'Hatalı giriş!', type: 'danger' });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-geo-1"></div>
            <div className="login-geo-2"></div>
            
            <div className="login-card">
                <h2>ELİTE<span style={{color: 'var(--accent-color)'}}>.</span> YÖNETİM</h2>
                <p style={{marginBottom: '30px', color: 'var(--text-muted)'}}>Sisteme Giriş Yapın</p>
                <div className="input-wrapper">
                    <label>Kullanıcı Adı</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Kullanıcı adınızı girin"
                        value={kullaniciAdi}
                        onChange={(e) => setKullaniciAdi(e.target.value)}
                    />
                </div>
                <div className="input-wrapper" style={{marginBottom: '30px'}}>
                    <label>Şifre</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••"
                        value={sifre}
                        onChange={(e) => setSifre(e.target.value)}
                    />
                </div>
                <button className="btn-action" style={{ width: '100%', padding: '12px' }} onClick={handleLogin}>
                    <i className="fas fa-sign-in-alt"></i> Giriş Yap
                </button>
                
                <Link to="/" className="btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '15px', padding: '12px' }}>
                    <i className="fas fa-arrow-left"></i> Ana Sayfaya Dön
                </Link>
            </div>
            
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};

export default Login;