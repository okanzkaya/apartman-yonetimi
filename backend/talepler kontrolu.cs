using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using ElitYonetim.Data;
using ElitYonetim.Models;
using ElitYonetim.DTOs;

namespace ElitYonetim.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaleplerController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public TaleplerController(ElitYonetimContext context)
        {
            _context = context;
        }

        // POST: api/talepler/olustur
        [HttpPost("olustur")]
        public async Task<IActionResult> TalepOlustur([FromBody] TalepOlusturDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Aciklama))
            {
                return BadRequest("Açıklama alanı boş olamaz.");
            }

            // Basit bir NLP Simülasyonu (Anahtar kelime analizi)
            string aciliyet = "Düşük";
            string duygu = "Nötr";

            string kucukAciklama = dto.Aciklama.ToLower();
            if (kucukAciklama.Contains("acil") || kucukAciklama.Contains("tehlike") || kucukAciklama.Contains("patladı"))
            {
                aciliyet = "Yüksek";
                duygu = "Endişeli";
            }
            else if (kucukAciklama.Contains("lanet") || kucukAciklama.Contains("yine") || kucukAciklama.Contains("yönetim"))
            {
                duygu = "Kızgın / İronik";
            }

            var yeniTalep = new Talep
            {
                KullaniciId = dto.KullaniciId,
                Kategori = dto.Kategori,
                HamMetin = dto.Aciklama,
                Aciliyet = aciliyet,
                DuyguDurumu = duygu,
                Durum = "İnceleniyor (AI)",
                Tarih = DateTime.Now
            };

            _context.Talepler.Add(yeniTalep);
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = "Talebiniz yönetime ve NLP analizine iletildi.", TalepId = yeniTalep.Id });
        }
    }
}