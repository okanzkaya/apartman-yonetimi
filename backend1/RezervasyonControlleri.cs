using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;
using ElitYonetim.Data;
using ElitYonetim.Models;
using ElitYonetim.DTOs;

namespace ElitYonetim.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RezervasyonController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public RezervasyonController(ElitYonetimContext context)
        {
            _context = context;
        }

        // POST: api/rezervasyon/yap
        // Frontend'deki "Rezerve Et" butonu burayı tetikler.
        [HttpPost("yap")]
        public async Task<IActionResult> RezervasyonYap([FromBody] RezervasyonYapDto dto)
        {
            DateTime rezerveTarihi;
            if (!DateTime.TryParse(dto.Tarih, out rezerveTarihi))
            {
                return BadRequest("Geçersiz tarih formatı.");
            }

            // İş Kuralları (Business Logic): Aynı tesis, aynı gün ve aynı saatte dolu mu?
            bool musaitMi = !await _context.Rezervasyonlar.AnyAsync(r => 
                r.TesisAdi == dto.TesisAdi && 
                r.Tarih.Date == rezerveTarihi.Date && 
                r.SaatAraligi == dto.SaatAraligi &&
                r.Durum != "Reddedildi");

            if (!musaitMi)
            {
                // Frontend'e hata mesajı dönüyoruz
                return BadRequest("Seçtiğiniz tesis bu saat aralığında zaten dolu. Lütfen başka bir saat seçiniz.");
            }

            var yeniRezervasyon = new Rezervasyon
            {
                KullaniciId = dto.KullaniciId,
                TesisAdi = dto.TesisAdi,
                Tarih = rezerveTarihi,
                SaatAraligi = dto.SaatAraligi,
                Durum = "Onay Bekliyor" // Yönetici paneline düşecek
            };

            _context.Rezervasyonlar.Add(yeniRezervasyon);
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"{dto.TesisAdi} için rezervasyon talebiniz başarıyla oluşturuldu." });
        }

        // GET: api/rezervasyon/listele/1042
        // Sakinin "Mevcut Rezervasyonlarınız" tablosunu doldurur.
        [HttpGet("listele/{kullaniciId}")]
        public async Task<IActionResult> KisininRezervasyonlari(int kullaniciId)
        {
            var rezervasyonlar = await _context.Rezervasyonlar
                .Where(r => r.KullaniciId == kullaniciId)
                .OrderByDescending(r => r.Tarih)
                .Select(r => new 
                {
                    r.TesisAdi,
                    Tarih = r.Tarih.ToString("dd.MM.yyyy"),
                    r.SaatAraligi,
                    r.Durum
                })
                .ToListAsync();

            return Ok(rezervasyonlar);
        }
    }
}