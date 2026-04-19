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
    public class TaleplerController : ControllerBase
    {
        private readonly ElitYonetimContext _context;

        public TaleplerController(ElitYonetimContext context)
        {
            _context = context;
        }

        [HttpPost("olustur")]
        public async Task<IActionResult> TalepOlustur([FromBody] TalepOlusturDto dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            TalepAciliyet aciliyet = TalepAciliyet.Dusuk;
            string duygu = "Nötr";
            string kucukAciklama = dto.Aciklama.ToLower();

            if (kucukAciklama.Contains("acil") || kucukAciklama.Contains("tehlike"))
            {
                aciliyet = TalepAciliyet.Yuksek;
                duygu = "Endişeli";
            }
            else if (kucukAciklama.Contains("lanet") || kucukAciklama.Contains("yönetim"))
            {
                duygu = "Kızgın";
            }

            var yeniTalep = new Talep
            {
                KullaniciId = userId,
                Kategori = dto.Kategori,
                HamMetin = dto.Aciklama,
                Aciliyet = aciliyet,
                DuyguDurumu = duygu,
                Durum = TalepDurumu.Inceleniyor
            };

            _context.Talepler.Add(yeniTalep);
            await _context.SaveChangesAsync();
            return Ok(new { Mesaj = "Talebiniz iletildi.", TalepId = yeniTalep.Id });
        }

        [Authorize(Roles = "Yonetici")]
        [HttpGet("hepsini-getir")]
        public async Task<IActionResult> TumTalepleriGetir()
        {
            var talepler = await _context.Talepler
                .Include(t => t.Kullanici)
                .OrderByDescending(t => t.Tarih)
                .Select(t => new 
                {
                    t.Id, KullaniciAdi = t.Kullanici.AdSoyad,
                    Tarih = t.Tarih.ToString("dd.MM.yyyy HH:mm"),
                    t.Kategori, Aciliyet = t.Aciliyet.ToString(),
                    t.DuyguDurumu, Durum = t.Durum.ToString(), t.HamMetin
                }).ToListAsync();

            return Ok(talepler);
        }

        [Authorize(Roles = "Yonetici")]
        [HttpPut("durum-guncelle/{id}")]
        public async Task<IActionResult> DurumGuncelle(int id, [FromBody] TalepDurumu yeniDurum)
        {
            var talep = await _context.Talepler.FindAsync(id);
            if (talep == null) return NotFound("Talep bulunamadı.");

            talep.Durum = yeniDurum;
            await _context.SaveChangesAsync();
            return Ok(new { Mesaj = "Talep durumu güncellendi." });
        }
    }
}