CREATE PROCEDURE SP_ArizaCozulduIsaretle
    @ArizaID INT,
    @YoneticiNotu NVARCHAR(MAX) = NULL
AS
BEGIN
    -- Kaydın olup olmadığını ve zaten çözülüp çözülmediğini kontrol et
    IF NOT EXISTS (SELECT 1 FROM ArizaBildirimleri WHERE ArizaID = @ArizaID AND Durum != 'Çözüldü')
    BEGIN
        PRINT 'HATA: Arıza kaydı bulunamadı veya zaten çözülmüş.';
        RETURN;
    END

    -- Güncelleme İşlemi
    UPDATE ArizaBildirimleri
    SET 
        Durum = 'Çözüldü',
        CozumTarihi = GETDATE(),
        -- Eğer parametre boş geçilmemişse yeni notu ekle, boşsa eskisini koru
        YoneticiNotu = ISNULL(@YoneticiNotu, YoneticiNotu) 
    WHERE 
        ArizaID = @ArizaID;

    PRINT 'Başarılı: Arıza çözüldü olarak işaretlendi.';
END;
GO

-- Örnek Kullanım:
-- EXEC SP_ArizaCozulduIsaretle @ArizaID = 5, @YoneticiNotu = 'Asansör firması geldi, parça değişimi yapıldı.';