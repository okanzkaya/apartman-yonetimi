const API_BASE = "http://localhost:5000/api";

// Arkadaşının UI dilindeki Toast (Bildirim) Fonksiyonu
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':(type==='danger'?'times-circle':'info-circle')}"></i> ${message}`;
    
    if(type === 'success') toast.style.backgroundColor = 'var(--success)';
    else if(type === 'danger') toast.style.backgroundColor = 'var(--danger)';
    else if(type === 'info') toast.style.backgroundColor = 'var(--info)';

    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// GEÇİCİ VERİ TABANI
let state = {
    kayitlar: [
        { id: 1, blok: 'A', kapi: 1, isim: 'Tuğba Yılmaz', tel: '0555 123 4567', durum: 'Aktif' }
    ],
    duyurular: [
        { id: 1, tarih: '17 Nisan 2026', icerik: 'Genel kurul toplantısı 25 Nisan\'dadır.' }
    ],
    bakimlar: [
        { id: 1, tur: 'Otopark Çizgi Boyama', tarih: '25 Mayıs 2026', maliyet: '45.000 ₺', periyot: 'Tek Seferlik', sonraki: '-', durum: 'Planlandı' }
    ],
    dokumanlar: [
        { id: 1, isim: 'Nisan_Fatura.jpg', tarih: '10.04.2026' }
    ],
    randevular: [
        { id: 1, tesis: 'Spor Salonu', sakin: 'Tuğba Yılmaz (D:12)', tarih: '18 Nisan 2026 - 19:00', durum: 'Bekliyor' }
    ]
};

const core = {
    authenticate: () => {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        core.renderAll();
        showToast('Yönetici paneline başarıyla giriş yapıldı.', 'success');
    },

    renderAll: () => {
        core.renderKayitlar();
        core.renderDuyurular();
        core.renderBakimlar();
        core.renderDokumanlar();
        core.renderRandevular();
        core.fetchGelirGider();
        core.fetchAidatlar();
        core.fetchArizalar();
        core.loadAgenda();
        core.fetchGirisCikis();
    },

    // KAYITLAR
    renderKayitlar: () => {
        document.getElementById('kayit-table').innerHTML = state.kayitlar.map(k => `
            <tr>
                <td>${k.blok} Blok - No:${k.kapi}</td><td>${k.isim}</td><td>${k.tel}</td>
                <td><span class="badge ${k.durum === 'Aktif' ? 'success' : 'danger'}">${k.durum}</span></td>
                <td>
                    <button class="btn-sm btn-toggle" onclick="core.toggleKayitDurum(${k.id})"><i class="fas fa-exchange-alt"></i></button>
                    <button class="btn-sm btn-delete" onclick="core.deleteKayit(${k.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    saveKayit: () => {
        const blok = document.getElementById('txtBlok').value;
        const kapi = document.getElementById('txtKapiNo').value;
        const isim = document.getElementById('txtSakinAd').value;
        const tel = document.getElementById('txtTelefon').value;
        if(!isim) return showToast("Ad Soyad girmelisiniz!", "danger");
        
        state.kayitlar.push({ id: Date.now(), blok: blok||'A', kapi: kapi||'0', isim, tel, durum: 'Aktif' });
        core.renderKayitlar();
        showToast("Daire ve sakin başarıyla kaydedildi.");
    },
    toggleKayitDurum: (id) => { let k = state.kayitlar.find(x => x.id === id); if(k) k.durum = k.durum === 'Aktif' ? 'Pasif' : 'Aktif'; core.renderKayitlar(); },
    deleteKayit: (id) => { state.kayitlar = state.kayitlar.filter(k => k.id !== id); core.renderKayitlar(); showToast("Kayıt silindi.", "info"); },

    // DUYURULAR
    renderDuyurular: () => {
        document.getElementById('duyuru-table').innerHTML = state.duyurular.map(d => `
            <tr><td>${d.tarih}</td><td>${d.icerik}</td><td><button class="btn-sm btn-delete" onclick="core.deleteDuyuru(${d.id})"><i class="fas fa-trash"></i></button></td></tr>
        `).join('');
    },
    saveDuyuru: () => {
        const icerik = document.getElementById('txtDuyuru').value;
        if(!icerik) return showToast("Duyuru metni boş olamaz!", "danger");
        state.duyurular.push({ id: Date.now(), tarih: 'Bugün', icerik });
        core.renderDuyurular();
        showToast("Duyuru panoya asıldı!");
    },
    deleteDuyuru: (id) => { state.duyurular = state.duyurular.filter(d => d.id !== id); core.renderDuyurular(); showToast("Duyuru kaldırıldı.", "info"); },

    // RANDEVULAR
    renderRandevular: () => {
        document.getElementById('randevu-table').innerHTML = state.randevular.map(r => `
            <tr>
                <td>${r.tesis}</td><td>${r.sakin}</td><td>${r.tarih}</td>
                <td><span class="badge ${r.durum === 'Onaylandı' ? 'success' : (r.durum === 'Reddedildi' ? 'danger' : 'warning')}">${r.durum}</span></td>
                <td>
                    ${r.durum === 'Bekliyor' ? `
                        <button class="btn-sm" style="background:var(--success)" onclick="core.updateRandevu(${r.id}, 'Onaylandı')"><i class="fas fa-check"></i></button>
                        <button class="btn-sm btn-delete" onclick="core.updateRandevu(${r.id}, 'Reddedildi')"><i class="fas fa-times"></i></button>
                    ` : `<button class="btn-sm btn-delete" onclick="core.deleteRandevu(${r.id})"><i class="fas fa-trash"></i></button>`}
                </td>
            </tr>
        `).join('');
    },
    updateRandevu: (id, durum) => { let r = state.randevular.find(x => x.id === id); if(r) r.durum = durum; core.renderRandevular(); showToast(`Randevu ${durum}.`); },
    deleteRandevu: (id) => { state.randevular = state.randevular.filter(r => r.id !== id); core.renderRandevular(); showToast("Silindi.", "info"); },

    // BAKIMLAR (Dinamik Hesaplama)
    renderBakimlar: () => {
        document.getElementById('bakim-table').innerHTML = state.bakimlar.map(b => `
            <tr>
                <td><strong>${b.tur}</strong></td><td>${b.tarih}</td><td>${b.maliyet}</td>
                <td><span style="font-size:0.85rem; color:var(--text-muted)">${b.periyot}</span></td>
                <td><span style="font-weight:bold; color:var(--primary)">${b.sonraki}</span></td>
                <td><span class="badge ${b.durum === 'Tamamlandı' ? 'success' : 'info'}">${b.durum}</span></td>
                <td>
                    ${b.durum !== 'Tamamlandı' ? `<button class="btn-sm" style="background:var(--success)" onclick="core.tamamlaBakim(${b.id})"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn-sm btn-delete" onclick="core.deleteBakim(${b.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`
        ).join('');
    },
    saveBakim: () => {
        const tur = document.getElementById('txtBakimAd').value;
        const tarih = document.getElementById('txtBakimTarih').value;
        const frekans = document.getElementById('txtBakimFrekans').value;
        const birim = document.getElementById('selBakimBirim').value;
        if(!tur || !tarih) return showToast("Tür ve tarih zorunludur!", "danger");

        let periyotMetni = birim === 'Yok' ? 'Tek Seferlik' : `${frekans} ${birim}da bir`;
        let sonraki = '-';
        if(birim !== 'Yok' && frekans > 0) {
            let d = new Date(tarih);
            if(birim === 'Gün') d.setDate(d.getDate() + parseInt(frekans));
            if(birim === 'Ay') d.setMonth(d.getMonth() + parseInt(frekans));
            if(birim === 'Yıl') d.setFullYear(d.getFullYear() + parseInt(frekans));
            sonraki = d.toISOString().split('T')[0]; 
        }

        state.bakimlar.push({ id: Date.now(), tur, tarih, maliyet: document.getElementById('txtBakimMaliyet').value + ' ₺', periyot: periyotMetni, sonraki, durum: 'Planlandı' });
        core.renderBakimlar();
        showToast("Bakım takvime işlendi!");
    },
    tamamlaBakim: (id) => { let b = state.bakimlar.find(x => x.id === id); if(b) b.durum = 'Tamamlandı'; core.renderBakimlar(); showToast("Bakım tamamlandı işaretlendi."); },
    deleteBakim: (id) => { state.bakimlar = state.bakimlar.filter(b => b.id !== id); core.renderBakimlar(); showToast("İptal edildi.", "info"); },

    // DOKÜMANLAR
    renderDokumanlar: () => {
        document.getElementById('dokuman-table').innerHTML = state.dokumanlar.map(d => `
            <tr><td>${d.isim}</td><td>${d.tarih}</td><td><button class="btn-sm btn-toggle" onclick="showToast('İndiriliyor...', 'info')"><i class="fas fa-download"></i></button> <button class="btn-sm btn-delete" onclick="core.deleteDokuman(${d.id})"><i class="fas fa-trash"></i></button></td></tr>
        `).join('');
    },
    uploadDokuman: () => {
        const isim = document.getElementById('txtBelgeAd').value;
        if(!isim) return showToast("Belge adı girin!", "danger");
        state.dokumanlar.push({ id: Date.now(), isim, tarih: 'Bugün' });
        core.renderDokumanlar();
        showToast("Dosya buluta yüklendi.");
    },
    deleteDokuman: (id) => { state.dokumanlar = state.dokumanlar.filter(d => d.id !== id); core.renderDokumanlar(); },

    // STATİK MODÜLLER (Aidat, Arıza vb.)
    fetchAidatlar: () => {
        document.getElementById('aidat-table-all').innerHTML = `<tr><td>Daire 12</td><td>Tuğba Yılmaz</td><td>750 ₺</td><td><span class="badge success">Ödendi</span></td><td>-</td></tr>`;
        document.getElementById('aidat-table-debts').innerHTML = `<tr><td>Daire 15</td><td>Mehmet Çelik</td><td>Şubat, Mart</td><td>1.500 ₺</td><td><button class="btn-sm btn-delete">İcra Başlat</button></td></tr>`;
    },
    calculateAidat: () => showToast("Toplu aidatlar hesaplanıp borçlandırıldı!", "success"),
    fetchGelirGider: () => { document.getElementById('gelir-gider-table').innerHTML = `<tr><td>Bugün</td><td>Aidat Tahsilatı</td><td><span class="badge success">Gelir</span></td><td>+ 750 ₺</td><td>-</td></tr>`; },
    fetchArizalar: () => {
        document.getElementById('issue-table').innerHTML = `
            <tr id="ariza-1"><td>Daire 12</td><td>Aydınlatma</td><td>Koridor lambası patlamış.</td><td><span class="badge info">Nötr</span></td><td><button class="btn-sm" style="background:var(--success)" onclick="document.getElementById('ariza-1').remove(); showToast('Arıza çözüldü.');"><i class="fas fa-check"></i></button></td></tr>`;
    },
    fetchGirisCikis: () => { document.getElementById('giris-table').innerHTML = `<tr id="log-1"><td>08:30</td><td>Tuğba Yılmaz</td><td><span class="badge success">Giriş</span></td><td>Otopark</td><td><button class="btn-sm btn-delete" onclick="document.getElementById('log-1').remove()"><i class="fas fa-trash"></i></button></td></tr>`; },
    
    loadAgenda: () => {
        const slots = ["10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
        document.getElementById('agenda-grid').innerHTML = slots.map(slot => `
            <div class="agenda-slot" style="background: #dcfce7; border-color: var(--success);">
                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem; margin-bottom: 5px;">${slot}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--success);">Müsait</div>
            </div>`).join('');
    },

    // ARAYÜZ YÖNETİMİ
    switchTab: (id, el) => {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
        document.getElementById('view-title').innerText = el.innerText.trim();
    },
    switchInnerTab: (id, el) => {
        document.querySelectorAll('.inner-tab-content').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.inner-tab-btn').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
    },
    filterTable: (input, tableId) => {
        let filter = input.value.toLowerCase();
        let rows = document.getElementById(tableId).getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) rows[i].style.display = rows[i].innerText.toLowerCase().includes(filter) ? '' : 'none';
    },
    toggleUserMenu: () => document.getElementById('userMenu').classList.toggle('active'),
    logout: () => location.reload()
};

window.onclick = (e) => {
    if (!e.target.closest('.user-profile')) { let um = document.getElementById('userMenu'); if(um) um.classList.remove('active'); }
};