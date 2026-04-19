using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ElitYonetim.Models
{
    public enum Rol { Sakin, Yonetici }
    public enum FinansTipi { Gelir, Gider }
    public enum TalepAciliyet { Dusuk, Orta, Yuksek }
    public enum TalepDurumu { Inceleniyor, IslemeAlindi, Cozuldu }
    public enum RezervasyonDurumu { Bekliyor, Onaylandi, Reddedildi }

    public class Kullanici
    {
        public int Id { get; set; }
        [Required, MaxLength(50)] public string KullaniciAdi { get; set; }
        [Required] public string SifreHash { get; set; }
        [Required, MaxLength(100)] public string AdSoyad { get; set; }
        [MaxLength(20)] public string BlokDaire { get; set; }
        [MaxLength(15)] public string Telefon { get; set; }
        public Rol Rol { get; set; } = Rol.Sakin;
        public bool AktifMi { get; set; } = true;

        public ICollection<Talep> Talepler { get; set; }
        public ICollection<Rezervasyon> Rezervasyonlar { get; set; }
        public ICollection<FinansHareketi> FinansHareketleri { get; set; }
    }

    public class FinansHareketi
    {
        public int Id { get; set; }
        public int? KullaniciId { get; set; } 
        public Kullanici Kullanici { get; set; }

        public DateTime Tarih { get; set; }
        [Required, MaxLength(50)] public string Donem { get; set; }
        [Required, MaxLength(255)] public string Aciklama { get; set; }
        public FinansTipi Tip { get; set; }
        public decimal Tutar { get; set; }
        [MaxLength(50)] public string Durum { get; set; } 
    }

    public class Talep
    {
        public int Id { get; set; }
        public int KullaniciId { get; set; }
        public Kullanici Kullanici { get; set; }

        public DateTime Tarih { get; set; } = DateTime.Now;
        [Required] public string HamMetin { get; set; }
        [MaxLength(100)] public string Kategori { get; set; }
        [MaxLength(50)] public string DuyguDurumu { get; set; }
        public TalepAciliyet Aciliyet { get; set; }
        public TalepDurumu Durum { get; set; } = TalepDurumu.Inceleniyor;
    }

    public class Rezervasyon
    {
        public int Id { get; set; }
        public int KullaniciId { get; set; }
        public Kullanici Kullanici { get; set; }

        [Required, MaxLength(100)] public string TesisAdi { get; set; }
        public DateTime Tarih { get; set; }
        [Required, MaxLength(50)] public string SaatAraligi { get; set; }
        public RezervasyonDurumu Durum { get; set; } = RezervasyonDurumu.Bekliyor;
    }
}