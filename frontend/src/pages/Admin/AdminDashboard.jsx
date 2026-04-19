import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, downloadFile } from '../../api/apiClient';
import Sidebar from '../../components/layout/Sidebar';
import Toast from '../../components/ui/Toast';
import './Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'dashboard');
    const [innerTab, setInnerTab] = useState('tab-genel');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // State ve Ref'ler
    const dosyaInputRef = useRef(null);

    const [finans, setFinans] = useState([]);
    const [kayitlar, setKayitlar] = useState([]);
    const [arizalar, setArizalar] = useState([]);
    const [rezervasyonlar, setRezervasyonlar] = useState([]);
    const [bakimlar, setBakimlar] = useState([]);
    const [tedarikciler, setTedarikciler] = useState([]);
    const [dokumanlar, setDokumanlar] = useState([]);

    const [aidatTutar, setAidatTutar] = useState('');
    const [sakinForm, setSakinForm] = useState({ BlokDaire: '', AdSoyad: '', Telefon: '', Plaka: '', KullaniciAdi: '', Sifre: '' });
    const [bakimForm, setBakimForm] = useState({ Tur: '', Tarih: '', Maliyet: '', Frekans: '1', Birim: 'Ay' });
    const [tedarikciForm, setTedarikciForm] = useState({ Isim: '', Alan: '', Tel: '' });
    const [dokumanForm, setDokumanForm] = useState({ Isim: '', ErisimTipi: 'Herkese Açık' });
    const [dosya, setDosya] = useState(null);

    const [nlpModalData, setNlpModalData] = useState(null);

    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
        fetchData();
    }, [activeTab]);

    const triggerToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });
    const handleLogout = () => { localStorage.removeItem('adminToken'); navigate('/login'); };

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

    const getZamanDurumu = (tarihStr) => {
        const [d, m, y] = tarihStr.split('.');
        const islemTarihi = new Date(`${y}-${m}-${d}`);
        const bugun = new Date();
        bugun.setHours(0,0,0,0);

        if (islemTarihi.getTime() === bugun.getTime()) return <span className="badge warning">Bugün</span>;
        if (islemTarihi.getTime() < bugun.getTime()) return <span className="badge danger">Süresi Geçti</span>;
        return <span className="badge info">Yaklaşıyor</span>;
    };

    const handleAidatBorclandir = async () => {
        if (!aidatTutar) return triggerToast("Lütfen tutar girin.", "warning");
        try {
            await apiCall('/finans/borclandir', 'POST', { 
                KullaniciId: 'ALL', Donem: new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' }), 
                Aciklama: 'Yönetim Aidat Borçlandırması', Tutar: parseFloat(aidatTutar) 
            }, 'adminToken');
            triggerToast("Tüm sakinler borçlandırıldı.", "success");
            setAidatTutar('');
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleSakinKaydet = async () => {
        try {
            await apiCall('/kullanici/ekle', 'POST', sakinForm, 'adminToken');
            triggerToast("Sakin kaydedildi.", "success");
            setSakinForm({ BlokDaire: '', AdSoyad: '', Telefon: '', Plaka: '', KullaniciAdi: '', Sifre: '' });
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleSakinSil = async (id) => {
        if (!window.confirm("Emin misiniz?")) return;
        try { await apiCall(`/kullanici/sil/${id}`, 'DELETE', null, 'adminToken'); triggerToast("Silindi.", "success"); fetchData(); } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleTalepDurumUpdate = async (id, yeniDurum) => {
        try { await apiCall(`/talepler/durum-guncelle/${id}`, 'PUT', { durum: parseInt(yeniDurum) }, 'adminToken'); triggerToast("Durum güncellendi.", "success"); fetchData(); } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleRezervasyonUpdate = async (id, yeniDurum) => {
        try { await apiCall(`/rezervasyon/durum-guncelle/${id}`, 'PUT', { durum: parseInt(yeniDurum) }, 'adminToken'); triggerToast("Rezervasyon güncellendi.", "success"); fetchData(); } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleBakimEkle = async () => {
        try {
            await apiCall('/bakim/ekle', 'POST', { tur: bakimForm.Tur, tarih: bakimForm.Tarih, maliyet: parseFloat(bakimForm.Maliyet || 0), periyot: `${bakimForm.Frekans} ${bakimForm.Birim}` }, 'adminToken');
            triggerToast("Bakım eklendi.", "success");
            setBakimForm({ Tur: '', Tarih: '', Maliyet: '', Frekans: '1', Birim: 'Ay' });
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleTedarikciEkle = async () => {
        try {
            await apiCall('/tedarikci/ekle', 'POST', { isim: tedarikciForm.Isim, alan: tedarikciForm.Alan, tel: tedarikciForm.Tel }, 'adminToken');
            triggerToast("Usta eklendi.", "success");
            setTedarikciForm({ Isim: '', Alan: '', Tel: '' });
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const handleDokumanYukle = async () => {
        if (!dosya) return triggerToast("Lütfen bir dosya seçin.", "warning");
        const formData = new FormData();
        formData.append('isim', dokumanForm.Isim);
        formData.append('erisimTipi', dokumanForm.ErisimTipi);
        formData.append('dosya', dosya);

        try {
            await apiCall('/dokuman/yukle', 'POST', formData, 'adminToken');
            triggerToast("Belge yüklendi.", "success");
            setDokumanForm({ Isim: '', ErisimTipi: 'Herkese Açık' });
            setDosya(null);
            if (dosyaInputRef.current) dosyaInputRef.current.value = "";
            fetchData();
        } catch (e) { triggerToast(e.message, "danger"); }
    };

    const sidebarLinks = [
        { id: 'dashboard', label: 'Yönetim Özeti', icon: 'fa-chart-pie' },
        { id: 'aidatlar', label: 'Aidat & Finans', icon: 'fa-coins' },
        { id: 'kayitlar', label: 'Daire & Sakinler', icon: 'fa-users' },
        { id: 'arizalar', label: 'NLP Talep Analizi', icon: 'fa-brain' },
        { id: 'rezervasyonlar', label: 'Rezervasyonlar', icon: 'fa-calendar-check' },
        { id: 'bakimlar', label: 'Planlı Bakımlar', icon: 'fa-wrench' },
        { id: 'tedarikciler', label: 'Usta & Tedarikçi', icon: 'fa-hard-hat' },
        { id: 'dokumanlar', label: 'Sistem Belgeleri', icon: 'fa-file-pdf' }
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
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--primary-color)' }}>{arizalar.filter(a => a.durum !== 'Çözüldü').length}</h2>
                            </div>
                            <div className="data-card" style={{ margin: 0, textAlign: 'center', borderBottom: '4px solid var(--success)' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam Daire / Doluluk</h4>
                                <h2 style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--success)' }}>40 / %95</h2>
                            </div>
                        </div>
                        
                        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', marginTop: '25px' }}>
                            <div className="data-card" style={{ margin: 0 }}>
                                <h3><i className="fas fa-list"></i> Son Finansal Hareketler</h3>
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead><tr><th>Sakin</th><th>Açıklama</th><th>Tutar</th><th>Durum</th></tr></thead>
                                        <tbody>
                                            {finans.slice(0,5).map((f, i) => (
                                                <tr key={i}><td>{f.kullaniciAdi}</td><td>{f.aciklama}</td><td><strong>{f.tutar} ₺</strong></td><td><span className={`badge ${f.durum==='Ödendi'?'success':'danger'}`}>{f.durum}</span></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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

                {activeTab === 'aidatlar' && (
                    <div className="view-section active">
                        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="data-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3><i className="fas fa-coins"></i> Toplu Aidat Borçlandırma</h3>
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
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead><tr><th>Daire</th><th>Sakin</th><th>Dönem Borcu</th><th>Durum</th></tr></thead>
                                        <tbody>
                                            {finans.map((f, i) => (
                                                <tr key={i}><td>{f.blokDaire}</td><td>{f.kullaniciAdi}</td><td><strong>{f.tutar} ₺</strong></td><td><span className={`badge ${f.durum==='Ödendi'?'success':'danger'}`}>{f.durum}</span></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'kayitlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-user-plus"></i> Yeni Sakin ve Sistem Hesabı Oluştur</h3>
                            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '15px', gap: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Blok / Kapı No</label><input type="text" className="form-control" value={sakinForm.BlokDaire} onChange={e=>setSakinForm({...sakinForm, BlokDaire:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Ad Soyad</label><input type="text" className="form-control" value={sakinForm.AdSoyad} onChange={e=>setSakinForm({...sakinForm, AdSoyad:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Telefon</label><input type="text" className="form-control" value={sakinForm.Telefon} onChange={e=>setSakinForm({...sakinForm, Telefon:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Araç Plakası</label><input type="text" className="form-control" value={sakinForm.Plaka} onChange={e=>setSakinForm({...sakinForm, Plaka:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Sistem Kullanıcı Adı</label><input type="text" className="form-control" value={sakinForm.KullaniciAdi} onChange={e=>setSakinForm({...sakinForm, KullaniciAdi:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0 }}><label>Geçici Şifre</label><input type="password" className="form-control" value={sakinForm.Sifre} onChange={e=>setSakinForm({...sakinForm, Sifre:e.target.value})} /></div>
                                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn-action" style={{ width: 'auto' }} onClick={handleSakinKaydet}>Hesabı ve Sakini Kaydet</button>
                                </div>
                            </div>
                        </div>
                        <div className="data-card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Daire</th><th>Sakin Adı</th><th>Telefon</th><th>Plaka</th><th>Kullanıcı Adı</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {kayitlar.map(k => (
                                            <tr key={k.id}>
                                                <td><strong>{k.blokDaire}</strong></td><td>{k.adSoyad}</td><td>{k.telefon}</td><td>{k.plaka || '-'}</td><td>{k.kullaniciAdi}</td>
                                                <td><button className="btn-sm btn-delete" onClick={()=>handleSakinSil(k.id)}><i className="fas fa-trash"></i> Sil</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'arizalar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-brain"></i> Gelen Arıza Biletleri (NLP Destekli)</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Sistem, model ile gelen mesajların aciliyetini ve duygu durumunu saptar.</p>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Daire</th><th>Tarih</th><th>NLP Kategori</th><th>Aciliyet</th><th>Duygu Durumu</th><th>İşlem (Durum)</th><th>Aksiyon</th></tr></thead>
                                    <tbody>
                                        {arizalar.map(a => (
                                            <tr key={a.id}>
                                                <td>{a.blokDaire}</td><td>{a.tarih}</td><td><strong>{a.kategori}</strong></td>
                                                <td><span className={`badge ${a.aciliyet==='Yuksek'?'danger':'info'}`}>{a.aciliyet}</span></td><td>{a.duyguDurumu}</td>
                                                <td>
                                                    <select className="form-control" style={{ width: 'auto', padding: '5px', margin: 0 }} value={['İnceleniyor','İşleme Alındı','Çözüldü'].indexOf(a.durum)} onChange={(e) => handleTalepDurumUpdate(a.id, e.target.value)}>
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
                    </div>
                )}

                {activeTab === 'rezervasyonlar' && (
                    <div className="view-section active">
                        <div className="dashboard-grid">
                            <div className="data-card" style={{ gridColumn: '1 / -1' }}>
                                <h3><i className="fas fa-calendar-alt"></i> Rezervasyon Ajandası (Onaylı)</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '15px' }}>
                                    {rezervasyonlar.filter(r => r.durum === 'Onaylandı').length === 0 ? <p style={{color:'var(--text-muted)'}}>Aktif onaylanmış rezervasyon yok.</p> :
                                    rezervasyonlar.filter(r => r.durum === 'Onaylandı').map((r, i) => (
                                        <div key={i} style={{ background: 'var(--bg-light)', padding: '15px', borderRadius: '10px', minWidth: '250px', borderLeft: '4px solid var(--info)' }}>
                                            <h4 style={{ color: 'var(--primary-color)', marginBottom: '5px' }}>{r.tarih}</h4>
                                            <p style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}><i className="fas fa-clock"></i> {r.saatAraligi}</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>{r.tesisAdi}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}><i className="fas fa-user"></i> {r.kullaniciAdi}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="data-card">
                            <h3>Tüm Rezervasyon Geçmişi ve Bekleyenler</h3>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Tesis</th><th>Sakin</th><th>Tarih & Saat</th><th>Durum</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {rezervasyonlar.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.tesisAdi}</td><td>{r.kullaniciAdi}</td><td>{r.tarih} - {r.saatAraligi}</td>
                                                <td><span className={`badge ${r.durum==='Onaylandı'?'success':r.durum==='Reddedildi'?'danger':'warning'}`}>{r.durum}</span></td>
                                                <td>
                                                    {r.durum === 'Bekliyor' ? (
                                                        <>
                                                            <button className="btn-sm" style={{background:'var(--success)', marginRight:'5px'}} onClick={()=>handleRezervasyonUpdate(r.id, 1)}>Kabul</button>
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
                    </div>
                )}

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
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Bakım Türü</th><th>Tarih</th><th>Maliyet</th><th>Periyot</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {bakimlar.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.tur}</td>
                                                <td>{b.tarih} {getZamanDurumu(b.tarih)}</td>
                                                <td>{b.maliyet} ₺</td>
                                                <td><span style={{ fontWeight: 'bold' }}>{b.periyot}</span> aralıklarla</td>
                                                <td><button className="btn-sm btn-delete" onClick={async()=>{await apiCall(`/bakim/sil/${b.id}`,'DELETE',null,'adminToken'); fetchData();}}><i className="fas fa-trash"></i></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

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
                            <div className="table-responsive">
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
                    </div>
                )}

                {activeTab === 'dokumanlar' && (
                    <div className="view-section active">
                        <div className="data-card">
                            <h3><i className="fas fa-cloud-upload-alt"></i> Belge Yönetimi</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginTop: '15px' }}>
                                <div className="input-wrapper" style={{ margin: 0, flex: 1 }}><label>Belge Adı</label><input type="text" className="form-control" value={dokumanForm.Isim} onChange={e=>setDokumanForm({...dokumanForm, Isim:e.target.value})} /></div>
                                <div className="input-wrapper" style={{ margin: 0, flex: 1.5 }}><label>Dosya Seç</label>
                                    <input type="file" ref={dosyaInputRef} className="form-control" onChange={(e)=>setDosya(e.target.files[0])} />
                                </div>
                                <div className="input-wrapper" style={{ margin: 0, flex: 1 }}><label>Görünürlük</label>
                                    <select className="form-control" value={dokumanForm.ErisimTipi} onChange={e=>setDokumanForm({...dokumanForm, ErisimTipi:e.target.value})}>
                                        <option value="Yönetime Özel">Sadece Yönetim</option><option value="Herkese Açık">Sakinlere Açık</option>
                                    </select>
                                </div>
                                <button className="btn-action" style={{ width: 'auto' }} onClick={handleDokumanYukle}>Yükle</button>
                            </div>
                        </div>
                        <div className="data-card">
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead><tr><th>Belge Adı</th><th>Yükleme Tarihi</th><th>Erişim Tipi</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {dokumanlar.map(d => (
                                            <tr key={d.id}>
                                                <td><i className="far fa-file-pdf" style={{color:'var(--danger)'}}></i> {d.isim}</td><td>{d.yuklemeTarihi}</td><td><span className="badge info">{d.erisimTipi}</span></td>
                                                <td>
                                                    <button className="btn-sm-gray" onClick={() => downloadFile(`/dokuman/indir/${d.id}`, d.isim, 'adminToken')}><i className="fas fa-download"></i> İndir</button>
                                                    <button className="btn-sm btn-delete" onClick={async()=>{await apiCall(`/dokuman/sil/${d.id}`,'DELETE',null,'adminToken'); fetchData();}}><i className="fas fa-trash"></i> Sil</button>
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