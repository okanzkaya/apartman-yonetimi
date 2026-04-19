using Microsoft.EntityFrameworkCore;
using ElitYonetim.Models;

namespace ElitYonetim.Data
{
    public class ElitYonetimContext : DbContext
    {
        public ElitYonetimContext(DbContextOptions<ElitYonetimContext> options) : base(options)
        {
        }

        public DbSet<Kullanici> Kullanicilar { get; set; }
        public DbSet<FinansHareketi> FinansHareketleri { get; set; }
        public DbSet<Talep> Talepler { get; set; }
        public DbSet<Rezervasyon> Rezervasyonlar { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FinansHareketi>()
                .Property(f => f.Tutar)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Talep>()
                .HasOne(t => t.Kullanici)
                .WithMany(k => k.Talepler)
                .HasForeignKey(t => t.KullaniciId);

            modelBuilder.Entity<Rezervasyon>()
                .HasOne(r => r.Kullanici)
                .WithMany(k => k.Rezervasyonlar)
                .HasForeignKey(r => r.KullaniciId);
                
            modelBuilder.Entity<FinansHareketi>()
                .HasOne(f => f.Kullanici)
                .WithMany(k => k.FinansHareketleri)
                .HasForeignKey(f => f.KullaniciId);
        }
    }
}