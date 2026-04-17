const API_BASE = "http://localhost:5000/api";
let aktifKullaniciID = 1; 

const core = {
    // 1. GİRİŞ İŞLEMİ (Auth)
    authenticate: async () => {
        const email = document.getElementById('emailField').value;
        const sifre = document.getElementById('passField').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, sifre })
            });
            const data = await res.json();

            if(res.ok) {
                aktifKullaniciID = data.user.KullaniciID;
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'flex';
                document.getElementById('userNameDisplay').innerText = data.user.Ad || 'Kullanıcı';
                document.getElementById('userInitial').innerText = (data.user.Ad || 'U')[0].toUpperCase();
                alert(`Giriş Başarılı! Rolünüz: ${data.user.Rol}`);
                
                // Giriş yapınca ekranları otomatik doldur
                core.fetchDuyurular();
                core.fetchArizalar();
            } else {
                alert("Hata: " + data.message);
            }
        } catch (e) {
            alert("Backend sunucusuna bağlanılamadı! Lütfen sunucunun (localhost:5000) açık olduğundan emin olun.");
        }
    },

    // 2. DUYURU SİSTEMİ
    fetchDuyurular: async () => {
        try {
            const res = await fetch(`${API_BASE}/duyurular`);
            const data = await res.json();
            const tbody = document.getElementById('duyuru-table');
            tbody.innerHTML = data.map(d => `<tr><td><b>${d.Baslik}</b></td><td>${d.Icerik} <br><small style="color:#64748b">Ekleyen: ${d.Ad} ${d.Soyad}</small></td></tr>`).join('');
        } catch (e) {
            console.error("Duyurular çekilemedi:", e);
        }
    },

    saveDuyuru: async () => {
        const icerik = document.getElementById('txtDuyuru').value;
        if(!icerik) return alert("Lütfen bir içerik yazın.");

        const payload = {
            ekleyen_id: aktifKullaniciID,
            baslik: "Genel Duyuru", 
            icerik: icerik,
            kritik_mi: 0
        };

        const res = await fetch(`${API_BASE}/duyurular`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert("Duyuru başarıyla yayınlandı!");
            document.getElementById('txtDuyuru').value = '';
            core.fetchDuyurular();
        }
    },

    // 3. AİDAT SİSTEMİ
    fetchAidat: async () => {
        const daireId = document.getElementById('daireIdSorgu').value;
        if(!daireId) return alert("Lütfen Daire ID giriniz.");
        
        try {
            const res = await fetch(`${API_BASE}/aidat/${daireId}`);
            const data = await res.json();
            const tbody = document.getElementById('aidat-table');
            
            if(data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center">Bu daireye ait kayıt bulunamadı.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map(a => `
                <tr>
                    <td>Daire ${daireId}</td>
                    <td>${a.Tutar} ₺</td>
                    <td>${a.OdemeDurumu ? '<span class="badge success">Ödendi</span>' : '<span class="badge warning">Borçlu</span>'}</td>
                </tr>
            `).join('');
        } catch (e) {
            console.error("Aidatlar çekilemedi:", e);
        }
    },

    calculateAidat: async () => {
        const payload = { donemAy: 5, donemYil: 2026, aidatTutari: 750.00, sonOdemeTarihi: '2026-05-20' };
        try {
            const res = await fetch(`${API_BASE}/aidat/toplu-olustur`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if(res.ok) alert(data.message);
            else alert("Hata: " + (data.error || "Aidatlar zaten oluşturulmuş olabilir."));
        } catch (e) {
            alert("İşlem başarısız.");
        }
    },

    // 4. ARIZA SİSTEMİ
    fetchArizalar: async () => {
        try {
            const res = await fetch(`${API_BASE}/ariza`);
            const data = await res.json();
            const tbody = document.getElementById('issue-table');
            
            tbody.innerHTML = data.map(i => {
                let badgeClass = i.Durum === 'Çözüldü' ? 'success' : (i.Durum === 'Beklemede' ? 'danger' : 'info');
                return `<tr>
                            <td><b>${i.Kategori || 'Genel'}</b></td>
                            <td>${i.Aciklama} <br><span class="badge ${badgeClass}" style="margin-top:5px; display:inline-block">${i.Durum}</span></td>
                        </tr>`;
            }).join('');
        } catch (e) {
            console.error("Arızalar çekilemedi:", e);
        }
    },

    saveAriza: async () => {
        const kategori = document.getElementById('txtKategori').value || "Genel";
        const aciklama = document.getElementById('txtAriza').value;
        
        if(!aciklama) return alert("Lütfen arıza açıklaması girin.");

        const payload = {
            bildiren_id: aktifKullaniciID,
            kategori: kategori,
            baslik: "Kullanıcı Bildirimi",
            aciklama: aciklama
        };

        const res = await fetch(`${API_BASE}/ariza`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert("Arıza başarıyla bildirildi!");
            document.getElementById('txtAriza').value = '';
            core.fetchArizalar();
        }
    },

    // UI YÖNETİMİ
    switchTab: (id, el) => {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
        document.getElementById('view-title').innerText = el.innerText.substring(3);
    },
    toggleUserMenu: () => document.getElementById('userMenu').classList.toggle('active'),
    logout: () => location.reload()
};

// Sayfa dışına tıklandığında menü kapatma
window.onclick = (e) => {
    if (!e.target.closest('.user-profile')) {
        const userMenu = document.getElementById('userMenu');
        if(userMenu) userMenu.classList.remove('active');
    }
};