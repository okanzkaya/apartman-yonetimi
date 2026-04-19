using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using ElitYonetim.Data;
using ElitYonetim.Models;

namespace ElitYonetim.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KullaniciController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public KullaniciController(ElitYonetimContext context)
        {
            _context = context;
        }

        // YENİ EKLENDİ: Yönetici Paneli - Sisteme kayıtlı tüm sakinleri listeler
        [HttpGet("listele")]
        public async Task<IActionResult> TumKullanicilariGetir()
        {
            var kullanicilar = await _context.Kullanicilar
                .Where(k => k.Rol == "Sakin")
                .Select(k => new 
                {
                    k.Id,
                    k.KullaniciAdi,
                    k.AdSoyad,
                    k.BlokDaire,
                    k.Telefon,
                    k.AktifMi
                })
                .ToListAsync();

            return Ok(kullanicilar);
        }
    }
}