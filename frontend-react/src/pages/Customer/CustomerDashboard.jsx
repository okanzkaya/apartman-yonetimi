import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { apiCall } from '../../api/apiClient';

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('anasayfa');
    const [rezervasyonlar, setRezervasyonlar] = useState([]);

    // Sayfa yüklendiğinde verileri çek
    useEffect(() => {
        if(activeTab === 'rezervasyon') {
            apiCall('/rezervasyon/listele', 'GET', null, 'customerToken')
                .then(data => setRezervasyonlar(data))
                .catch(err => console.error(err));
        }
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        window.location.href = '/sakin/login';
    };

    const sidebarLinks = [
        { label: '🏠 Anasayfa', onClick: () => setActiveTab('anasayfa') },
        { label: '📅 Rezervasyon', onClick: () => setActiveTab('rezervasyon') },
        // Diğer menü elemanlarını buraya ekleyeceğiz...
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar title="Sakin Paneli" links={sidebarLinks} onLogout={handleLogout} />
            
            <div style={{ marginLeft: '280px', padding: '40px', width: '100%' }}>
                {activeTab === 'anasayfa' && <div><h2>Ana Sayfa İçeriği</h2></div>}
                
                {activeTab === 'rezervasyon' && (
                    <div>
                        <h2>Rezervasyonlarınız</h2>
                        <ul>
                            {rezervasyonlar.map(rez => (
                                <li key={rez.id}>{rez.tesisAdi} - {rez.tarih} ({rez.durum})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;