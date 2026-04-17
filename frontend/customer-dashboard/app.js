// Bugünün tarihini ekrana yaz
document.addEventListener('DOMContentLoaded', () => {
    const bugun = new Date();
    const secenekler = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('header-tarih').innerText = bugun.toLocaleDateString('tr-TR', secenekler);

    // Sekme (Tab) Değiştirme Mantığı
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

    // Takvimleri Başlat
    setupCalendar('havuz-takvim');
});

function setupCalendar(calendarId) {
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
}

// Toast (Bildirim)
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.backgroundColor = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : '#17a2b8');
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Profil İşlemleri
function openProfileModal() { document.getElementById('profile-modal').style.display = 'flex'; }
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
function saveProfile() {
    document.getElementById('display-phone').innerText = document.getElementById('input-phone').value;
    document.getElementById('display-email').innerText = document.getElementById('input-email').value;
    document.getElementById('display-plate').innerText = document.getElementById('input-plate').value;
    closeProfileModal();
    showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
}

// BİRLEŞTİRİLMİŞ TALEP MASASI (Mesaj ve Arıza NLP'ye gider)
function gonderTalep() {
    const kategori = document.getElementById('talep-kategori').value;
    const aciklama = document.getElementById('talep-aciklama').value;
    
    if(aciklama.trim() === '') {
        showToast('Lütfen talebinizi detaylıca yazınız!', 'danger');
        return;
    }

    const tbody = document.getElementById('talep-listesi');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>Bugün</td>
        <td>${kategori}</td>
        <td><span class="status-badge pending" style="background:#e8f4fd; color:#1a2a6c;">İnceleniyor (AI)</span></td>
    `;
    tbody.insertBefore(tr, tbody.firstChild); 

    const sayac = document.getElementById('aktif-talep-sayaci');
    sayac.innerText = parseInt(sayac.innerText) + 1;

    showToast('Talebiniz yönetime ve analize iletildi.', 'success');
    document.getElementById('talep-aciklama').value = '';
}

// Rezervasyon İşlemi
function yapRezervasyon(tesisAdi, takvimId, saatId) {
    const aktifGun = document.querySelector(`#${takvimId} .day.active`).innerText;
    const seciliSaat = document.getElementById(saatId).value;

    const tbody = document.getElementById('rezervasyon-listesi');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><b>${tesisAdi}</b></td>
        <td>${aktifGun} Günü</td>
        <td>${seciliSaat}</td>
        <td><span class="status-badge paid">Onay Bekliyor</span></td>
    `;
    tbody.appendChild(tr);

    showToast(`${tesisAdi} rezervasyon talebiniz yönetime iletildi!`, 'success');
}