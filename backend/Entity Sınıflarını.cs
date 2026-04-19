using System;
using System.Collections.Generic;

namespace ElitYonetim.Models
{
    // 1. Sistem Kullanıcıları ve Sakinler
    public class Kullanici
    {
        public int Id { get; set; } // Primary Key
        public string KullaniciAdi { get; set; }
        public string SifreHash { get; set; } // Güvenlik için düz metin yerine hash tutulur
        public string AdSoyad { get; set; }
        public string BlokDaire { get; set; }
        public string Telefon { get; set; }
        public string Rol { get; set; } // "Sakin" veya "Yonetici"
        public bool AktifMi { get; set; } = true;

        // Bire-Çok İlişkiler (Navigation Properties)
        public ICollection<Talep> Talepler { get; set; }
        public ICollection<Rezervasyon> Rezervasyonlar { get; set; }
        public ICollection<FinansHareketi> FinansHareketleri { get; set; }
    }

    // 2. Aidat, Borç ve Gelir/Gider Hareketleri
    public class FinansHareketi
    {
        public int Id { get; set; }
        public int? KullaniciId { get; set; } // Foreign Key (Giderler için null olabilir)
        public Kullanici Kullanici { get; set; }

        public DateTime Tarih { get; set; }
        public string Aciklama { get; set; }
        public string Tip { get; set; } // "Gelir" (Aidat tahsilatı) veya "Gider" (Fatura, Bakım)
        public decimal Tutar { get; set; }
        public string Durum { get; set; } // "Ödendi", "Ödenmedi", "İcra Takibinde"
        public string Donem { get; set; } // Örn: "Nisan 2026"
    }

    // 3. NLP Destekli Arıza ve Talep Biletleri
    public class Talep
    {
        public int Id { get; set; }
        public int KullaniciId { get; set; } // Foreign Key
        public Kullanici Kullanici { get; set; }

        public DateTime Tarih { get; set; } = DateTime.Now;
        public string HamMetin { get; set; }
        
        // NLP Çıktıları
        public string Kategori { get; set; } // Örn: "Aydınlatma / Elektrik"
        public string DuyguDurumu { get; set; } // Örn: "Kızgın", "Nötr"
        public string Aciliyet { get; set; } // "Düşük", "Orta", "Yüksek"
        
        public string Durum { get; set; } // "İnceleniyor (AI)", "İşleme Alındı", "Çözüldü"
    }

    // 4. Ortak Alan Rezervasyonları
    public class Rezervasyon
    {
        public int Id { get; set; }
        public int KullaniciId { get; set; } // Foreign Key
        public Kullanici Kullanici { get; set; }

        public string TesisAdi { get; set; } // "Açık Havuz", "Spor Salonu"
        public DateTime Tarih { get; set; }
        public string SaatAraligi { get; set; } // "10:00 - 12:00"
        public string Durum { get; set; } // "Bekliyor", "Onaylandı", "Reddedildi"
    }

    // 5. Tesis Bakım Planlaması
    public class PlanliBakim
    {
        public int Id { get; set; }
        public string BakimTuru { get; set; }
        public DateTime Tarih { get; set; }
        public decimal Maliyet { get; set; }
        public string Periyot { get; set; } // "Tek Seferlik", "1 Ayda bir"
        public DateTime? SonrakiBakimTarihi { get; set; }
        public string Durum { get; set; } // "Planlandı", "Tamamlandı"
    }
}