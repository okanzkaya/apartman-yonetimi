CREATE PROCEDURE SP_DaireBorcSorgula
    @DaireID INT
AS
BEGIN
    SELECT 
        d.Blok,
        d.KapiNo,
        COUNT(a.AidatID) AS OdenmemisAySayisi,
        ISNULL(SUM(a.Tutar), 0) AS ToplamBorcTutari
    FROM Daireler d
    LEFT JOIN Aidatlar a ON d.DaireID = a.DaireID AND a.OdemeDurumu = 0 -- Sadece ödenmeyenler
    WHERE d.DaireID = @DaireID
    GROUP BY 
        d.Blok, 
        d.KapiNo;
END;
GO

-- Örnek Kullanım:
-- EXEC SP_DaireBorcSorgula @DaireID = 12;