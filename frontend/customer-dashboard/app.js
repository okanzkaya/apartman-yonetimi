// Backend projenin çalıştığı adresi ve portu buraya yaz
const API_BASE_URL = 'http://localhost:5000/api'; 
// Sistemde henüz JWT/Login olmadığı için test amaçlı statik bir kullanıcı ID'si tanımlıyoruz
const KULLANICI_ID = 1; 

const app = (() => {
    // XSS Koruması
    const escapeHTML = (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    };

    const showToast = (message, type = 'success') => {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.style.backgroundColor = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : '#17a2b8');
        toast.className = 'show';
        setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
    };

    const getBugunTarih = () => {
        return new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const setupTabs = () => {
        const navItems = document.querySelectorAll('.nav-links li');
        const tabContents = document.querySelectorAll('.tab-content');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
    };

    // --- BACKEND API ENTEGRASYONLARI ---

    // 1. Finans Verilerini (Ekstre) Getirme
    const finansGetir = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/finans/ekstre/${KULLANICI_ID}`);
            if (!res.ok) return;
            const veriler = await res.json();
            
            // HTML'de tablonun <tbody> kısmına id="finans-listesi" verdiğini varsayarak:
            const tbody = document.getElementById('finans-listesi'); 
            if (!tbody) return;
            
            tbody.innerHTML = '';
            veriler.forEach(hareket => {
                const tr = document.createElement('tr');
                const durumClass = hareket.durum === 'Ödendi' ? 'success' : (hareket.durum === 'Ödenmedi' ? 'danger' : 'warning');
                
                // Eğer durum "Ödendi" değilse buton göster
                let islemButonu = hareket.durum !== 'Ödendi' 
                    ? `<button class="btn-sm" onclick="app.aidatOde(${hareket.id})">Şimdi Öde</button>` 
                    : '-';

                tr.innerHTML = `
                    <td>${escapeHTML(hareket.donem)}</td>
                    <td>${escapeHTML(hareket.aciklama)}</td>
                    <td>${hareket.tutar} ₺</td>
                    <td><span class="status-badge ${durumClass}">${escapeHTML(hareket.durum)}</span></td>
                    <td>${islemButonu}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("Finans verileri çekilemedi:", err);
        }
    };

    // 2. Aidat/Fatura Ödeme
    const aidatOde = async (finansHareketiId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/finans/ode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finansHareketiId)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.mesaj, 'success');
                finansGetir(); // Tabloyu yenile
            } else {
                showToast(data || 'Ödeme reddedildi.', 'danger');
            }
        } catch (err) {
            showToast("Ödeme işlemi sırasında bir hata oluştu.", 'danger');
        }
    };

    // 3. Mevcut Rezervasyonları Listeleme
    const rezervasyonGetir = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/rezervasyon/listele/${KULLANICI_ID}`);
            if (!res.ok) return;
            const veriler = await res.json();
            
            const tbody = document.getElementById('rezervasyon-listesi');
            const emptyState = document.getElementById('empty-rezervasyon');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            if (veriler.length > 0 && emptyState) emptyState.style.display = 'none';

            veriler.forEach(rez => {
                const tr = document.createElement('tr');
                const durumClass = rez.durum === 'Onay Bekliyor' ? 'pending' : (rez.durum === 'Onaylandı' ? 'success' : 'danger');
                tr.innerHTML = `
                    <td><b>${escapeHTML(rez.tesisAdi)}</b></td>
                    <td>${escapeHTML(rez.tarih)}</td>
                    <td>${escapeHTML(rez.saatAraligi)}</td>
                    <td><span class="status-badge ${durumClass}">${escapeHTML(rez.durum)}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("Rezervasyon verileri çekilemedi:", err);
        }
    };

    return {
        // Uygulama yüklendiğinde tabloları doldur
        init: () => {
            setupTabs();
            finansGetir();
            rezervasyonGetir();
        },
        
        aidatOde, // HTML'den butona tıklayınca ulaşılabilmesi için dışa aktarıyoruz

        // Modal Kapatma/Açma fonksiyonları aynen korunmuştur
        showTalepDetay: (kategori, aciklama, durum) => {
            document.getElementById('detay-kategori').innerText = kategori;
            document.getElementById('detay-durum').innerText = durum;
            document.getElementById('detay-aciklama').innerText = aciklama;
            document.getElementById('talep-detay-modal').style.display = 'flex';
        },

        closeTalepDetay: () => {
            document.getElementById('talep-detay-modal').style.display = 'none';
        },

        // 4. Talep Oluşturma (AI/NLP)
        gonderTalep: async (kategoriId, aciklamaId) => {
            const kategori = document.getElementById(kategoriId).value;
            const aciklama = document.getElementById(aciklamaId).value;

            if (!aciklama.trim()) {
                showToast('Lütfen bir açıklama giriniz.', 'danger');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/talepler/olustur`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        KullaniciId: KULLANICI_ID,
                        Kategori: kategori,
                        Aciklama: aciklama
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    // Talebi UI tablosuna ekle
                    const tbody = document.getElementById('talep-listesi');
                    if (tbody) {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${getBugunTarih()}</td>
                            <td>${escapeHTML(kategori)}</td>
                            <td><span class="status-badge pending">İnceleniyor (AI)</span></td>
                            <td><button class="btn-sm-gray" onclick="app.showTalepDetay('${escapeHTML(kategori)}', '${escapeHTML(aciklama)}', 'İnceleniyor (AI)')">İncele</button></td>
                        `;
                        tbody.insertBefore(tr, tbody.firstChild); 
                    }

                    const sayac = document.getElementById('aktif-talep-sayaci');
                    if (sayac) sayac.innerText = parseInt(sayac.innerText) + 1;

                    showToast(data.mesaj, 'success');
                    document.getElementById(aciklamaId).value = ''; // Formu temizle
                } else {
                    showToast(data || 'Hata oluştu', 'danger');
                }
            } catch (error) {
                showToast('Sunucu bağlantı hatası.', 'danger');
            }
        },

        // 5. Tesis Rezervasyonu Yapma
        yapRezervasyon: async (tesisAdi, takvimId, saatId) => {
            const aktifGunEl = document.querySelector(`#${takvimId} .day.active`);
            if (!aktifGunEl) {
                showToast('Lütfen takvimden bir gün seçiniz.', 'danger');
                return;
            }
            
            const aktifGun = aktifGunEl.innerText;
            const seciliSaat = document.getElementById(saatId).value;
            
            // Backend C# kodun "DateTime.TryParse(dto.Tarih)" beklediği için standart bir tarih formatı oluşturuyoruz
            const tarihStr = new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(aktifGun)).toISOString();

            try {
                const res = await fetch(`${API_BASE_URL}/rezervasyon/yap`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        KullaniciId: KULLANICI_ID,
                        TesisAdi: tesisAdi,
                        SaatAraligi: seciliSaat,
                        Tarih: tarihStr
                    })
                });

                // Backend HTTP 400 dönerse (Müsait değilse) BadRequest text fırlatır, JSON fırlatmayabilir.
                const isJson = res.headers.get('content-type')?.includes('application/json');
                const data = isJson ? await res.json() : await res.text();

                if (res.ok) {
                    showToast(data.mesaj, 'success');
                    rezervasyonGetir(); // Başarılıysa tabloyu yenile
                } else {
                    showToast(data || 'Rezervasyon yapılamadı.', 'danger'); // Dolu saat uyarısı buradan gelecek
                }
            } catch (error) {
                showToast('Sunucuya bağlanılamadı.', 'danger');
            }
        }
    };
})();

// DOM yüklendiğinde init fonksiyonunu çalıştır ve verileri API'den çek
document.addEventListener('DOMContentLoaded', app.init);