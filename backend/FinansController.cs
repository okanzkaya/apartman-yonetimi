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
    public class FinansController : ControllerBase
    {
        // Encapsulation: Veritabanı nesnemizi dış erişime kapatıyoruz.
        private readonly ElitYonetimContext _context;

        public FinansController(ElitYonetimContext context)
        {
            _context = context;
        }

        // GET: api/finans/ekstre/1042
        // Frontend'deki "Hesap Ekstresi Görüntüle" butonu burayı tetikler.
        [HttpGet("ekstre/{kullaniciId}")]
        public async Task<IActionResult> EkstreGetir(int kullaniciId)
        {
            var hareketler = await _context.FinansHareketleri
                .Where(f => f.KullaniciId == kullaniciId)
                .OrderByDescending(f => f.Tarih)
                .Select(f => new 
                {
                    f.Id,
                    f.Donem,
                    f.Aciklama,
                    f.Tutar,
                    f.Durum
                })
                .ToListAsync();

            if (hareketler == null || !hareketler.Any())
            {
                return NotFound("Bu kullanıcıya ait finansal hareket bulunamadı.");
            }

            return Ok(hareketler);
        }

        // POST: api/finans/ode
        // Frontend'deki "Şimdi Öde" butonu burayı tetikler.
        [HttpPost("ode")]
        public async Task<IActionResult> AidatOde([FromBody] int finansHareketiId)
        {
            var hareket = await _context.FinansHareketleri.FindAsync(finansHareketiId);

            if (hareket == null)
            {
                return NotFound("Ödenecek fatura veya aidat bulunamadı.");
            }

            if (hareket.Durum == "Ödendi")
            {
                return BadRequest("Bu borç zaten ödenmiş.");
            }

            // Ödeme işlemlerinin simülasyonu (Gerçek hayatta burada Iyzico/Stripe gibi bir API çağrılır)
            hareket.Durum = "Ödendi";
            
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = "Ödeme işlemi başarıyla gerçekleşti." });
        }
    }
}