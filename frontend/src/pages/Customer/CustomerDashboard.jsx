import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/apiClient';
import Sidebar from '../../components/layout/Sidebar';
import Toast from '../../components/ui/Toast';
import './Customer.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('customerActiveTab') || 'anasayfa');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // Veri Stateleri
    const [finansGecmisi, setFinansGecmisi] = useState([]);
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [bakimlar, setBakimlar] = useState([]);
    const [dokumanlar, setDokumanlar] = useState([]);
    
    // Form Stateleri
    const [talepKategori, setTalepKategori] = useState('Asansör Arızası');
    const [talepAciklama, setTalepAciklama] = useState('');
    const [rezTesis, setRezTesis] = useState('Açık Havuz');
    const [rezSaat, setRezSaat] = useState('10:00 - 12:00');
    const [seciliGun, setSeciliGun] = useState(new Date().getDate());

    // Modallar
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [talepModalData, setTalepModalData] = useState(null);

    // Sekme değiştiğinde LocalStorage'a kaydet (Sayfa yenilendiğinde aynı sekmede kalır)
    useEffect(() => {
        localStorage.setItem('customerActiveTab', activeTab);
        fetchDataForTab(activeTab);
    }, [activeTab]);

    const triggerToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        navigate('/sakin/login');
    };

    const fetchDataForTab = async (tab) => {
        try {
            if (tab === 'aidat' || tab === 'anasayfa') {
                const fData = await apiCall('/finans/ekstre', 'GET', null, 'customerToken');
                setFinansGecmisi(fData);
            }
            if (tab === 'rezervasyon') {
                const rData = await apiCall('/rezervasyon/listele', 'GET', null, 'customerToken');
                setRezervasyonlar(rData);
            }
            if (tab === 'anasayfa') {
                const bData = await apiCall('/bakim/listele', 'GET', null, 'customerToken');
                setBakimlar(bData.slice(0, 3));
            }
            if (tab === 'belgeler') {
                const dData = await apiCall('/dokuman/listele', 'GET', null, 'customerToken');
                setDokumanlar(dData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- İŞLEM FONKSİYONLARI ---
    const handleAidatOde = async (id) => {
        try {
            const res = await apiCall('/finans/ode', 'POST', { id }, 'customerToken');
            triggerToast(res.mesaj || "Ödeme yapıldı.", 'success');
            fetchDataForTab('aidat');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const handleTalepGonder = async () => {
        if (!talepAciklama.trim()) return triggerToast('Lütfen bir açıklama girin.', 'danger');
        try {
            const res = await apiCall('/talepler/olustur', 'POST', { Kategori: talepKategori, Aciklama: talepAciklama }, 'customerToken');
            triggerToast(res.mesaj || "Talep iletildi.", 'success');
            setTalepAciklama('');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    const handleRezervasyonYap = async () => {
        const tarih = new Date();
        tarih.setDate(seciliGun);
        try {
            const res = await apiCall('/rezervasyon/yap', 'POST', { TesisAdi: rezTesis, SaatAraligi: rezSaat, Tarih: tarih.toISOString() }, 'customerToken');
            triggerToast(res.mesaj || "Rezervasyon alındı.", 'success');
            fetchDataForTab('rezervasyon');
        } catch (err) { triggerToast(err.message, 'danger'); }
    };

    // Sidebar Menüsü
    const sidebarLinks = [
        { id: 'anasayfa', label: 'Anasayfa', icon: 'fa-home' },
        { id: 'profil', label: 'Profil Bilgileri', icon: 'fa-user' },
        { id: 'aidat', label: 'Aidat & Ödemeler', icon: 'fa-credit-card' },
        { id: 'duyurular', label: 'Duyurular', icon: 'fa-bullhorn' },
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
                        <h2>Hoş Geldiniz, <span style={{color: 'var(--accent-color)'}}>Tuğba Yılmaz</span></h2>
                        <p>Kullanıcı ID: #1042 | A Blok / Daire 12 - Ev Sahibi</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>{new Date().toLocaleDateString('tr-TR')}</strong></p>
                        <span className="status-badge paid">Güncel Borç Yok</span>
                    </div>
                </div>

                {/* ANASAYFA */}
                {activeTab === 'anasayfa' && (
                    <div className="tab-content">
                        <div className="dashboard-grid">
                            <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--primary-color), #2a3c8c)', color: 'white' }}>
                                <h3 style={{color: 'white'}}><i className="fas fa-chart-line" style={{color: 'var(--accent-color)'}}></i> Elit Yönetim Özeti</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', textAlign: 'center' }}>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>1</h2><p style={{fontSize: '0.9rem'}}>Yeni Duyuru</p></div>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>0 TL</h2><p style={{fontSize: '0.9rem'}}>Güncel Borç</p></div>
                                    <div><h2 style={{color: 'var(--accent-color)'}}>1</h2><p style={{fontSize: '0.9rem'}}>Aktif Talebiniz</p></div>
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
                                <table className="data-table">
                                    <thead><tr><th>Bakım Türü</th><th>Tarih</th></tr></thead>
                                    <tbody>
                                        {bakimlar.map((b, i) => (
                                            <tr key={i}><td>🛠️ <b>{b.tur}</b></td><td><span style={{color:'var(--text-muted)'}}>{new Date(b.tarih).toLocaleDateString('tr-TR')}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROFIL */}
                {activeTab === 'profil' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Profil ve İletişim Bilgileri</h2>
                        <div className="card">
                            <table className="data-table">
                                <tbody>
                                    <tr><th>Kullanıcı Adı</th><td>tugba.yilmaz (1042)</td></tr>
                                    <tr><th>Ad Soyad</th><td>Tuğba Yılmaz</td></tr>
                                    <tr><th>Telefon</th><td>0555 123 45 67</td></tr>
                                    <tr><th>E-Posta</th><td>tugba.yilmaz@ornek.com</td></tr>
                                </tbody>
                            </table>
                            <button className="btn" style={{width:'auto'}} onClick={() => setShowProfileModal(true)}>Bilgileri Güncelle</button>
                        </div>
                    </div>
                )}

                {/* AIDAT */}
                {activeTab === 'aidat' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Hesap Hareketleri ve Ödemeler</h2>
                        <div className="card">
                            <table className="data-table">
                                <thead><tr><th>Dönem</th><th>Açıklama</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {finansGecmisi.map((f, i) => (
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
                )}

                {/* DUYURULAR */}
                {activeTab === 'duyurular' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Site Yönetimi Duyuruları</h2>
                        <div className="card" style={{ borderLeft: '5px solid var(--accent-color)' }}>
                            <h3 style={{marginBottom:'5px'}}>Genel Kurul Toplantısı Hakkında</h3>
                            <small style={{color:'#777'}}>17 Nisan 2026</small>
                            <p style={{marginTop:'10px'}}>Değerli sakinlerimiz, 2026 yılı olağan genel kurul toplantımız 25 Nisan Cumartesi günü gerçekleştirilecektir. Katılımınız önemle rica olunur.</p>
                        </div>
                    </div>
                )}

                {/* TALEP */}
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
                                <table className="data-table">
                                    <thead><tr><th>Tarih</th><th>Kategori</th><th>Durum</th><th>Detay</th></tr></thead>
                                    <tbody>
                                        <tr>
                                            <td>10.04.2026</td><td>Ortak Alan Aydınlatma</td><td><span className="status-badge success">Çözüldü</span></td>
                                            <td><button className="btn-sm-gray" onClick={() => setTalepModalData({kategori:'Ortak Alan Aydınlatma', durum:'Çözüldü', aciklama:'A Blok 3. kat koridor lambası patlamış, zifiri karanlık.'})}>İncele</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* REZERVASYON */}
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
                                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d, i) => (
                                        <div key={i} className={`day ${seciliGun === i+10 ? 'active' : ''}`} onClick={() => setSeciliGun(i+10)}>{i+10} {d}</div>
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
                                <table className="data-table">
                                    <thead><tr><th>Tesis</th><th>Gün</th><th>Saat</th><th>Durum</th></tr></thead>
                                    <tbody>
                                        {rezervasyonlar.length === 0 ? 
                                            <tr><td colSpan="4" style={{textAlign:'center', color:'#888', padding:'20px'}}>Aktif rezervasyon yok.</td></tr>
                                        : rezervasyonlar.map((r,i) => (
                                            <tr key={i}>
                                                <td><b>{r.tesisAdi}</b></td><td>{r.tarih}</td><td>{r.saatAraligi}</td>
                                                <td><span className={`status-badge ${r.durum === 'Bekliyor' ? 'pending' : r.durum==='Onaylandi' ? 'success' : 'danger'}`}>{r.durum}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* BELGELER */}
                {activeTab === 'belgeler' && (
                    <div className="tab-content">
                        <h2 style={{marginBottom:'20px', color:'var(--primary-color)'}}>Sistemdeki Açık Belgeler</h2>
                        <div className="card">
                            <table className="data-table">
                                <thead><tr><th>Belge Adı</th><th>Tarih</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {dokumanlar.map((d,i) => (
                                        <tr key={i}>
                                            <td><i className="far fa-file-pdf" style={{color:'var(--danger)'}}></i> <b>{d.isim}</b></td>
                                            <td>{d.yuklemeTarihi}</td>
                                            <td><button className="btn-sm-gray" onClick={() => window.open(`http://localhost:5000/api/dokuman/indir/${d.id}`, '_blank')}><i className="fas fa-download"></i> İndir</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Profili Güncelle</h3>
                        <div className="form-group"><label>Telefon Numarası</label><input type="text" className="form-control" defaultValue="0555 123 45 67"/></div>
                        <div className="form-group"><label>Araç Plakası</label><input type="text" className="form-control" defaultValue="34 ABC 123"/></div>
                        <button className="btn" onClick={() => { setShowProfileModal(false); triggerToast("Profil güncellendi.", "success"); }}>Kaydet</button>
                        <button className="btn" style={{background:'#ccc', color:'#333'}} onClick={() => setShowProfileModal(false)}>İptal</button>
                    </div>
                </div>
            )}

            {talepModalData && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Talep Detayı</h3>
                        <p><strong>Kategori:</strong> {talepModalData.kategori}</p>
                        <p><strong>Durum:</strong> <span className="status-badge success">{talepModalData.durum}</span></p>
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