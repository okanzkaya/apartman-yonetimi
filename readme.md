📌 GitHub Tek Branch (Main) Kullanım Rehberi
Tüm proje tek bir ana damar (main) üzerinden ilerleyecektir. Kodların birbirini ezmemesi ve projenin çökmemesi için herkesin aşağıdaki sıraya harfiyen uyması zorunludur.

📁 Klasör Yapımız
/design: Figma linkleri ve tasarımlar.

/database: SQL veritabanı scriptleri.

/backend: Veritabanı işlemleri, API ve mantık kodları.

/frontend: Kullanıcı arayüzü (HTML/CSS/JS) kodları.

🚀 Kod Gönderme Sırası (Bunu Kesinlikle Ezberleyin)
Bilgisayarın başına geçip işini bitirdin ve kodu GitHub'a yollayacaksın. Sen çalışırken başka biri sisteme kod yüklemiş olabilir. Bu yüzden kodu fırlatmadan önce şu sıralamayı izlemek zorundasın:

git add .
(Yaptığın tüm değişiklikleri paketle.)

git commit -m "ne yaptigini kisa ve net yaz"
(Örn: "aidat hesaplama formulu eklendi". Gizemli mesajlar yazmak yasak.)

git pull origin main (🚨 HAYAT KURTARAN ADIM)
(Sen kodu GitHub'a itmeden önce, başkası bir şey yollamış mı diye son güncel hali kendi bilgisayarına çekip senin kodunla harmanlar. Hata veya çakışma çıkacaksa bilgisayarında çıkar, GitHub'ı bozmazsın.)

git push origin main
(Her şey sorunsuzsa paketini GitHub'a fırlat.)

⚠️ Ekip İçin 2 Altın Kural
Tek branch çalışmanın en büyük zayıflığı iletişimsizliktir. Bunu aşmak için:

Aynı Dosyaya Aynı Anda Girmeyin: İki kişi aynı anda index.html dosyasını değiştirip kaydederse GitHub kafayı yer. İş bölümünü klasör bazlı yapın (Örn: Biri frontend'de duyuru panelini yaparken, diğeri backend'de aidat fonksiyonunu yazsın).

Sık Sık Pull Yapın:
Bilgisayarın başına her oturduğunuzda, kod yazmaya başlamadan önce mutlaka bir kez git pull origin main yapıp en güncel dosyaları indirin ki eski dosyalar üzerinden çalışıp başkasının emeğini çöpe atmayın.
