namespace ElitYonetim.DTOs
{
    // Frontend'den backend'e talep oluştururken gelecek veri
    public class TalepOlusturDto
    {
        public int KullaniciId { get; set; }
        public string Kategori { get; set; }
        public string Aciklama { get; set; } // Bu metin AI/NLP analizine girecek
    }

    // Backend'den frontend'e talep listesi dönerken gidecek veri
    public class TalepListeleDto
    {
        public int Id { get; set; }
        public string Tarih { get; set; }
        public string Kategori { get; set; }
        public string Durum { get; set; }
        public string Aciliyet { get; set; }
    }

    public class RezervasyonYapDto
    {
        public int KullaniciId { get; set; }
        public string TesisAdi { get; set; }
        public string SaatAraligi { get; set; }
        public string Tarih { get; set; }
    }
}