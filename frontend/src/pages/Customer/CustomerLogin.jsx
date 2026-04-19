import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/apiClient';
import Toast from '../../components/ui/Toast';
import './Customer.css';

const CustomerLogin = () => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [sifre, setSifre] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!kullaniciAdi || !sifre) {
            setToast({ show: true, message: 'Lütfen alanları doldurun.', type: 'danger' });
            return;
        }

        try {
            const res = await apiCall('/auth/login', 'POST', { KullaniciAdi: kullaniciAdi, Sifre: sifre }, 'customerToken');
            localStorage.setItem('customerToken', res.token);
            navigate('/sakin/dashboard');
        } catch (error) {
            setToast({ show: true, message: error.message || 'Hatalı giriş!', type: 'danger' });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2>ELİT YÖNETİM</h2>
                <p>Sakin Paneline Giriş Yapın</p>
                <div className="input-wrapper">
                    <label>Kullanıcı Adı</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="sakin"
                        value={kullaniciAdi}
                        onChange={(e) => setKullaniciAdi(e.target.value)}
                    />
                </div>
                <div className="input-wrapper">
                    <label>Şifre</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="123456"
                        value={sifre}
                        onChange={(e) => setSifre(e.target.value)}
                    />
                </div>
                <button className="btn" style={{ width: '100%', marginTop: '10px' }} onClick={handleLogin}>
                    Giriş Yap
                </button>
                <button className="btn-outline" style={{ marginTop: '15px' }} onClick={() => navigate('/')}>
                    Ana Sayfaya Dön
                </button>
            </div>
            
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};

export default CustomerLogin;