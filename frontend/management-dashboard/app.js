const escapeHTML = (str) => str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':(type==='danger'?'times-circle':'info-circle')}"></i> ${message}`;
    toast.style.backgroundColor = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : 'var(--info)');
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Genişletilmiş Veri State'i
let state = {
    finansGeçmişi: [
        { tarih: '18.04.2026', aciklama: 'Daire 12 - Aidat Tahsilatı', tip: 'Gelir', tutar: '+ 1.500 ₺' },
        { tarih: '17.04.2026', aciklama: 'Ortak Alan Elektrik Faturası', tip: 'Gider', tutar: '- 4.250 ₺' }
    ],
    kayitlar: [
        { id: 1042, username: 'tugba.yilmaz', daire: 'A Blok - No:12', isim: 'Tuğba Yılmaz', tel: '0555 123 4567', durum: 'Aktif' },
        { id: 1045, username: 'mehmet.celik', daire: 'B Blok - No:15', isim: 'Mehmet Çelik', tel: '0532 987 6543', durum: 'Aktif' }
    ],
    aidatGenel: [
        { daire: 'A Blok - No:12', isim: 'Tuğba Yılmaz', borc: '0 ₺', durum: 'Ödendi' },
        { daire: 'B Blok - No:15', isim: 'Mehmet Çelik', borc: '1.500 ₺', durum: 'Ödenmedi' }
    ],
    borclar: [
        { id: 201, user_id: 1045, daire: 'B Blok - No:15', isim: 'Mehmet Çelik', donem: 'Şubat, Mart', tutar: '3.000 ₺', durum: 'Borçlu' }
    ],
    tahsilatGecmisi: [
        { tarih: '18.04.2026 10:15', daire: 'A Blok - No:12', isim: 'Tuğba Yılmaz', tutar: '1.500 ₺', yol: 'Kredi Kartı (Online)' }
    ],
    bakimlar: [
        { id: 1, tur: 'Asansör Periyodik Bakımı', tarih: '10.05.2026', maliyet: '4.500 ₺', periyot: '1 Ayda bir', sonraki: '10.06.2026', durum: 'Planlandı' },
        { id: 2, tur: 'Dış Cephe Boyama', tarih: '25.05.2026', maliyet: '85.000 ₺', periyot: 'Tek Seferlik', sonraki: '-', durum: 'Planlandı' }
    ],
    randevular: [
        { id: 1, tesis: 'Spor Salonu', sakin: 'Tuğba Yılmaz (#1042)', tarih: '18.04.2026 - 19:00', durum: 'Bekliyor' },
        { id: 2, tesis: 'Açık Havuz', sakin: 'Mehmet Çelik (#1045)', tarih: '17.04.2026 - 14:00', durum: 'Onaylandı' }
    ],
    arizalar: [
        { id: 1, user_id: 1042, tarih: '18.04.2026 09:30', raw_text: "Yine koridor karanlık, aidat almayı biliyorsunuz ama lamba değiştiren yok! Harika yönetim gerçekten.", detected_cat: "Aydınlatma / Elektrik", sentiment: "İronik / Kızgın", urgency: "Düşük" },
        { id: 2, user_id: 1011, tarih: '17.04.2026 21:15', raw_text: "Otopark kapısı kapanmıyor açık kalmış, acil güvenlik sorunu olabilir.", detected_cat: "Güvenlik / Otomasyon", sentiment: "Nötr / Endişeli", urgency: "Yüksek" }
    ],
    dokumanlar: [
        { id: 1, isim: 'Site Yaşam Kuralları ve Yönetmelik.pdf', tarih: '10.04.2026', vis: 'Herkese Açık' },
        { id: 2, isim: '2026 Nisan Ayı Avukatlık Masrafları.xlsx', tarih: '12.04.2026', vis: 'Yönetime Özel' }
    ],
    tedarikciler: [
        { id: 1, isim: 'Ahmet Yılmaz (Yılmaz Elektrik)', alan: 'Elektrik & Aydınlatma', tel: '0533 111 2233', notlar: ['Hızlı dönüş yapıyor, işçiliği temiz.', 'Faturalandırmada bazen gecikebiliyor.'] },
        { id: 2, isim: 'Kardeşler Tesisat', alan: 'Su Tesisatı & Doğalgaz', tel: '0544 222 3344', notlar: ['Ana vana arızalarında aranacak ilk numara.', 'Gece acil durumlara ek ücret yazıyorlar.'] },
        { id: 3, isim: 'Marmara Asansör', alan: 'Asansör Bakım', tel: '0212 555 6677', notlar: ['Aylık periyodik bakım sözleşmemiz var.', 'Müdahale süreleri maksimum 45 dakika.'] },
        { id: 4, isim: 'Elit Temizlik', alan: 'Ortak Alan Temizliği', tel: '0532 999 8877', notlar: ['Çarşamba ve Cumartesi günleri geliyorlar.', 'Kullanılan kimyasallar onaylı.'] }
    ],
    loglar: [
        { id: 1, zaman: '18.04.2026 - 08:30', kisi: 'Tuğba Yılmaz (#1042)', tip: 'Giriş', nokta: 'Otopark Bariyeri' },
        { id: 2, zaman: '18.04.2026 - 09:15', kisi: 'Kargo (Yurtiçi)', tip: 'Giriş', nokta: 'Ana Kapı Turnike' }
    ],
    activeDocId: null,
    activeUstaId: null
};

const core = {
    authenticate: () => {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('agendaTarih').valueAsDate = new Date();
        core.renderAll();
        showToast('Yönetici paneline başarıyla giriş yapıldı.', 'success');
    },

    renderAll: () => {
        core.renderDashboard();
        core.renderKayitlar();
        core.renderAidatlar();
        core.renderArizalar();
        core.renderRandevular();
        core.loadAgenda();
        core.renderBakimlar();
        core.renderTedarikciler();
        core.renderDokumanlar();
        core.renderLoglar();
    },

    renderDashboard: () => {
        document.getElementById('gelir-gider-table').innerHTML = state.finansGeçmişi.map(f => `
            <tr>
                <td>${f.tarih}</td><td>${escapeHTML(f.aciklama)}</td>
                <td><span class="badge ${f.tip === 'Gelir' ? 'success' : 'danger'}">${f.tip}</span></td>
                <td><strong>${f.tutar}</strong></td>
            </tr>
        `).join('');
    },

    // 1. Aidat & Finans İşlemleri
    renderAidatlar: () => {
        document.getElementById('aidat-table-all').innerHTML = state.aidatGenel.map(a => `
            <tr>
                <td>${escapeHTML(a.daire)}</td><td>${escapeHTML(a.isim)}</td><td><strong>${a.borc}</strong></td>
                <td><span class="badge ${a.durum === 'Ödendi' ? 'success' : 'danger'}">${a.durum}</span></td>
                <td><button class="btn-sm" style="background:var(--info)" onclick="showToast('Ekstre gönderildi.', 'info')">Ekstre İlet</button></td>
            </tr>
        `).join('');

        document.getElementById('aidat-table-debts').innerHTML = state.borclar.map(b => `
            <tr>
                <td>${escapeHTML(b.daire)}</td><td>${escapeHTML(b.isim)}</td><td>${escapeHTML(b.donem)}</td>
                <td><strong>${b.tutar}</strong></td>
                <td><span class="badge ${b.durum === 'İcra Takibinde' ? 'danger' : 'warning'}">${b.durum}</span></td>
                <td>
                    ${b.durum === 'Borçlu' ? `<button class="btn-sm btn-delete" onclick="core.baslatIcra(${b.id})">İcra Başlat</button>` : `<span style="font-size:0.8rem; color:var(--danger)">Hukuki Süreçte</span>`}
                </td>
            </tr>
        `).join('');

        document.getElementById('aidat-table-history').innerHTML = state.tahsilatGecmisi.map(t => `
            <tr>
                <td>${t.tarih}</td><td>${escapeHTML(t.daire)}</td><td>${escapeHTML(t.isim)}</td>
                <td><span style="color:var(--success); font-weight:bold;">${t.tutar}</span></td>
                <td>${escapeHTML(t.yol)}</td>
            </tr>
        `).join('');
    },
    calculateAidat: () => showToast("Manuel aidat borçlandırması yapıldı.", "success"),
    saveAutoAidat: () => {
        const gun = document.getElementById('txtAutoGun').value;
        const tutar = document.getElementById('txtAutoTutar').value;
        if(!gun || !tutar) return showToast("Gün ve tutar belirtmelisiniz.", "danger");
        showToast(`Sistem her ayın ${gun}. günü hesaplara otomatik ${tutar} ₺ yansıtacaktır.`, "success");
    },
    baslatIcra: (id) => { let b = state.borclar.find(x => x.id === id); if(b) { b.durum = 'İcra Takibinde'; core.renderAidatlar(); showToast("Yasal süreç başlatıldı ve sisteme işlendi.", "info"); } },

    // 2. Kayıtlar
    renderKayitlar: () => {
        document.getElementById('kayit-table').innerHTML = state.kayitlar.map(k => `
            <tr>
                <td><strong>#${k.id}</strong></td><td>${escapeHTML(k.username)}</td><td>${escapeHTML(k.daire)}</td>
                <td>${escapeHTML(k.isim)}</td><td>${escapeHTML(k.tel)}</td>
                <td><span class="badge ${k.durum === 'Aktif' ? 'success' : 'danger'}">${k.durum}</span></td>
                <td><button class="btn-sm btn-delete" onclick="core.deleteKayit(${k.id})"><i class="fas fa-trash"></i></button></td>
            </tr>
        `).join('');
    },
    saveKayit: () => {
        const daire = document.getElementById('txtDaire').value; const isim = document.getElementById('txtSakinAd').value;
        const tel = document.getElementById('txtTelefon').value; const user = document.getElementById('txtUsername').value;
        const pass = document.getElementById('txtPassword').value;
        if(!isim || !user || !pass) return showToast("Ad, Kullanıcı Adı ve Şifre zorunludur!", "danger");
        const newId = Math.floor(Math.random() * 9000) + 1000;
        state.kayitlar.push({ id: newId, username: user, daire: daire, isim: isim, tel: tel, durum: 'Aktif' });
        core.renderKayitlar(); showToast(`Hesap oluşturuldu. ID: #${newId}`);
    },
    deleteKayit: (id) => { state.kayitlar = state.kayitlar.filter(k => k.id !== id); core.renderKayitlar(); showToast("Kayıt silindi.", "info"); },

    // 3. NLP Analizi
    renderArizalar: () => {
        document.getElementById('issue-table').innerHTML = state.arizalar.map(a => `
            <tr>
                <td>#${a.user_id}</td><td>${a.tarih}</td><td><strong>${a.detected_cat}</strong></td>
                <td><span class="badge ${a.urgency === 'Yüksek' ? 'danger' : 'info'}">${a.urgency}</span></td>
                <td>${a.sentiment}</td>
                <td><button class="btn-sm" style="background:var(--primary)" onclick="core.openNlpModal(${a.id})">Raporu İncele</button></td>
            </tr>
        `).join('');
    },
    openNlpModal: (id) => {
        let a = state.arizalar.find(x => x.id === id);
        if(a) {
            document.getElementById('nlp-raw-text').innerText = a.raw_text;
            document.getElementById('nlp-category').innerText = a.detected_cat;
            document.getElementById('nlp-sentiment').innerText = a.sentiment;
            document.getElementById('nlp-urgency').innerText = a.urgency;
            document.getElementById('nlp-modal').style.display = 'flex';
        }
    },

    // 4. Rezervasyonlar
    renderRandevular: () => {
        document.getElementById('randevu-table').innerHTML = state.randevular.map(r => `
            <tr>
                <td>${escapeHTML(r.tesis)}</td><td>${escapeHTML(r.sakin)}</td><td>${escapeHTML(r.tarih)}</td>
                <td><span class="badge ${r.durum === 'Onaylandı' ? 'success' : (r.durum === 'Reddedildi' ? 'danger' : 'warning')}">${r.durum}</span></td>
                <td>
                    ${r.durum === 'Bekliyor' ? `
                        <button class="btn-sm" style="background:var(--success)" onclick="core.updateRandevu(${r.id}, 'Onaylandı')"><i class="fas fa-check"></i> Kabul</button>
                        <button class="btn-sm btn-delete" onclick="core.updateRandevu(${r.id}, 'Reddedildi')"><i class="fas fa-times"></i> Red</button>
                    ` : `<span style="font-size:0.8rem; color:var(--text-muted)">İşlem Tamamlandı</span>`}
                </td>
            </tr>
        `).join('');
    },
    updateRandevu: (id, durum) => { let r = state.randevular.find(x => x.id === id); if(r) r.durum = durum; core.renderRandevular(); showToast(`Rezervasyon: ${durum}.`); },
    loadAgenda: () => {
        const slots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"];
        document.getElementById('agenda-grid').innerHTML = slots.map(() => {
            const isDolu = Math.random() > 0.7; 
            return `
            <div class="data-card" style="margin:0; padding:15px; text-align:center; border: 2px solid ${isDolu ? 'var(--danger)' : 'var(--success)'}; background: ${isDolu ? '#fef2f2' : '#f0fdf4'};">
                <div style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 5px;">${slots[Math.floor(Math.random() * slots.length)]}</div>
                <div style="font-size: 0.85rem; font-weight: 600; color: ${isDolu ? 'var(--danger)' : 'var(--success)'};">${isDolu ? 'Dolu / Rezerve' : 'Müsait'}</div>
            </div>`;
        }).join('');
    },

    // 5. Planlı Bakımlar
    renderBakimlar: () => {
        document.getElementById('bakim-table').innerHTML = state.bakimlar.map(b => `
            <tr>
                <td><strong>${escapeHTML(b.tur)}</strong></td><td>${b.tarih}</td><td>${escapeHTML(b.maliyet)}</td>
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
        const tur = document.getElementById('txtBakimAd').value; const tarih = document.getElementById('txtBakimTarih').value;
        const frekans = document.getElementById('txtBakimFrekans').value; const birim = document.getElementById('selBakimBirim').value;
        const maliyet = document.getElementById('txtBakimMaliyet').value;
        if(!tur || !tarih) return showToast("Bakım türü ve tarih zorunludur!", "danger");
        let periyotMetni = birim === 'Yok' ? 'Tek Seferlik' : `${frekans} ${birim}da bir`;
        let sonraki = '-';
        if(birim !== 'Yok' && frekans > 0) {
            let d = new Date(tarih);
            if(birim === 'Gün') d.setDate(d.getDate() + parseInt(frekans));
            if(birim === 'Ay') d.setMonth(d.getMonth() + parseInt(frekans));
            if(birim === 'Yıl') d.setFullYear(d.getFullYear() + parseInt(frekans));
            sonraki = d.toLocaleDateString('tr-TR'); 
        }
        state.bakimlar.push({ id: Date.now(), tur, tarih: new Date(tarih).toLocaleDateString('tr-TR'), maliyet: maliyet + ' ₺', periyot: periyotMetni, sonraki, durum: 'Planlandı' });
        core.renderBakimlar(); showToast("Bakım takvime işlendi!");
    },
    tamamlaBakim: (id) => { let b = state.bakimlar.find(x => x.id === id); if(b) b.durum = 'Tamamlandı'; core.renderBakimlar(); showToast("Bakım tamamlandı olarak işaretlendi."); },
    deleteBakim: (id) => { state.bakimlar = state.bakimlar.filter(b => b.id !== id); core.renderBakimlar(); showToast("İptal edildi.", "info"); },

    // 6. Usta & Tedarikçiler
    renderTedarikciler: () => {
        document.getElementById('tedarikci-table').innerHTML = state.tedarikciler.map(t => `
            <tr>
                <td><strong>${escapeHTML(t.isim)}</strong></td><td>${escapeHTML(t.alan)}</td><td>${escapeHTML(t.tel)}</td>
                <td><button class="btn-sm" style="background:var(--info)" onclick="core.openNotesModal(${t.id})"><i class="far fa-sticky-note"></i> Notlar (${t.notlar.length})</button></td>
                <td><button class="btn-sm btn-delete" onclick="core.deleteTedarikci(${t.id})"><i class="fas fa-trash"></i></button></td>
            </tr>
        `).join('');
    },
    saveTedarikci: () => {
        const isim = document.getElementById('txtUstaAd').value; const alan = document.getElementById('txtUstaAlan').value;
        const tel = document.getElementById('txtUstaTel').value;
        if(!isim) return showToast("Firma/Usta adı zorunludur.", "danger");
        state.tedarikciler.push({ id: Date.now(), isim: isim, alan: alan, tel: tel, notlar: [] });
        core.renderTedarikciler(); showToast("Tedarikçi rehbere eklendi.");
    },
    deleteTedarikci: (id) => { state.tedarikciler = state.tedarikciler.filter(t => t.id !== id); core.renderTedarikciler(); showToast("Tedarikçi silindi.", "info"); },
    openNotesModal: (id) => {
        state.activeUstaId = id;
        let t = state.tedarikciler.find(x => x.id === id);
        if(t) {
            document.getElementById('note-usta-isim').innerText = t.isim;
            document.getElementById('note-list').innerHTML = t.notlar.length > 0 ? t.notlar.map(n => `<div style="border-bottom:1px solid #ccc; padding:8px 0; font-size:0.9rem;">- ${escapeHTML(n)}</div>`).join('') : '<p style="color:#888; font-size:0.9rem;">Henüz not eklenmemiş.</p>';
            document.getElementById('notes-modal').style.display = 'flex';
        }
    },
    addUstaNote: () => {
        const not = document.getElementById('txtYeniNot').value;
        if(!not) return;
        let t = state.tedarikciler.find(x => x.id === state.activeUstaId);
        if(t) {
            t.notlar.push(not);
            document.getElementById('txtYeniNot').value = '';
            core.openNotesModal(state.activeUstaId);
            core.renderTedarikciler();
        }
    },

    // 7. Doküman Yönetimi
    renderDokumanlar: () => {
        document.getElementById('dokuman-table').innerHTML = state.dokumanlar.map(d => `
            <tr>
                <td>${escapeHTML(d.isim)}</td><td>${d.tarih}</td>
                <td><span class="badge ${d.vis === 'Herkese Açık' ? 'success' : 'danger'}">${d.vis}</span></td>
                <td>
                    <button class="btn-sm" style="background:var(--warning)" onclick="core.openVisModal(${d.id})"><i class="fas fa-eye"></i> İzin Değiştir</button>
                    <button class="btn-sm btn-delete" onclick="core.deleteDokuman(${d.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },
    uploadDokuman: () => {
        const isim = document.getElementById('txtBelgeAd').value; const vis = document.getElementById('selBelgeGorunurluk').value;
        if(!isim) return showToast("Belge adı girin!", "danger");
        state.dokumanlar.push({ id: Date.now(), isim: isim, tarih: new Date().toLocaleDateString('tr-TR'), vis: vis });
        core.renderDokumanlar(); showToast("Dosya sisteme eklendi.");
    },
    deleteDokuman: (id) => { state.dokumanlar = state.dokumanlar.filter(d => d.id !== id); core.renderDokumanlar(); },
    openVisModal: (id) => {
        state.activeDocId = id;
        document.getElementById('chkEminim').checked = false;
        document.getElementById('vis-modal').style.display = 'flex';
    },
    confirmVisChange: () => {
        const chk = document.getElementById('chkEminim').checked;
        if(!chk) return showToast("Lütfen işlemi onayladığınızı belirten kutucuğu işaretleyin.", "danger");
        
        let d = state.dokumanlar.find(x => x.id === state.activeDocId);
        if(d) {
            d.vis = d.vis === 'Herkese Açık' ? 'Yönetime Özel' : 'Herkese Açık';
            core.renderDokumanlar();
            document.getElementById('vis-modal').style.display = 'none';
            showToast(`Belge erişimi başarıyla "${d.vis}" olarak güncellendi.`);
        }
    },

    // 8. Loglar
    renderLoglar: () => {
        document.getElementById('giris-table').innerHTML = state.loglar.map(l => `
            <tr><td>${l.zaman}</td><td>${escapeHTML(l.kisi)}</td><td><span class="badge success">${l.tip}</span></td><td>${escapeHTML(l.nokta)}</td></tr>
        `).join('');
    },

    switchTab: (id, el) => {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if(el) { el.classList.add('active'); document.getElementById('view-title').innerText = el.innerText.trim(); }
        if(id === 'rezervasyonlar') core.loadAgenda();
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