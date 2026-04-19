import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page-wrapper">
            <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="logo">ELİTE <span>.</span></div>
                <div className="header-actions">
                    <Link to="/login" className="btn-signup">Sisteme Giriş Yap</Link>
                </div>
            </header>

            <section className="hero">
                <div className="hero-text">
                    <h1>Tesis Yönetiminde <br/><span>Kesin Kontrol.</span></h1>
                    <p>Bilişsel altyapımız ve akışkan finansal sistemimiz ile yaşam alanlarınızı profesyonelce, sıfır pürüz ile yönetin.</p>
                </div>
                
                <div className="hero-art">
                    <div className="geo-circle-1"></div>
                    <div className="geo-circle-2"></div>
                    <div className="geo-dots"></div>
                    <div className="geo-solid-card"></div>
                    <div className="geo-glass-card"></div>
                </div>
            </section>

            <section id="ozellikler" className="features-section">
                <h2 className="section-title">İhtiyacınız Olan Tüm Çözümler</h2>
                <div className="grid-3">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper"><i className="fas fa-chart-pie"></i></div>
                        <h3>Şeffaf Finansal Takip</h3>
                        <p>Gelir ve gider tablolarını otomatik oluşturun. Aidat borçlandırmalarını ve gecikme cezalarını sisteme bırakın, tahsilat oranınızı artırın.</p>
                    </div>
                    
                    <div className="feature-card dark">
                        <div className="feature-icon-wrapper"><i className="fas fa-brain"></i></div>
                        <h3>Bilişsel Talep Analizi</h3>
                        <p>Doğal dil işleme (NLP) altyapısı sayesinde, sakinlerden gelen bildirimlerdeki ironi ve aciliyeti otomatik saptayarak hızla aksiyon alın.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon-wrapper"><i className="fas fa-calendar-check"></i></div>
                        <h3>Dinamik Planlama</h3>
                        <p>Ortak alan rezervasyon çakışmalarını önleyin. Periyodik bakımların sonraki tarihlerini yapay zeka sizin yerinize takvime işlesin.</p>
                    </div>
                </div>
            </section>

            <section className="split-section">
                <div className="split-content">
                    <h2>Yöneticiler İçin: İş Yükünüzü Minimize Edin</h2>
                    <p>Excel tabloları ve WhatsApp grupları arasında kaybolmaya son verin. Veriye dayalı karar alma süreçleri ile sitenizi kurumsal bir şirket standartlarında yönetin.</p>
                    <ul className="split-list">
                        <li><i className="fas fa-check-circle"></i> Saniyeler içinde toplu aidat ataması</li>
                        <li><i className="fas fa-check-circle"></i> Tek tuşla avukat masrafı ekleme ve icra başlatma</li>
                        <li><i className="fas fa-check-circle"></i> Güvenlik geçiş loglarının anlık takibi</li>
                    </ul>
                </div>
                <div className="split-visual admin-ss"></div>
            </section>

            <section className="split-section">
                <div className="split-content">
                    <h2>Sakinler İçin: Pürüzsüz Bir Yaşam</h2>
                    <p>Yönetime ulaşmak için mesai saatlerini beklemeyin. Kendi hesabınıza giriş yaparak yaşadığınız alanı dilediğiniz an şekillendirin.</p>
                    <ul className="split-list">
                        <li><i className="fas fa-check-circle"></i> Kredi kartı ile hızlı ve güvenli ödeme</li>
                        <li><i className="fas fa-check-circle"></i> Havuz, spor salonu gibi ortak alan rezervasyonları</li>
                        <li><i className="fas fa-check-circle"></i> Anlık arıza bildirimleri ve çözüme dair şeffaf takip</li>
                    </ul>
                </div>
                <div className="split-visual user-ss"></div>
            </section>

            <footer className="landing-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h2>ELİTE <span>.</span></h2>
                        <p>Yeni nesil bilişsel altyapıya sahip, apartman ve tesis yönetim platformu. Yönetimi standartlaştırın, kaliteyi yükseltin.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Ürün</h4>
                        <ul>
                            <li><a href="#/">Özellikler</a></li>
                            <li><a href="#/">Fiyatlandırma</a></li>
                            <li><a href="#/">Sürüm Notları</a></li>
                            <li><a href="#/">Entegrasyonlar</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Kurumsal</h4>
                        <ul>
                            <li><a href="#/">Hakkımızda</a></li>
                            <li><a href="#/">Kariyer</a></li>
                            <li><a href="#/">KVKK ve Aydınlatma Metni</a></li>
                            <li><a href="#/">İletişim</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Destek</h4>
                        <ul>
                            <li><a href="#/">Yardım Merkezi</a></li>
                            <li><a href="#/">Kullanım Kılavuzu</a></li>
                            <li><a href="#/">API Dokümantasyonu</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Elite Yönetim Teknolojileri A.Ş. Tüm Hakları Saklıdır.</p>
                    <div className="social-links">
                        <a href="#/"><i className="fab fa-linkedin"></i></a>
                        <a href="#/"><i className="fab fa-twitter"></i></a>
                        <a href="#/"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;