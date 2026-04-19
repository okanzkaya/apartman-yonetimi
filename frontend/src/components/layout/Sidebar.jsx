import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ title, activeTab, setActiveTab, links, onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <h1 style={{ cursor: 'pointer' }} onClick={() => setActiveTab('anasayfa')}>
                {title}
            </h1>
            <ul className="nav-links">
                <li onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <i className="fas fa-arrow-left"></i> Ana Sayfaya Dön
                </li>
                
                {links.map((link) => (
                    <li 
                        key={link.id} 
                        className={activeTab === link.id ? 'active' : ''} 
                        onClick={() => setActiveTab(link.id)}
                    >
                        <i className={`fas ${link.icon}`}></i> {link.label}
                    </li>
                ))}

                <li onClick={onLogout} style={{ marginTop: '30px', color: '#ffcccc' }}>
                    <i className="fas fa-sign-out-alt"></i> Çıkış Yap
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;