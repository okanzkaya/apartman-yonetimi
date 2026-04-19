using System;
using System.ComponentModel.DataAnnotations;

namespace ElitYonetim.DTOs
{
    public class TalepOlusturDto
    {
        [Required] public string Kategori { get; set; }
        [Required] public string Aciklama { get; set; } 
    }

    public class RezervasyonYapDto
    {
        [Required] public string TesisAdi { get; set; }
        [Required] public string SaatAraligi { get; set; }
        [Required] public DateTime Tarih { get; set; }
    }

    public class LoginDto
    {
        [Required] public string KullaniciAdi { get; set; }
        [Required] public string Sifre { get; set; }
    }
}