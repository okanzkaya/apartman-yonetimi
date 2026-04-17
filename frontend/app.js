const API_BASE = "http://localhost:5000/api";

const core = {
    // SİSTEM GİRİŞİ
    authenticate: () => {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        
        core.fetchGelirGider();
        core.fetchKayitlar();
        core.fetchAidatlar();
        core.fetchDuyurular();
        core.fetchArizalar();
        core.fetchRandevular();
        core.loadAgenda(); // Yeni Ajanda Yükleyicisi
        core.fetchBakimlar();
        core.fetchDokumanlar();
        core.fetchGirisCikis();
    },

    // ARAYÜZ YÖNETİMİ
    switchTab: (id, el) => {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
        document.getElementById('view-title').innerText = el.innerText.substring(3);
    },

    switchInnerTab: (id, el) => {
        document.querySelectorAll('.inner-tab-content').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.inner-tab-btn').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
    },

    // DİĞER MODÜLLER
    fetchGelirGider: () => {
        document.getElementById('gelir-gider-table').innerHTML = `
            <tr><td>15 Nisan 2026</td><td>Nisan Ayı Aidat Tahsilatı</td><td><span class="badge success">Gelir</span></td><td>+ 85.400 ₺</td></tr>
            <tr><td>12 Nisan 2026</td><td>Ortak Alan Elektrik (BEDAŞ)</td><td><span class="badge danger">Gider</span></td><td>- 14.200 ₺</td></tr>
        `;
    },

    fetchKayitlar: () => {
        document.getElementById('kayit-table').innerHTML = `
            <tr><td>A Blok - No:1</td><td>Ahmet Yılmaz</td><td>0555 111 2233</td><td><span class="badge success">Aktif</span></td></tr>
            <tr><td>A Blok - No:2</td><td>Ayşe Kaya</td><td>0532 999 8877</td><td><span class="badge success">Aktif</span></td></tr>
        `;
    },
    saveKayit: () => alert("Sisteme kaydedildi!"),

    fetchAidatlar: () => {
        document.getElementById('aidat-table-all').innerHTML = `
            <tr><td>A Blok - Daire 1</td><td>Ahmet Yılmaz</td><td>750 ₺</td><td><span class="badge success">Ödendi</span></td></tr>
            <tr><td>A Blok - Daire 2</td><td>Ayşe Kaya</td><td>750 ₺</td><td><span class="badge warning">Ödenmedi</span></td></tr>
            <tr><td>B Blok - Daire 15</td><td>Mehmet Çelik</td><td>750 ₺</td><td><span class="badge danger">İcrada</span></td></tr>
        `;
        document.getElementById('aidat-table-debts').innerHTML = `
            <tr><td>A Blok - Daire 2</td><td>Ayşe Kaya</td><td>2026 Nisan</td><td>750 ₺</td><td><button class="btn-action" style="padding:5px; font-size:0.7rem; background:var(--info)">Hatırlatma Gönder</button></td></tr>
            <tr><td>B Blok - Daire 15</td><td>Mehmet Çelik</td><td>2026 Şubat, Mart, Nisan</td><td>2.250 ₺</td><td><button class="btn-action" style="padding:5px; font-size:0.7rem; background:var(--danger)">Hukuki İşlem Başlat</button></td></tr>
        `;
    },
    calculateAidat: () => alert("Toplu aidatlar oluşturuldu!"),

    fetchDuyurular: () => {
        document.getElementById('duyuru-table').innerHTML = `<tr><td>Bugün</td><td>Nisan aidatlarını geciktirmeyiniz.</td></tr>`;
    },
    saveDuyuru: () => alert("Duyuru panoya asıldı!"),

    fetchArizalar: () => {
        document.getElementById('issue-table').innerHTML = `
            <tr>
                <td>Daire 12</td><td>Temizlik</td><td>Koridorlar harika(!)</td>
                <td><span class="badge warning">İroni / Şikayet</span></td>
                <td><button class="btn-action" style="padding:5px 10px; font-size:0.7rem">Çözüldü</button></td>
            </tr>
        `;
    },

    // GÜNCELLENDİ: RANDEVU SİSTEMİ VE GÜNLÜK AJANDA
    loadAgenda: () => {
        const tesis = document.getElementById('agendaTesis').value;
        let tarihInput = document.getElementById('agendaTarih');
        
        // Eğer tarih seçilmemişse bugünün tarihini otomatik ata
        if (!tarihInput.value) {
            tarihInput.value = new Date().toISOString().split('T')[0];
        }

        const slots = [
            "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", 
            "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"
        ];

        const grid = document.getElementById('agenda-grid');
        
        grid.innerHTML = slots.map(slot => {
            // Varsayılan boş durum renkleri
            let borderColor = 'var(--success)', bg = '#dcfce7', text = 'Müsait', textColor = 'var(--success)';

            // Test Verisi: Seçime göre bazı saatleri "Dolu" veya "Beklemede" yapıyoruz
            if (tesis === "Spor Salonu" && slot === "18:00 - 20:00") {
                borderColor = 'var(--danger)'; bg = '#fee2e2'; text = 'Dolu (Ahmet Ç.)'; textColor = 'var(--danger)';
            } else if (tesis === "Açık Havuz" && slot === "14:00 - 16:00") {
                borderColor = 'var(--warning)'; bg = '#fef3c7'; text = 'Onay Bekliyor'; textColor = '#92400e';
            }

            return `
            <div class="agenda-slot" style="background: ${bg}; border-color: ${borderColor};">
                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem; margin-bottom: 5px;">${slot}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: ${textColor};">${text}</div>
            </div>`;
        }).join('');
    },

    fetchRandevular: () => {
        document.getElementById('randevu-table').innerHTML = `
            <tr>
                <td>Spor Salonu</td><td>Ahmet Çelik (D:14)</td><td>18 Nisan 2026 - 19:00</td>
                <td><span class="badge success">Onaylandı</span></td>
            </tr>
            <tr>
                <td>Açık Havuz</td><td>Ayşe Kaya (D:15)</td><td>19 Nisan 2026 - 14:00</td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-action" style="padding:5px 10px; font-size:0.7rem; background:var(--success)" onclick="alert('Randevu onaylandı.')">Onayla</button>
                        <button class="btn-action" style="padding:5px 10px; font-size:0.7rem; background:var(--danger)" onclick="alert('Randevu reddedildi.')">Reddet</button>
                    </div>
                </td>
            </tr>
        `;
    },

    // BAKIMLAR
    fetchBakimlar: () => {
        document.getElementById('bakim-table').innerHTML = `
            <tr>
                <td>Dış Cephe Boyama</td><td>25 Mayıs 2026</td><td>45.000 ₺</td>
                <td><span style="color:var(--text-muted)">Tek Seferlik (Tekrar Yok)</span></td>
                <td><span class="badge info">Planlandı</span></td>
            </tr>
            <tr>
                <td>Asansör Periyodik Bakım</td><td>10 Mayıs 2026</td><td>4.500 ₺</td>
                <td><span style="font-weight:bold; color:var(--info)">Aylık (Sonraki: 10 Haziran 2026)</span></td>
                <td><span class="badge success">Tamamlandı</span></td>
            </tr>
        `;
    },
    saveBakim: () => alert("Bakım takvime işlendi!"),

    fetchDokumanlar: () => {
        document.getElementById('dokuman-table').innerHTML = `<tr><td>Nisan_Fatura.jpg</td><td>10.04.2026</td><td>İndir</td></tr>`;
    },
    uploadDokuman: () => alert("Buluta yüklendi!"),

    fetchGirisCikis: () => {
        document.getElementById('giris-table').innerHTML = `<tr><td>08:30</td><td>Kargo</td><td><span class="badge success">Giriş</span></td><td>Ana Kapı</td></tr>`;
    },
    filterTable: (input, tableId) => {
        let filter = input.value.toLowerCase();
        let rows = document.getElementById(tableId).getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].style.display = rows[i].innerText.toLowerCase().includes(filter) ? '' : 'none';
        }
    },
    
    toggleUserMenu: () => document.getElementById('userMenu').classList.toggle('active'),
    logout: () => location.reload()
};

window.onclick = (e) => {
    if (!e.target.closest('.user-profile')) {
        let um = document.getElementById('userMenu');
        if(um) um.classList.remove('active');
    }
};