using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
using ElitYonetim.Data;
using ElitYonetim.Models;
using ElitYonetim.DTOs;

namespace ElitYonetim.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RezervasyonController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public RezervasyonController(ElitYonetimContext context)
        {
            _context = context;
        }

        [HttpPost("yap")]
        public async Task<IActionResult> RezervasyonYap([FromBody] RezervasyonYapDto dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                bool doluMu = await _context.Rezervasyonlar.AnyAsync(r => 
                    r.TesisAdi == dto.TesisAdi && 
                    r.Tarih.Date == dto.Tarih.Date && 
                    r.SaatAraligi == dto.SaatAraligi &&
                    r.Durum != RezervasyonDurumu.Reddedildi);

                if (doluMu) return BadRequest("Seçtiğiniz tesis bu saat aralığında zaten dolu.");

                var yeniRezervasyon = new Rezervasyon
                {
                    KullaniciId = userId,
                    TesisAdi = dto.TesisAdi,
                    Tarih = dto.Tarih,
                    SaatAraligi = dto.SaatAraligi,
                    Durum = RezervasyonDurumu.Bekliyor
                };

                _context.Rezervasyonlar.Add(yeniRezervasyon);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Mesaj = "Rezervasyon talebiniz başarıyla oluşturuldu." });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Rezervasyon sırasında bir hata oluştu.");
            }
        }

        [HttpGet("listele")]
        public async Task<IActionResult> KisininRezervasyonlari()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var rezervasyonlar = await _context.Rezervasyonlar
                .Where(r => r.KullaniciId == userId)
                .OrderByDescending(r => r.Tarih)
                .Select(r => new { r.TesisAdi, Tarih = r.Tarih.ToString("dd.MM.yyyy"), r.SaatAraligi, Durum = r.Durum.ToString() })
                .ToListAsync();

            return Ok(rezervasyonlar);
        }

        [Authorize(Roles = "Yonetici")]
        [HttpGet("hepsini-getir")]
        public async Task<IActionResult> TumRezervasyonlariGetir()
        {
            var rezervasyonlar = await _context.Rezervasyonlar
                .Include(r => r.Kullanici)
                .OrderByDescending(r => r.Tarih)
                .Select(r => new 
                {
                    r.Id, KullaniciAdi = r.Kullanici.AdSoyad,
                    r.TesisAdi, Tarih = r.Tarih.ToString("dd.MM.yyyy"),
                    r.SaatAraligi, Durum = r.Durum.ToString()
                }).ToListAsync();

            return Ok(rezervasyonlar);
        }

        [Authorize(Roles = "Yonetici")]
        [HttpPut("durum-guncelle/{id}")]
        public async Task<IActionResult> DurumGuncelle(int id, [FromBody] RezervasyonDurumu yeniDurum)
        {
            var rezervasyon = await _context.Rezervasyonlar.FindAsync(id);
            if (rezervasyon == null) return NotFound("Rezervasyon bulunamadı.");

            rezervasyon.Durum = yeniDurum;
            await _context.SaveChangesAsync();
            return Ok(new { Mesaj = "Durum güncellendi." });
        }
    }
}