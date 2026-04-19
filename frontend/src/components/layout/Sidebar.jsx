import React from 'react';

const Sidebar = ({ title, activeTab, setActiveTab, links, onLogout }) => {
    return (
        <div className="sidebar">
            <h1 style={{ cursor: 'pointer' }} onClick={() => setActiveTab('anasayfa')}>
                {title}
            </h1>
            <ul className="nav-links">
                {links.map((link) => (
                    <li 
                        key={link.id} 
                        className={activeTab === link.id ? 'active' : ''} 
                        onClick={() => setActiveTab(link.id)}
                    >
                        <i className={`fas ${link.icon}`}></i> {link.label}
                    </li>
                ))}

                <li onClick={onLogout} style={{ marginTop: '30px', color: '#ffcccc', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
                    <i className="fas fa-sign-out-alt"></i> Çıkış Yap
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;