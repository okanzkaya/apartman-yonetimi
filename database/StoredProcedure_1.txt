CREATE PROCEDURE SP_TopluAidatOlustur
    @DonemAy INT,
    @DonemYil INT,
    @AidatTutari DECIMAL(18,2),
    @SonOdemeTarihi DATE
AS
BEGIN
    -- 1. Güvenlik Kontrolü: Bu ay ve yıl için zaten aidat oluşturulmuş mu?
    IF EXISTS (SELECT 1 FROM Aidatlar WHERE DonemAy = @DonemAy AND DonemYil = @DonemYil)
    BEGIN
        PRINT 'HATA: Bu dönem için aidatlar zaten oluşturulmuş!';
        RETURN;
    END

    -- 2. Aidatları Oluştur: Sadece dolu dairelere yansıt
    INSERT INTO Aidatlar (DaireID, DonemAy, DonemYil, Tutar, SonOdemeTarihi, OdemeDurumu)
    SELECT 
        DaireID, 
        @DonemAy, 
        @DonemYil, 
        @AidatTutari, 
        @SonOdemeTarihi, 
        0 -- 0: Ödenmedi olarak başlat
    FROM Daireler
    WHERE BosMu = 0;

    PRINT 'Başarılı: Dolu daireler için aidatlar oluşturuldu.';
END;
GO

-- Örnek Kullanım:
-- EXEC SP_TopluAidatOlustur @DonemAy = 4, @DonemYil = 2026, @AidatTutari = 750.00, @SonOdemeTarihi = '2026-04-20';