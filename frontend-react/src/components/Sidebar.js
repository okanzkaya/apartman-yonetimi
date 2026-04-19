import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ title, links, onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="sidebar" style={{ width: '280px', background: '#1a2a6c', color: 'white', height: '100vh', position: 'fixed', padding: '20px' }}>
            <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', textAlign: 'center', color: '#b89552', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                {title}
            </h1>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                <li onClick={() => navigate('/')} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    ⬅ Ana Sayfaya Dön
                </li>
                
                {links.map((link, index) => (
                    <li key={index} onClick={link.onClick} style={{ padding: '15px', cursor: 'pointer' }}>
                        {link.label}
                    </li>
                ))}

                <li onClick={onLogout} style={{ padding: '15px', cursor: 'pointer', color: '#ffcccc', marginTop: '30px' }}>
                    🚪 Çıkış Yap
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;