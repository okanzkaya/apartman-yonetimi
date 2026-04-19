import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, downloadFile } from '../../api/apiClient';
import Sidebar from '../../components/layout/Sidebar';
import Toast from '../../components/ui/Toast';
import './Customer.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('customerActiveTab') || 'anasayfa');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const [profil, setProfil] = useState({ id: '', kullaniciAdi: '', adSoyad: '', blokDaire: '', telefon: '', plaka: '' });
    const [finansGecmisi, setFinansGecmisi] = useState([]);
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [bakimlar, setBakimlar] = useState([]);
    const [dokumanlar, setDokumanlar] = useState([]);
    const [taleplerim, setTaleplerim] = useState([]);
    
    const [talepKategori, setTalepKategori] = useState('Asansör Arızası');
    const [talepAciklama, setTalepAciklama] = useState('');
    const [rezTesis, setRezTesis] = useState('Açık Havuz');
    const [rezSaat, setRezSaat] = useState('10:00 - 12:00');
    const [seciliGun, setSeciliGun] = useState(new Date().getDate());

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [talepModalData, setTalepModalData] = useState(null);

    useEffect(() => {
        localStorage.setItem('customerActiveTab', activeTab);
        fetchDataForTab(activeTab);
    }, [activeTab]);

    const triggerToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        navigate('/login');
    };

    const fetchDataForTab = async (tab) => {
        try {
            if (tab === 'anasayfa' || tab === 'profil') {
                const pData = await apiCall('/kullanici/profil', 'GET', null, 'customerToken');
                setProfil(pData);
            }
            if (tab === 'aidat' || tab === 'anasayfa') {
                const fData = await apiCall('/finans/ekstre', 'GET', null, 'customerToken');
                setFinansGecmisi(fData);
            }
            if (tab === 'rezervasyon' || tab === 'anasayfa') setRezervasyonlar(await apiCall('/rezervasyon/listele', 'GET', null, 'customerToken'));
            if (tab === 'anasayfa') {
                const bData = await apiCall('/bakim/listele', 'GET', null, 'customerToken');
                setBakimlar(bData.slice(0, 3));
            }
            if (tab === 'belgeler') setDokumanlar(await apiCall('/dokuman/listele', 'GET', null, 'customerToken'));
            if (tab === 'talep' || tab === 'anasayfa') setTaleplerim(await apiCall('/talepler/benimkiler', 'GET', null, 'customerToken'));
        } catch (error) { console.error(error); }
    };

    const getZamanDurumu = (tarihStr) => {
        const [d, m, y] = tarihStr.split('.');
        const islemTarihi = new Date(`${y}-${m}-${d}`);
        const bugun = new Date();
        bugun.setHours(0,0,0,0);

        if (islemTarihi.getTime() === bugun.getTime()) return <span className="status-badge warning">Bugün</span>;
        if (islemTarihi.getTime() < bugun.getTime()) return <span className="status-badge danger">Süresi Geçti</span>;
        return <span className="status-badge info">Yaklaşıyor</span>;
    };

    const guncelBorc = finansGecmisi.filter(f => f.durum !== 'Ödendi').reduce((acc, curr) => acc + parseFloat(curr.tutar), 0);
    const aktifTalepSayisi = taleplerim.filter(t => t.durum !== 'Çözüldü').length;
    const onayliRezervasyonlar = rezervasyonlar.filter(r => r.durum === 'Onaylandı');

    const handleAidatOde = async (id) => {
        try {
            const res = await apiCall('/finans/ode', 'POST', { id }, 'customerToken');
            triggerToast(res.mesaj, 'success');
            fetchDataForTab('aidat');
            fetchDataForTab('anasayfa');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const handleTalepGonder = async () => {
        if (!talepAciklama.trim()) return triggerToast('Lütfen bir açıklama girin.', 'danger');
        try {
            const res = await apiCall('/talepler/olustur', 'POST', { Kategori: talepKategori, Aciklama: talepAciklama }, 'customerToken');
            triggerToast(res.mesaj, 'success');
            setTalepAciklama('');
            fetchDataForTab('talep');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const handleRezervasyonYap = async () => {
        const tarih = new Date();
        tarih.setDate(seciliGun);
        try {
            const res = await apiCall('/rezervasyon/yap', 'POST', { TesisAdi: rezTesis, SaatAraligi: rezSaat, Tarih: tarih.toISOString() }, 'customerToken');
            triggerToast(res.mesaj, 'success');
            fetchDataForTab('rezervasyon');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const handleProfilGuncelle = async () => {
        try {
            const res = await apiCall('/kullanici/profil-guncelle', 'PUT', { Telefon: profil.telefon, Plaka: profil.plaka }, 'customerToken');
            triggerToast(res.mesaj, 'success');
            setShowProfileModal(false);
            fetchDataForTab('profil');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const sidebarLinks = [
        { id: 'anasayfa', label: 'Anasayfa', icon: 'fa-home' },
        { id: 'profil', label: 'Profil Bilgileri', icon: 'fa-user' },
        { id: 'aidat', label: 'Aidat & Ödemeler', icon: 'fa-credit-card' },
        { id: 'talep', label: 'Arıza & Talep', icon: 'fa-headset' },
        { id: 'rezervasyon', label: 'Rezervasyon', icon: 'fa-calendar-alt' },
        { id: 'belgeler', label: 'Belgeler', icon: 'fa-file-pdf' }
    ];

    return (
        <div className="customer-layout">
            <Sidebar title="ELİT YÖNETİM" links={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            
            <div className="main-content">
                <div className="header">
                    <div>
                        <h2>Hoş Geldiniz, <span style={{color: 'var(--accent-color)'}}>{profil.adSoyad || 'Sakin'}</span></h2>
                        <p>Kullanıcı ID: #{profil.id} | {profil.blokDaire}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>{new Date().toLocaleDateString('tr-TR')}</strong></p>
                        <span className={`status-badge ${guncelBorc === 0 ? 'paid' : 'danger'}`}>
                            {guncelBorc === 0 ? 'Güncel Borç Yok' : `Borç: ${guncelBorc} ₺`}
                        </span>
                    </div>
                </div>

                {activeTab === 'anasayfa' && (
                    <div className="tab-content">
                        
                        {onayliRezervasyonlar.length > 0 && (
                            <div className="card" style={{ background: '#e8f4fd', borderLeft: '5px solid var(--info)' }}>
                                <h3 style={{ color: 'var(--info)', marginBottom: '15px' }}><i className="fas fa-check-circle"></i> Onaylanmış Rezervasyonunuz Bulunuyor</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    {onayliRezervasyonlar.map((r, i) => (
                                        <div key={i} style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{r.tesisAdi}</p>
                                            <p style={{ marginTop: '5px' }}><i className="fas fa-calendar-day"></i> {r.tarih}</p>
                                            <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}><i className="fas fa-clock"></i> {r.saatAraligi}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="dashboard-grid">
                            <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--primary-color), #2a3c8c)', color: 'white' }}>
                                <h3 style={{color: 'white'}}><i className="fas fa-chart-line" style={{color: 'var(--accent-color)'}}></i> Elit Yönetim Özeti</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', textAlign: 'center' }}>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>{guncelBorc} ₺</h2><p style={{fontSize: '0.9rem'}}>Güncel Borcunuz</p></div>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>{aktifTalepSayisi}</h2><p style={{fontSize: '0.9rem'}}>Aktif Talebiniz</p></div>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>{bakimlar.length}</h2><p style={{fontSize: '0.9rem'}}>Yaklaşan Bakım</p></div>
                                </div>
                            </div>

                            <div className="card">
                                <h3><i className="fas fa-bolt"></i> Hızlı İşlemler</h3>
                                <button className="btn-outline" onClick={() => setActiveTab('talep')}>Yönetime Yaz / Arıza Bildir</button>
                                <button className="btn-outline" onClick={() => setActiveTab('rezervasyon')}>Tesis Rezerve Et</button>
                                <button className="btn-outline" onClick={() => setActiveTab('aidat')}>Hesap Ekstresi Görüntüle</button>
                            </div>

                            <div className="card" style={{ borderLeft: '5px solid var(--info)' }}>
                                <h3><i className="fas fa-wrench"></i> Yaklaşan Tesis Bakımları</h3>
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead><tr><th>Bakım Türü</th><th>Tarih</th><th>Periyot</th></tr></thead>
                                        <tbody>
                                            {bakimlar.length === 0 ? <tr><td colSpan="3">Yaklaşan bakım yok.</td></tr> : bakimlar.map((b, i) => (
                                                <tr key={i}>
                                                    <td>🛠️ <b>{b.tur}</b></td>
                                                    <td>{b.tarih} {getZamanDurumu(b.tarih)}</td>
                                                    <td><span style={{ fontWeight: 'bold' }}>{b.periyot}</span> aralıklarla</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profil' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Profil ve İletişim Bilgileri</h2>
                        <div className="card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <tbody>
                                        <tr><th>Kullanıcı Adı</th><td>{profil.kullaniciAdi}</td></tr>
                                        <tr><th>Ad Soyad</th><td>{profil.adSoyad}</td></tr>
                                        <tr><th>Telefon</th><td>{profil.telefon || 'Belirtilmemiş'}</td></tr>
                                        <tr><th>Araç Plakası</th><td>{profil.plaka || 'Belirtilmemiş'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <button className="btn" style={{width:'auto', marginTop: '15px'}} onClick={() => setShowProfileModal(true)}>Bilgileri Güncelle</button>
                        </div>
                    </div>
                )}

                {activeTab === 'aidat' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Hesap Hareketleri ve Ödemeler</h2>
                        <div className="card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Dönem</th><th>Açıklama</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {finansGecmisi.length === 0 ? <tr><td colSpan="5" style={{textAlign:'center'}}>Kayıt bulunamadı.</td></tr> : finansGecmisi.map((f, i) => (
                                            <tr key={i}>
                                                <td>{f.donem}</td><td>{f.aciklama}</td><td>{f.tutar} ₺</td>
                                                <td><span className={`status-badge ${f.durum === 'Ödendi' ? 'success' : 'danger'}`}>{f.durum}</span></td>
                                                <td>
                                                    {f.durum !== 'Ödendi' ? 
                                                        <button className="btn-sm" style={{background:'var(--success)'}} onClick={() => handleAidatOde(f.id)}>Şimdi Öde</button> 
                                                    : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'talep' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Talep & Destek Masası</h2>
                        <div className="dashboard-grid">
                            <div className="card">
                                <h3>Yeni Talep Oluştur</h3>
                                <label style={{fontWeight:'600'}}>Kategori</label>
                                <select className="form-control" value={talepKategori} onChange={(e)=>setTalepKategori(e.target.value)}>
                                    <option value="Asansör Arızası">Asansör Arızası</option>
                                    <option value="Temizlik Şikayeti">Temizlik Şikayeti</option>
                                    <option value="Güvenlik / Otopark">Güvenlik / Otopark</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                                <label style={{fontWeight:'600', marginTop:'15px', display:'block'}}>Açıklama</label>
                                <textarea className="form-control" style={{height:'100px'}} value={talepAciklama} onChange={(e)=>setTalepAciklama(e.target.value)}></textarea>
                                <button className="btn" onClick={handleTalepGonder}>Yönetime İlet</button>
                            </div>
                            <div className="card">
                                <h3><i className="fas fa-clipboard-list"></i> Geçmiş Talepleriniz</h3>
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead><tr><th>Tarih</th><th>Kategori</th><th>Durum</th><th>Detay</th></tr></thead>
                                        <tbody>
                                            {taleplerim.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center'}}>Talep geçmişiniz boş.</td></tr> : taleplerim.map((t, i) => (
                                                <tr key={i}>
                                                    <td>{t.tarih}</td><td>{t.kategori}</td>
                                                    <td><span className={`status-badge ${t.durum === 'Çözüldü' ? 'success' : t.durum === 'İnceleniyor' ? 'warning' : 'info'}`}>{t.durum}</span></td>
                                                    <td><button className="btn-sm-gray" onClick={() => setTalepModalData(t)}>İncele</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rezervasyon' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Ortak Alan Rezervasyonu</h2>
                        <div className="dashboard-grid">
                            <div className="card">
                                <h3><i className="fas fa-swimmer"></i> Tesis Seç ve Rezerve Et</h3>
                                <select className="form-control" value={rezTesis} onChange={e => setRezTesis(e.target.value)}>
                                    <option value="Açık Havuz">Açık Havuz</option>
                                    <option value="Spor Salonu">Spor Salonu</option>
                                    <option value="Toplantı Salonu">Toplantı Salonu</option>
                                </select>
                                <div className="calendar-sim">
                                    {['Pt', 'Sa', 'Ça', 'Pe'].map((d, i) => (
                                        <div key={i} className={`day ${seciliGun === i+10 ? 'active' : ''}`} onClick={() => setSeciliGun(i+10)}>
                                            <span className="day-number">{i+10}</span>
                                            <span className="day-name">{d}</span>
                                        </div>
                                    ))}
                                </div>
                                <select className="form-control" style={{marginTop:'15px'}} value={rezSaat} onChange={e => setRezSaat(e.target.value)}>
                                    <option value="10:00 - 12:00">10:00 - 12:00</option>
                                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                                </select>
                                <button className="btn" onClick={handleRezervasyonYap}>Rezerve Et</button>
                            </div>
                            
                            <div className="card" style={{gridColumn: '1 / -1'}}>
                                <h3>Mevcut Rezervasyonlarınız</h3>
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead><tr><th>Tesis</th><th>Gün</th><th>Saat</th><th>Durum</th></tr></thead>
                                        <tbody>
                                            {rezervasyonlar.length === 0 ? 
                                                <tr><td colSpan="4" style={{textAlign:'center', color:'#888', padding:'20px'}}>Aktif rezervasyon yok.</td></tr>
                                            : rezervasyonlar.map((r,i) => (
                                                <tr key={i}>
                                                    <td><b>{r.tesisAdi}</b></td><td>{r.tarih}</td><td>{r.saatAraligi}</td>
                                                    <td><span className={`status-badge ${r.durum === 'Bekliyor' ? 'pending' : r.durum==='Onaylandı' ? 'success' : 'danger'}`}>{r.durum}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'belgeler' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Sistemdeki Açık Belgeler</h2>
                        <div className="card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Belge Adı</th><th>Tarih</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {dokumanlar.length === 0 ? <tr><td colSpan="3">Belge bulunamadı.</td></tr> : dokumanlar.map((d,i) => (
                                            <tr key={i}>
                                                <td><i className="far fa-file-pdf" style={{color:'var(--danger)'}}></i> <b>{d.isim}</b></td>
                                                <td>{d.yuklemeTarihi}</td>
                                                <td>
                                                    <button className="btn-sm-gray" onClick={() => downloadFile(`/dokuman/indir/${d.id}`, d.isim, 'customerToken')}>
                                                        <i className="fas fa-download"></i> İndir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Profili Güncelle</h3>
                        <div className="form-group">
                            <label>Telefon Numarası</label>
                            <input type="text" className="form-control" value={profil.telefon} onChange={(e)=>setProfil({...profil, telefon: e.target.value})}/>
                        </div>
                        <div className="form-group">
                            <label>Araç Plakası</label>
                            <input type="text" className="form-control" value={profil.plaka} onChange={(e)=>setProfil({...profil, plaka: e.target.value})} placeholder="Örn: 34 ABC 123"/>
                        </div>
                        <button className="btn" onClick={handleProfilGuncelle}>Kaydet</button>
                        <button className="btn" style={{background:'#ccc', color:'#333', marginTop: '10px'}} onClick={() => setShowProfileModal(false)}>İptal</button>
                    </div>
                </div>
            )}

            {talepModalData && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Talep Detayı</h3>
                        <p><strong>Kategori:</strong> {talepModalData.kategori}</p>
                        <p><strong>Tarih:</strong> {talepModalData.tarih}</p>
                        <p><strong>Durum:</strong> <span className={`status-badge ${talepModalData.durum === 'Çözüldü' ? 'success' : 'info'}`}>{talepModalData.durum}</span></p>
                        <p style={{marginTop:'15px'}}><strong>Açıklama Metni:</strong></p>
                        <div style={{background:'#f4f7f6', padding:'15px', borderRadius:'8px', marginTop:'5px'}}>{talepModalData.aciklama}</div>
                        <button className="btn" style={{background:'#ccc', color:'#333', marginTop:'20px'}} onClick={() => setTalepModalData(null)}>Kapat</button>
                    </div>
                </div>
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({...toast, show: false})} />
        </div>
    );
};

export default CustomerDashboard;