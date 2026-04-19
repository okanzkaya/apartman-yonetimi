const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('adminToken') || null;

const escapeHTML = (str) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
};

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':(type==='danger'?'times-circle':'info-circle')}"></i> ${message}`;
    toast.style.backgroundColor = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : 'var(--info)');
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Token ekleyerek güvenli istek atan yardımcı fonksiyon
const fetchWithAuth = async (endpoint, options = {}) => {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${authToken}`;
    options.headers['Content-Type'] = 'application/json';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (response.status === 401) {
        showToast('Yetkisiz erişim veya oturum süresi doldu.', 'danger');
        core.logout();
        throw new Error('Unauthorized');
    }
    return response;
};

// API'den Çekilen Verilerin Durumu (State)
let state = {
    finansGecmisi: [], kayitlar: [], arizalar: [], randevular: [],
    bakimlar: [{ id: 1, tur: 'Asansör Bakımı', tarih: '10.05.2026', maliyet: '4.500 ₺', periyot: '1 Ayda bir', sonraki: '10.06.2026', durum: 'Planlandı' }],
    tedarikciler: [{ id: 1, isim: 'Yılmaz Elektrik', alan: 'Elektrik', tel: '0533 111 2233', notlar: [] }]
};

const core = {
    authenticate: async () => {
        const email = document.getElementById('emailField').value;
        const password = document.getElementById('passField').value;
        
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ KullaniciAdi: email, Sifre: password })
            });
            
            if (res.ok) {
                const data = await res.json();
                authToken = data.token;
                localStorage.setItem('adminToken', authToken);
                
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                core.renderAll();
                showToast('Giriş başarılı.', 'success');
            } else {
                showToast('Giriş başarısız. Kullanıcı adı veya şifre hatalı.', 'danger');
            }
        } catch (err) {
            showToast('Sunucuya bağlanılamadı.', 'danger');
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        location.reload();
    },

    renderAll: () => {
        core.loadFinans();
        core.loadKullanicilar();
        core.loadArizalar();
        core.loadRezervasyonlar();
        core.renderBakimlar();
        core.renderTedarikciler();
    },

    // --- API ÇAĞRILARI ---
    loadFinans: async () => {
        try {
            const res = await fetchWithAuth('/finans/hepsini-getir');
            if (res.ok) { state.finansGecmisi = await res.json(); core.renderDashboard(); core.renderAidatlar(); }
        } catch(e) {}
    },
    loadKullanicilar: async () => {
        try {
            const res = await fetchWithAuth('/kullanici/listele');
            if (res.ok) { state.kayitlar = await res.json(); core.renderKayitlar(); }
        } catch(e) {}
    },
    loadArizalar: async () => {
        try {
            const res = await fetchWithAuth('/talepler/hepsini-getir');
            if (res.ok) { state.arizalar = await res.json(); core.renderArizalar(); }
        } catch(e) {}
    },
    loadRezervasyonlar: async () => {
        try {
            const res = await fetchWithAuth('/rezervasyon/hepsini-getir');
            if (res.ok) { state.randevular = await res.json(); core.renderRandevular(); }
        } catch(e) {}
    },

    // --- EKRANA BASMA (RENDER) FONKSİYONLARI ---
    renderDashboard: () => {
        document.getElementById('gelir-gider-table').innerHTML = state.finansGecmisi.map(f => `
            <tr><td>${escapeHTML(f.tarih)}</td><td>${escapeHTML(f.aciklama)}</td>
            <td><span class="badge ${f.tip === 'Gelir' ? 'success' : 'danger'}">${escapeHTML(f.tip)}</span></td>
            <td><strong>${f.tutar} ₺</strong></td></tr>
        `).join('');
    },
    renderAidatlar: () => {
        document.getElementById('aidat-table-all').innerHTML = state.finansGecmisi.map(a => `
            <tr><td>${escapeHTML(a.blokDaire)}</td><td>${escapeHTML(a.kullaniciAdi)}</td><td><strong>${a.tutar} ₺</strong></td>
            <td><span class="badge ${a.durum === 'Ödendi' ? 'success' : 'danger'}">${escapeHTML(a.durum)}</span></td><td>-</td></tr>
        `).join('');
    },
    renderKayitlar: () => {
        document.getElementById('kayit-table').innerHTML = state.kayitlar.map(k => `
            <tr><td><strong>#${k.id}</strong></td><td>${escapeHTML(k.kullaniciAdi)}</td><td>${escapeHTML(k.blokDaire)}</td>
            <td>${escapeHTML(k.adSoyad)}</td><td>${escapeHTML(k.telefon)}</td>
            <td><span class="badge ${k.aktifMi ? 'success' : 'danger'}">${k.aktifMi ? 'Aktif' : 'Pasif'}</span></td><td>-</td></tr>
        `).join('');
    },
    renderArizalar: () => {
        document.getElementById('issue-table').innerHTML = state.arizalar.map(a => `
            <tr><td>${escapeHTML(a.blokDaire)} / #${a.id}</td><td>${escapeHTML(a.tarih)}</td>
            <td><strong>${escapeHTML(a.kategori)}</strong></td>
            <td><span class="badge ${a.aciliyet === 'Yuksek' ? 'danger' : 'info'}">${escapeHTML(a.aciliyet)}</span></td>
            <td>${escapeHTML(a.duyguDurumu)}</td>
            <td>
                <select class="form-control" style="width: auto; padding: 5px; margin: 0;" onchange="core.updateTalepDurum(${a.id}, this.value)">
                    <option value="${a.durum}" selected disabled>${a.durum}</option><option value="1">İşleme Alındı</option><option value="2">Çözüldü</option>
                </select>
            </td></tr>
        `).join('');
    },
    updateTalepDurum: async (id, durumEnum) => {
        try {
            const res = await fetchWithAuth(`/talepler/durum-guncelle/${id}`, { method: 'PUT', body: JSON.stringify(parseInt(durumEnum)) });
            if (res.ok) { showToast("Talep durumu güncellendi.", "success"); core.loadArizalar(); }
        } catch(e) {}
    },
    renderRandevular: () => {
        document.getElementById('randevu-table').innerHTML = state.randevular.map(r => `
            <tr><td>${escapeHTML(r.tesisAdi)}</td><td>${escapeHTML(r.kullaniciAdi)}</td><td>${escapeHTML(r.tarih)} - ${escapeHTML(r.saatAraligi)}</td>
            <td><span class="badge ${r.durum === 'Onaylandi' ? 'success' : (r.durum === 'Reddedildi' ? 'danger' : 'warning')}">${escapeHTML(r.durum)}</span></td>
            <td>
                ${r.durum === 'Bekliyor' ? `
                    <button class="btn-sm" style="background:var(--success)" onclick="core.updateRandevu(${r.id}, 1)"><i class="fas fa-check"></i> Kabul</button>
                    <button class="btn-sm btn-delete" onclick="core.updateRandevu(${r.id}, 2)"><i class="fas fa-times"></i> Red</button>
                ` : `<span style="font-size:0.8rem; color:var(--text-muted)">Tamamlandı</span>`}
            </td></tr>
        `).join('');
    },
    updateRandevu: async (id, durumEnum) => {
        try {
            const res = await fetchWithAuth(`/rezervasyon/durum-guncelle/${id}`, { method: 'PUT', body: JSON.stringify(parseInt(durumEnum)) });
            if (res.ok) { showToast("Rezervasyon durumu güncellendi.", "success"); core.loadRezervasyonlar(); }
        } catch(e) {}
    },
    renderBakimlar: () => { document.getElementById('bakim-table').innerHTML = state.bakimlar.map(b => `<tr><td>${b.tur}</td><td>${b.tarih}</td><td>${b.maliyet}</td><td>${b.periyot}</td><td>${b.sonraki}</td><td>${b.durum}</td><td>-</td></tr>`).join(''); },
    renderTedarikciler: () => { document.getElementById('tedarikci-table').innerHTML = state.tedarikciler.map(t => `<tr><td>${t.isim}</td><td>${t.alan}</td><td>${t.tel}</td><td>-</td><td>-</td></tr>`).join(''); },
    
    switchTab: (id, el) => {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if(el) { el.classList.add('active'); document.getElementById('view-title').innerText = el.innerText.trim(); }
    },
    switchInnerTab: (id, el) => {
        document.querySelectorAll('.inner-tab-content').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.inner-tab-btn').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
    },
    toggleUserMenu: () => document.getElementById('userMenu').classList.toggle('active')
};

// Sayfa yüklendiğinde token varsa direkt giriş yap
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        core.renderAll();
    }
});