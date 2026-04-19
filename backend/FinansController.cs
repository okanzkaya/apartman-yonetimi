using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System.Security.Claims;
using ElitYonetim.Data;

namespace ElitYonetim.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FinansController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public FinansController(ElitYonetimContext context)
        {
            _context = context;
        }

        [HttpGet("ekstre")]
        public async Task<IActionResult> EkstreGetir()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var hareketler = await _context.FinansHareketleri
                .Where(f => f.KullaniciId == userId)
                .OrderByDescending(f => f.Tarih)
                .Select(f => new { f.Id, f.Donem, f.Aciklama, f.Tutar, f.Durum })
                .ToListAsync();

            return Ok(hareketler);
        }

        [HttpPost("ode")]
        public async Task<IActionResult> AidatOde([FromBody] int finansHareketiId)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var hareket = await _context.FinansHareketleri.FindAsync(finansHareketiId);

            if (hareket == null || hareket.KullaniciId != userId) 
                return NotFound("İşlem yetkiniz yok veya fatura bulunamadı.");
                
            if (hareket.Durum == "Ödendi") return BadRequest("Bu borç zaten ödenmiş.");

            hareket.Durum = "Ödendi";
            await _context.SaveChangesAsync();
            return Ok(new { Mesaj = "Ödeme işlemi başarıyla gerçekleşti." });
        }

        [Authorize(Roles = "Yonetici")]
        [HttpGet("hepsini-getir")]
        public async Task<IActionResult> TumFinansHareketleriniGetir()
        {
            var hareketler = await _context.FinansHareketleri
                .Include(f => f.Kullanici)
                .OrderByDescending(f => f.Tarih)
                .Select(f => new 
                {
                    f.Id,
                    KullaniciAdi = f.Kullanici != null ? f.Kullanici.AdSoyad : "Ortak Gider",
                    Tarih = f.Tarih.ToString("dd.MM.yyyy"),
                    f.Donem, f.Aciklama, Tip = f.Tip.ToString(), f.Tutar, f.Durum
                }).ToListAsync();

            return Ok(hareketler);
        }
    }
}