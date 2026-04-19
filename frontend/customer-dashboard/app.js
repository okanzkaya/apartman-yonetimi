const API_BASE_URL = 'http://localhost:5000/api'; 
let authToken = localStorage.getItem('customerToken') || null;

const app = (() => {
    const escapeHTML = (str) => {
        if (str == null) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    };

    const showToast = (message, type = 'success') => {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.style.backgroundColor = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : '#17a2b8');
        toast.className = 'show';
        setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
    };

    const fetchWithAuth = async (endpoint, options = {}) => {
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${authToken}`;
        options.headers['Content-Type'] = 'application/json';
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (response.status === 401) {
            alert('Oturum süresi doldu, lütfen tekrar giriş yapın.');
            localStorage.removeItem('customerToken');
            location.reload();
            throw new Error('Unauthorized');
        }
        return response;
    };

    const loginPrompt = async () => {
        if(authToken) return app.loadData();
        const email = prompt("Sakin Paneline Giriş\nKullanıcı Adınız:");
        if(!email) return;
        const pass = prompt("Şifreniz:");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ KullaniciAdi: email, Sifre: pass })
            });
            if(res.ok) {
                const data = await res.json();
                authToken = data.token;
                localStorage.setItem('customerToken', authToken);
                app.loadData();
            } else {
                alert("Hatalı Giriş!"); location.reload();
            }
        } catch(e) { alert("Sunucu hatası."); }
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

    return {
        init: () => {
            setupTabs();
            loginPrompt(); // Uygulama açılırken token kontrolü ve prompt
        },
        
        loadData: () => {
            app.finansGetir();
            app.rezervasyonGetir();
        },

        finansGetir: async () => {
            try {
                // Eski URL: /finans/ekstre/${KULLANICI_ID} -> Yeni URL: /finans/ekstre (JWT içinden tanıyor)
                const res = await fetchWithAuth(`/finans/ekstre`);
                if (!res.ok) return;
                const veriler = await res.json();
                
                const tbody = document.querySelector('#aidat table tbody'); 
                if (!tbody) return;
                
                tbody.innerHTML = '';
                veriler.forEach(hareket => {
                    const tr = document.createElement('tr');
                    const durumClass = hareket.durum === 'Ödendi' ? 'success' : 'danger';
                    let islemButonu = hareket.durum !== 'Ödendi' 
                        ? `<button class="btn-sm" onclick="app.aidatOde(${hareket.id})">Şimdi Öde</button>` : '-';

                    tr.innerHTML = `
                        <td>${escapeHTML(hareket.donem)}</td><td>${escapeHTML(hareket.aciklama)}</td>
                        <td>${hareket.tutar} ₺</td><td><span class="status-badge ${durumClass}">${escapeHTML(hareket.durum)}</span></td>
                        <td>${islemButonu}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {}
        },

        aidatOde: async (id) => {
            try {
                const res = await fetchWithAuth(`/finans/ode`, { method: 'POST', body: JSON.stringify(id) });
                if (res.ok) { showToast("Ödeme yapıldı.", 'success'); app.finansGetir(); }
            } catch (err) {}
        },

        rezervasyonGetir: async () => {
            try {
                const res = await fetchWithAuth(`/rezervasyon/listele`);
                if (!res.ok) return;
                const veriler = await res.json();
                
                const tbody = document.getElementById('rezervasyon-listesi');
                const emptyState = document.getElementById('empty-rezervasyon');
                if (!tbody) return;
                
                tbody.innerHTML = '';
                if (veriler.length > 0 && emptyState) emptyState.style.display = 'none';

                veriler.forEach(rez => {
                    const tr = document.createElement('tr');
                    const durumClass = rez.durum === 'Bekliyor' ? 'pending' : (rez.durum === 'Onaylandi' ? 'success' : 'danger');
                    tr.innerHTML = `
                        <td><b>${escapeHTML(rez.tesisAdi)}</b></td><td>${escapeHTML(rez.tarih)}</td>
                        <td>${escapeHTML(rez.saatAraligi)}</td><td><span class="status-badge ${durumClass}">${escapeHTML(rez.durum)}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {}
        },

        gonderTalep: async () => {
            const kategori = document.getElementById('talep-kategori').value;
            const aciklama = document.getElementById('talep-aciklama').value;
            if (!aciklama.trim()) return showToast('Açıklama giriniz.', 'danger');

            try {
                // Backend'deki DTO'dan KullaniciId silindiği için sadece kategori ve açıklama yolluyoruz
                const res = await fetchWithAuth(`/talepler/olustur`, {
                    method: 'POST', body: JSON.stringify({ Kategori: kategori, Aciklama: aciklama })
                });

                if (res.ok) {
                    showToast("Talep yönetime iletildi.", 'success');
                    document.getElementById('talep-aciklama').value = '';
                }
            } catch (error) {}
        },

        yapRezervasyon: async (tesisAdi, takvimId, saatId) => {
            const aktifGunEl = document.querySelector(`#${takvimId} .day.active`);
            if (!aktifGunEl) return;
            const seciliSaat = document.getElementById(saatId).value;
            const tarihStr = new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(aktifGunEl.innerText)).toISOString();

            try {
                const res = await fetchWithAuth(`/rezervasyon/yap`, {
                    method: 'POST', body: JSON.stringify({ TesisAdi: tesisAdi, SaatAraligi: seciliSaat, Tarih: tarihStr })
                });

                if (res.ok) { showToast("Rezervasyon alındı.", 'success'); app.rezervasyonGetir(); }
                else { showToast("Bu saat dolu veya hata oluştu.", 'danger'); }
            } catch (error) {}
        }
    };
})();

document.addEventListener('DOMContentLoaded', app.init);