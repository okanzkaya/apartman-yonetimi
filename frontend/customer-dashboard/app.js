const app = (() => {
    // XSS Koruması için veriyi normalize et
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, tag => ({
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

    const setupCalendar = (calendarId) => {
        const calendar = document.getElementById(calendarId);
        if(calendar) {
            const days = calendar.querySelectorAll('.day');
            days.forEach(day => {
                day.addEventListener('click', function() {
                    days.forEach(d => d.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
    };

    // Yükleme Sonrası Başlatıcı
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('header-tarih').innerText = getBugunTarih();
        setupTabs();
        setupCalendar('havuz-takvim');
    });

    return {
        showToast,
        openProfileModal: () => document.getElementById('profile-modal').style.display = 'flex',
        closeProfileModal: () => document.getElementById('profile-modal').style.display = 'none',
        saveProfile: () => {
            document.getElementById('display-phone').innerText = escapeHTML(document.getElementById('input-phone').value);
            document.getElementById('display-email').innerText = escapeHTML(document.getElementById('input-email').value);
            document.getElementById('display-plate').innerText = escapeHTML(document.getElementById('input-plate').value);
            app.closeProfileModal();
            showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
        },
        
        showTalepDetay: (kategori, aciklama, durum) => {
            document.getElementById('detay-kategori').innerText = kategori;
            document.getElementById('detay-aciklama').innerText = aciklama;
            const durumSpan = document.getElementById('detay-durum');
            durumSpan.innerText = durum;
            durumSpan.className = `status-badge ${durum === 'Çözüldü' ? 'paid' : 'pending'}`;
            document.getElementById('talep-detay-modal').style.display = 'flex';
        },

        gonderTalep: () => {
            const kategori = document.getElementById('talep-kategori').value;
            const rawAciklama = document.getElementById('talep-aciklama').value;
            
            if(rawAciklama.trim() === '') return showToast('Lütfen talebinizi detaylıca yazınız!', 'danger');

            const aciklama = escapeHTML(rawAciklama);
            const tbody = document.getElementById('talep-listesi');
            
            // XSS güvenli satır oluşturma
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Bugün</td>
                <td>${escapeHTML(kategori)}</td>
                <td><span class="status-badge pending">İnceleniyor (AI)</span></td>
                <td><button class="btn-sm-gray" onclick="app.showTalepDetay('${escapeHTML(kategori)}', '${aciklama}', 'İnceleniyor (AI)')">İncele</button></td>
            `;
            tbody.insertBefore(tr, tbody.firstChild); 

            const sayac = document.getElementById('aktif-talep-sayaci');
            sayac.innerText = parseInt(sayac.innerText) + 1;

            showToast('Talebiniz yönetime ve NLP analizine iletildi.', 'success');
            document.getElementById('talep-aciklama').value = '';
        },

        yapRezervasyon: (tesisAdi, takvimId, saatId) => {
            const aktifGun = document.querySelector(`#${takvimId} .day.active`).innerText;
            const seciliSaat = document.getElementById(saatId).value;
            
            const emptyState = document.getElementById('empty-rezervasyon');
            if(emptyState) emptyState.style.display = 'none'; // DOM'dan silmek yerine gizle

            const tbody = document.getElementById('rezervasyon-listesi');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${escapeHTML(tesisAdi)}</b></td>
                <td>${escapeHTML(aktifGun)} Günü</td>
                <td>${escapeHTML(seciliSaat)}</td>
                <td><span class="status-badge pending">Onay Bekliyor</span></td>
            `;
            tbody.appendChild(tr);

            showToast(`${tesisAdi} rezervasyon talebiniz iletildi!`, 'success');
        }
    };
})();