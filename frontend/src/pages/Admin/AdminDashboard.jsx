import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/apiClient';
import Sidebar from '../../components/layout/Sidebar';
import Toast from '../../components/ui/Toast';
import './Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'dashboard');
    const [innerTab, setInnerTab] = useState('tab-genel');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    // --- VERİ DURUMLARI (STATES) ---
    const [finans, setFinans] = useState([]);
    const [kayitlar, setKayitlar] = useState([]);
    const [arizalar, setArizalar] = useState([]);
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [bakimlar, setBakimlar] = useState([]);
    const [tedarikciler, setTedarikciler] = useState([]);
    const [dokumanlar, setDokumanlar] = useState([]);

    // --- FORM DURUMLARI ---
    const [aidatTutar, setAidatTutar] = useState('');
    const [sakinForm, setSakinForm] = useState({ BlokDaire: '', AdSoyad: '', Telefon: '', KullaniciAdi: '', Sifre: '' });
    const [bakimForm, setBakimForm] = useState({ Tur: '', Tarih: '', Maliyet: '', Frekans: '1', Birim: 'Ay' });
    const [tedarikciForm, setTedarikciForm] = useState({ Isim: '', Alan: '', Tel: '' });
    const [dokumanForm, setDokumanForm] = useState({ Isim: '', ErisimTipi: 'Herkese Açık' });

    // --- MODAL DURUMLARI ---
    const [nlpModalData, setNlpModalData] = useState(null);

    // Sekme değiştiğinde verileri çek ve kaydet
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
        fetchData();
    }, [activeTab]);

    const triggerToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
    const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login'); };

    const fetchData = async () => {
        try {
            if (['dashboard', 'aidatlar'].includes(activeTab)) setFinans(await apiCall('/finans/hepsini-getir', 'GET', null, 'adminToken'));
            if (['kayitlar', 'aidatlar'].includes(activeTab)) setKayitlar(await apiCall('/kullanici/listele', 'GET', null, 'adminToken'));
            if (['dashboard', 'arizalar'].includes(activeTab)) setArizalar(await apiCall('/talepler/hepsini-getir', 'GET', null, 'adminToken'));
            if (activeTab === 'rezervasyonlar') setRezervasyonlar(await apiCall('/rezervasyon/hepsini-getir', 'GET', null, 'adminToken'));
            if (activeTab === 'bakimlar') setBakimlar(await apiCall('/bakim/listele', 'GET', null, 'adminToken'));
            if (activeTab === 'tedarikciler') setTedarikciler(await apiCall('/tedarikci/listele', 'GET', null, 'adminToken'));
            if (activeTab === 'dokumanlar') setDokumanlar(await apiCall('/dokuman/listele', 'GET', null, 'adminToken'));
        } catch (error) { console.error(error); }
    };

    // --- İŞLEM FONKSİYONLARI ---
    const handleAidatBorclandir = async () => {
        if (!aidatTutar) return triggerToast("Lütfen tutar girin.", "warning");
        const ilkSakin = kayitlar[0]?.id;
        if (!ilkSakin) return triggerToast("Borçlandırılacak sakin bulunamadı.", "danger");

        try {
            await apiCall('/finans/borclandir', 'POST', { 
                KullaniciId: ilkSakin, Donem: new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' }), 
                Aciklama: 'Yönetim Aidat Borçlandırması', Tutar: parseFloat(aidatTutar) 
            }, 'adminToken');
            triggerToast("Borçlandırma başarılı.", "success");
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleSakinKaydet = async () => {
        try {
            await apiCall('/kullanici/ekle', 'POST', sakinForm, 'adminToken');
            triggerToast("Sakin kaydedildi.", "success");
            setSakinForm({ BlokDaire: '', AdSoyad: '', Telefon: '', KullaniciAdi: '', Sifre: '' });
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleSakinSil = async (id) => {
        if (!window.confirm("Emin misiniz?")) return;
        try { await apiCall(`/kullanici/sil/${id}`, 'DELETE', null, 'adminToken'); triggerToast("Silindi.", "success"); fetchData(); } catch (e) { }
    };

    const handleTalepDurumUpdate = async (id, yeniDurum) => {
        try { await apiCall(`/talepler/durum-guncelle/${id}`, 'PUT', { durum: parseInt(yeniDurum) }, 'adminToken'); triggerToast("Durum güncellendi.", "success"); fetchData(); } catch (e) { }
    };

    const handleRezervasyonUpdate = async (id, yeniDurum) => {
        try { await apiCall(`/rezervasyon/durum-guncelle/${id}`, 'PUT', { durum: parseInt(yeniDurum) }, 'adminToken'); triggerToast("Rezervasyon güncellendi.", "success"); fetchData(); } catch (e) { }
    };

    const handleBakimEkle = async () => {
        try {
            await apiCall('/bakim/ekle', 'POST', { tur: bakimForm.Tur, tarih: bakimForm.Tarih, maliyet: parseFloat(bakimForm.Maliyet || 0), periyot: `${bakimForm.Frekans} ${bakimForm.Birim}` }, 'adminToken');
            triggerToast("Bakım eklendi.", "success");
            setBakimForm({ Tur: '', Tarih: '', Maliyet: '', Frekans: '1', Birim: 'Ay' });
            fetchData();
        } catch (e) { }
    };

    const handleTedarikciEkle = async () => {
        try {
            await apiCall('/tedarikci/ekle', 'POST', { isim: tedarikciForm.Isim, alan: tedarikciForm.Alan, tel: tedarikciForm.Tel }, 'adminToken');
            triggerToast("Usta eklendi.", "success");
            setTedarikciForm({ Isim: '', Alan: '', Tel: '' });
            fetchData();
        } catch (e) { }
    };

    const handleDokumanYukle = async () => {
        try {
            await apiCall('/dokuman/yukle', 'POST', { isim: dokumanForm.Isim, erisimTipi: dokumanForm.ErisimTipi }, 'adminToken');
            triggerToast("Belge yüklendi.", "success");
            setDokumanForm({ Isim: '', ErisimTipi: 'Herkese Açık' });
            fetchData();
        } catch (e) { }
    };

    // --- MENÜ LİSTESİ ---
    const sidebarLinks = [
        { id: 'dashboard', label: 'Yönetim Özeti', icon: 'fa-chart-pie' },
        { id: 'aidatlar', label: 'Aidat & Finans', icon: 'fa-coins' },
        { id: 'kayitlar', label: 'Daire & Sakinler', icon: 'fa-users' },
        { id: 'arizalar', label: 'NLP Talep Analizi', icon: 'fa-brain' },
        { id: 'rezervasyonlar', label: 'Rezervasyonlar', icon: 'fa-calendar-check' },
        { id: 'bakimlar', label: 'Planlı Bakımlar', icon: 'fa-wrench' },
        { id: 'tedarikciler', label: 'Usta & Tedarikçi', icon: 'fa-hard-hat' },
        { id: 'dokumanlar', label: 'Sistem Belgeleri', icon: 'fa-file-pdf' },
        { id: 'giriscikis', label: 'Güvenlik Logları', icon: 'fa-shield-alt' }
    ];

    return (
        <div className="admin-layout">
            <Sidebar title="ELİT YÖNETİM" links={sidebarLinks} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            
            <div className="main-content">
                <header className="header">
                    <h1 id="view-title" style={{textTransform:'capitalize'}}>{activeTab.replace('lar','lar /').replace('giriscikis','Güvenlik Logları')}</h1>
                    <div className="user-profile">
                        <div className="user-avatar"><i className="fas fa-user-tie"></i></div>
                        <div>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block' }}>Yönetici Paneli</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tam Yetki</span>
                        </div>
                    </div>
                </header>

                {/* YÖNETİM ÖZETİ (DASHBOARD) */}
                {activeTab === 'dashboard' && (
                    <div className="view-section active">
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div className="data-card" style={{ margin: 0, textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-color), #2a3c8c)', color: 'white' }}>
                                <h4 style={{ color: 'var(--bg-light)', fontSize: '0.9rem' }}>Toplam Kasa (Nakit)</h4>
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--accent-color)' }}>142.400 ₺</h2>
                            </div>
                            <div className="data-card" style={{ margin: 0, textAlign: 'center', borderBottom: '4px solid var(--danger)' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bekleyen Tahsilat</h4>
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--danger)' }}>18.150 ₺</h2>
                            </div>
                            <div className="data-card" style={{ margin: 0, textAlign: 'center', borderBottom: '4px solid var(--info)' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aktif Talepler</h4>
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--primary-color)' }}>{arizalar.length}</h2>
                            </div>
                            <div className="data-card" style={{ margin: 0, textAlign: 'center', borderBottom: '4px solid var(--success)' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam Daire / Doluluk</h4>
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--success)' }}>40 / %95</h2>
                            </div>
                        </div>
                        
                        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '25px' }}>
                            <div className="data-card" style={{ margin: 0 }}>
                                <h3><i className="fas fa-list"></i> Son Finansal Hareketler</h3>
                                <table className="data-table">
                                    <thead><tr><th>Tarih</th><th>Açıklama</th><th>Tip</th><th>Tutar</th></tr></thead>
                                    <tbody>
                                        {finans.slice(0,5).map((f, i) => (
                                            <tr key={i}><td>{f.tarih}</td><td>{f.aciklama}</td><td><span className={`badge ${f.tip==='Gelir'?'success':'danger'}`}>{f.tip}</span></td><td><strong>{f.tutar} ₺</strong></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="data-card" style={{ margin: 0 }}>
                                <h3><i className="fas fa-bolt"></i> Hızlı Aksiyonlar</h3>
                                <button className="btn-outline" onClick={() => setActiveTab('aidatlar')}>Toplu Aidat Borçlandır</button>
                                <button className="btn-outline" onClick={() => setActiveTab('arizalar')}>NLP Raporlarını İncele</button>
                                <button className="btn-outline" onClick={() => setActiveTab('bakimlar')}>Yaklaşan Bakımları Gör</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AİDATLAR */}
                {activeTab === 'aidatlar' && (
                    <div className="view-section active">
                        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="data-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3><i className="fas fa-coins"></i> Manuel Aidat Belirleme</h3>
                                    <button className="btn-action" style={{ width: 'auto', background: 'var(--success)', padding: '8px 15px' }} onClick={handleAidatBorclandir}>Borçlandır</button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <div className="input-wrapper" style={{ margin: 0, flex: 1.5 }}><label>Tüm Daireler İçin Tutar (₺)</label><input type="number" className="form-control" value={aidatTutar} onChange={e=>setAidatTutar(e.target.value)} /></div>
                                </div>
                            </div>
                            <div className="data-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3><i className="fas fa-calendar-check"></i> Otomatik Aidat İşleme</h3>
                                    <button className="btn-action" style={{ width: 'auto', padding: '8px 15px' }} onClick={()=>triggerToast('Plan kaydedildi.','success')}>Planı Kaydet</button>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Her ayın seçili gününde otomatik borçlandırır.</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <div className="input-wrapper" style={{ margin: 0, flex: 1 }}><label>İşlem Günü</label><input type="number" className="form-control" /></div>
                                    <div className="input-wrapper" style={{ margin: 0, flex: 1.5 }}><label>Sabit Tutar (₺)</label><input type="number" className="form-control" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="data-card">
                            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border)', paddingBottom: '15px' }}>
                                <button className={`inner-tab-btn ${innerTab==='tab-genel'?'active':''}`} onClick={()=>setInnerTab('tab-genel')}>Genel Durum</button>
                            </div>
                            {innerTab === 'tab-genel' && (
                                <table className="data-table">
                                    <thead><tr><th>Daire</th><th>Sakin</th><th>Dönem Borcu</th><th>Durum</th></tr></thead>
                                    <tbody>
                                        {finans.map((f, i) => (
                                            <tr key={i}><td>{f.blokDaire}</td><td>{f.kullaniciAdi}</td><td><strong>{f.tutar} ₺</strong></td><td><span className={`badge ${f.durum==='Ödendi'?'success':'danger'}`}>{f.durum}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* SAKİNLER & KAYITLAR */}
                {activeTab === 'kayitlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-user-plus"></i> Yeni Sakin ve Sistem Hesabı Oluştur</h3>
                            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', marginTop: '15px', gap: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Blok / Kapı No</label><input type="text" className="form-control" value={sakinForm.BlokDaire} onChange={e=>setSakinForm({...sakinForm, BlokDaire:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Ad Soyad</label><input type="text" className="form-control" value={sakinForm.AdSoyad} onChange={e=>setSakinForm({...sakinForm, AdSoyad:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Telefon</label><input type="text" className="form-control" value={sakinForm.Telefon} onChange={e=>setSakinForm({...sakinForm, Telefon:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Kullanıcı Adı</label><input type="text" className="form-control" value={sakinForm.KullaniciAdi} onChange={e=>setSakinForm({...sakinForm, KullaniciAdi:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Geçici Şifre</label><input type="password" className="form-control" value={sakinForm.Sifre} onChange={e=>setSakinForm({...sakinForm, Sifre:e.target.value})} /></div>
                                <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'flex-end' }}>
                                    <button className="btn-action" style={{ width: 'auto' }} onClick={handleSakinKaydet}>Hesabı ve Sakini Kaydet</button>
                                </div>
                            </div>
                        </div>
                        <div className="data-card">
                            <table className="data-table">
                                <thead><tr><th>Hesap ID</th><th>Kullanıcı Adı</th><th>Blok/Daire</th><th>Sakin Adı</th><th>Telefon</th><th>Durum</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {kayitlar.map(k => (
                                        <tr key={k.id}>
                                            <td><strong>#{k.id}</strong></td><td>{k.kullaniciAdi}</td><td>{k.blokDaire}</td><td>{k.adSoyad}</td><td>{k.telefon}</td>
                                            <td><span className={`badge ${k.aktifMi?'success':'danger'}`}>{k.aktifMi?'Aktif':'Pasif'}</span></td>
                                            <td><button className="btn-sm btn-delete" onClick={()=>handleSakinSil(k.id)}><i className="fas fa-trash"></i> Sil</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ARIZALAR / TALEPLER */}
                {activeTab === 'arizalar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-brain"></i> Gelen Arıza Biletleri (NLP Destekli)</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Sistem, model ile gelen mesajların aciliyetini ve duygu durumunu saptar.</p>
                            <table className="data-table">
                                <thead><tr><th>Daire/ID</th><th>Tarih</th><th>NLP Kategori</th><th>Aciliyet</th><th>Duygu Durumu</th><th>İşlem</th><th>Aksiyon</th></tr></thead>
                                <tbody>
                                    {arizalar.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.blokDaire} / #{a.id}</td><td>{a.tarih}</td><td><strong>{a.kategori}</strong></td>
                                            <td><span className={`badge ${a.aciliyet==='Yuksek'?'danger':'info'}`}>{a.aciliyet}</span></td><td>{a.duyguDurumu}</td>
                                            <td>
                                                <select className="form-control" style={{ width: 'auto', padding: '5px', margin: 0 }} value={['Inceleniyor','IslemeAlindi','Cozuldu'].indexOf(a.durum)} onChange={(e) => handleTalepDurumUpdate(a.id, e.target.value)}>
                                                    <option value="0">İnceleniyor</option><option value="1">İşleme Alındı</option><option value="2">Çözüldü</option>
                                                </select>
                                            </td>
                                            <td><button className="btn-sm" style={{background:'var(--info)'}} onClick={() => setNlpModalData(a)}><i className="fas fa-eye"></i> İncele</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* REZERVASYONLAR */}
                {activeTab === 'rezervasyonlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3>Tüm Rezervasyon Geçmişi ve Onay Bekleyenler</h3>
                            <table className="data-table">
                                <thead><tr><th>Tesis</th><th>Sakin (Daire)</th><th>Tarih & Saat</th><th>Durum</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {rezervasyonlar.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.tesisAdi}</td><td>{r.kullaniciAdi}</td><td>{r.tarih} - {r.saatAraligi}</td>
                                            <td><span className={`badge ${r.durum==='Onaylandi'?'success':r.durum==='Reddedildi'?'danger':'warning'}`}>{r.durum}</span></td>
                                            <td>
                                                {r.durum === 'Bekliyor' ? (
                                                    <>
                                                        <button className="btn-sm" style={{background:'var(--success)'}} onClick={()=>handleRezervasyonUpdate(r.id, 1)}>Kabul</button>
                                                        <button className="btn-sm btn-delete" onClick={()=>handleRezervasyonUpdate(r.id, 2)}>Red</button>
                                                    </>
                                                ) : <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Tamamlandı</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BAKIMLAR */}
                {activeTab === 'bakimlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-plus-circle"></i> Planlı Bakım Ekle</h3>
                            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr auto', alignItems: 'end', marginTop: '15px', gap: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Bakım Türü / Adı</label><input type="text" className="form-control" value={bakimForm.Tur} onChange={e=>setBakimForm({...bakimForm, Tur:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Tarih</label><input type="date" className="form-control" value={bakimForm.Tarih} onChange={e=>setBakimForm({...bakimForm, Tarih:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}><label>Tekrar</label><input type="number" className="form-control" value={bakimForm.Frekans} onChange={e=>setBakimForm({...bakimForm, Frekans:e.target.value})} /></div>
                                    <div style={{ flex: 1.5 }}><label>&nbsp;</label>
                                        <select className="form-control" value={bakimForm.Birim} onChange={e=>setBakimForm({...bakimForm, Birim:e.target.value})}>
                                            <option value="Tek Sefer">Tek Sefer</option><option value="Ay">Ay</option><option value="Yıl">Yıl</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Tahmini Maliyet</label><input type="number" className="form-control" value={bakimForm.Maliyet} onChange={e=>setBakimForm({...bakimForm, Maliyet:e.target.value})} /></div>
                                <button className="btn-action" style={{ width: 'auto' }} onClick={handleBakimEkle}>Takvime İşle</button>
                            </div>
                        </div>
                        <div className="data-card">
                            <table className="data-table">
                                <thead><tr><th>Bakım Türü</th><th>Tarih</th><th>Maliyet</th><th>Periyot</th><th>Durum</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {bakimlar.map(b => (
                                        <tr key={b.id}><td>{b.tur}</td><td>{b.tarih}</td><td>{b.maliyet} ₺</td><td>{b.periyot}</td><td>{b.durum}</td><td><button className="btn-sm btn-delete" onClick={async()=>{await apiCall(`/bakim/sil/${b.id}`,'DELETE',null,'adminToken'); fetchData();}}><i className="fas fa-trash"></i></button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TEDARİKÇİLER */}
                {activeTab === 'tedarikciler' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-hard-hat"></i> Yeni Usta / Tedarikçi Ekle</h3>
                            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end', gap: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Firma Adı</label><input type="text" className="form-control" value={tedarikciForm.Isim} onChange={e=>setTedarikciForm({...tedarikciForm, Isim:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Uzmanlık Alanı</label><input type="text" className="form-control" value={tedarikciForm.Alan} onChange={e=>setTedarikciForm({...tedarikciForm, Alan:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Telefon</label><input type="text" className="form-control" value={tedarikciForm.Tel} onChange={e=>setTedarikciForm({...tedarikciForm, Tel:e.target.value})} /></div>
                                <button className="btn-action" style={{ width: 'auto' }} onClick={handleTedarikciEkle}>Rehbere Ekle</button>
                            </div>
                        </div>
                        <div className="data-card">
                            <table className="data-table">
                                <thead><tr><th>Firma / Usta Adı</th><th>Uzmanlık Alanı</th><th>İletişim</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {tedarikciler.map(t => (
                                        <tr key={t.id}><td>{t.isim}</td><td>{t.alan}</td><td>{t.tel}</td><td><button className="btn-sm btn-delete" onClick={async()=>{await apiCall(`/tedarikci/sil/${t.id}`,'DELETE',null,'adminToken'); fetchData();}}><i className="fas fa-trash"></i></button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DOKÜMANLAR */}
                {activeTab === 'dokumanlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-cloud-upload-alt"></i> Belge Yönetimi</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0, flex: 2 }}><label>Belge Adı</label><input type="text" className="form-control" value={dokumanForm.Isim} onChange={e=>setDokumanForm({...dokumanForm, Isim:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0, flex: 1 }}><label>Görünürlük</label>
                                    <select className="form-control" value={dokumanForm.ErisimTipi} onChange={e=>setDokumanForm({...dokumanForm, ErisimTipi:e.target.value})}>
                                        <option value="Yönetime Özel">Sadece Yönetim</option><option value="Herkese Açık">Sakinlere Açık (Public)</option>
                                    </select>
                                </div>
                                <button className="btn-action" style={{ width: 'auto' }} onClick={handleDokumanYukle}>Sisteme Yükle</button>
                            </div>
                        </div>
                        <div className="data-card">
                            <table className="data-table">
                                <thead><tr><th>Belge Adı</th><th>Yükleme Tarihi</th><th>Erişim Tipi</th><th>İşlem</th></tr></thead>
                                <tbody>
                                    {dokumanlar.map(d => (
                                        <tr key={d.id}>
                                            <td><i className="far fa-file-pdf" style={{color:'var(--danger)'}}></i> {d.isim}</td><td>{d.yuklemeTarihi}</td><td><span className="badge info">{d.erisimTipi}</span></td>
                                            <td>
                                                <button className="btn-sm-gray" onClick={()=>window.open(`http://localhost:5000/api/dokuman/indir/${d.id}`, '_blank')}><i className="fas fa-download"></i> İndir</button>
                                                <button className="btn-sm btn-delete" onClick={async()=>{await apiCall(`/dokuman/sil/${d.id}`,'DELETE',null,'adminToken'); fetchData();}}><i className="fas fa-trash"></i> Sil</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* GÜVENLİK LOGLARI (Sadece Mock Frontend Görüntüsü Olarak İstenmişti) */}
                {activeTab === 'giriscikis' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3><i className="fas fa-video"></i> Güvenlik / Geçiş Logları</h3>
                                <input type="text" className="form-control" placeholder="🔍 Loglarda ara..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ margin: 0, width: '250px' }} />
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Tarih & Zaman</th><th>Kişi / Sistem ID</th><th>Tip</th><th>Nokta</th></tr></thead>
                                <tbody>
                                    {[{t:'Bugün 08:15',k:'Tuğba Yılmaz',tp:'Araç Girişi',n:'Otopark A Kapısı'},{t:'Bugün 09:20',k:'Kargo Şirketi',tp:'Yaya Girişi',n:'Ana Nizamıye'}]
                                    .filter(lg => lg.k.toLowerCase().includes(searchTerm.toLowerCase()) || lg.tp.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((lg,i) => <tr key={i}><td>{lg.t}</td><td>{lg.k}</td><td>{lg.tp}</td><td>{lg.n}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* NLP MODAL */}
            {nlpModalData && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <h3 style={{ color: 'var(--primary-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px' }}><i className="fas fa-robot"></i> NLP Analiz Detayı</h3>
                        <p style={{ marginTop: '15px' }}><strong>Ham Müşteri Metni:</strong></p>
                        <div style={{ background: 'var(--bg-light)', padding: '15px', borderRadius: '8px', fontStyle: 'italic', marginTop: '5px', color: 'var(--text-main)' }}>{nlpModalData.hamMetin}</div>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                            <div style={{ flex: 1, background: '#e8f4fd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>Kategori</p><p style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: '600' }}>{nlpModalData.kategori}</p>
                            </div>
                            <div style={{ flex: 1, background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>Duygu</p><p style={{ fontSize: '1.1rem', color: '#92400e', fontWeight: '600' }}>{nlpModalData.duyguDurumu}</p>
                            </div>
                            <div style={{ flex: 1, background: '#f8d7da', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>Aciliyet</p><p style={{ fontSize: '1.1rem', color: '#721c24', fontWeight: '600' }}>{nlpModalData.aciliyet}</p>
                            </div>
                        </div>
                        <button className="btn-action" style={{ marginTop: '20px', background: '#ccc', color: '#333' }} onClick={() => setNlpModalData(null)}>Kapat</button>
                    </div>
                </div>
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};

export default AdminDashboard;