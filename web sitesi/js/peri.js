/* ================= IndieVerse - Dolaşan Yardımcı Su Perisi =================
   Sayfada yumuşakça süzülen, sürüklenebilen, sayfaya özel ipuçları veren ve
   tıklandığında etkileşimli rehber paneli açan yardımcı peri (Lira).
============================================================================= */
(function () {
  if (typeof IV === "undefined") return;

  const AYAR_ANAHTAR = "indieverse_peri_ayar";
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ayar = Object.assign(
    { mod: azHareket ? "sabit" : "dolas", gizli: false },
    IV.oku(AYAR_ANAHTAR, {})
  );
  function ayarKaydet() { IV.yaz(AYAR_ANAHTAR, ayar); }

  const sayfa = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const SAYFA_IPUCLARI = {
    "index.html": [
      "Merhaba! Ben Lira, IndieVerse'in su perisiyim. Bana tıklarsan evrende yolunu gösterebilirim ✨",
      "Aşağıdaki Evrim Yolculuğu'na göz at: her eylem seni balıktan ejderhaya yaklaştırır 🐉",
      "Farklı türde eylemler yaptıkça günlük Kombo Çarpanın yükselir ve daha hızlı XP kazanırsın!"
    ],
    "oyuncu.html": [
      "İpucu: Arama kutusuna 'korku prenses' veya 'uzay çiftlik' yazarak akıllı eşleştirmeyi dene 🔍",
      "Bir oyunun başlığına tıklayarak detay sayfasına gidebilir, 4 kriter puanı verip +3 Kritik XP alabilirsin ⭐",
      "Güvenilir Puan sıralaması, az oyla öne çıkan oyunları dengeler."
    ],
    "oyun.html": [
      "Bu oyunun Hikâye, Görsel, Oynanış ve Atmosfer kriterlerini puanlarsan +3 Kritik XP kazanırsın 🎯",
      "50 karakterden uzun bir geri bildirim yazarsan ekstra Detaylı İnceleme bonusu gelir ✨"
    ],
    "gelistirici.html": [
      "Oyununu yayınladığında +8 XP kazanır ve 'Yapımcı' başarımını açarsın 🚀",
      "Anahtar kelimeleri virgülle zengin yazarsan oyuncular aramalarda oyununu çok daha kolay bulur."
    ],
    "ag.html": [
      "Solda 5 farklı geliştirici kanalı var (#genel, #programcı, #müzik, #çizer, #tasarım) 💬",
      "Yeni bir ekip ilanı yayınlamak +4 XP kazandırır ve rol filtresiyle arayanlar seni hemen bulur 📌"
    ],
    "topluluk.html": [
      "Paylaşımlarında #etiket ve @kullanıcı adı kullanabilir, gönderilere emoji tepkisi bırakabilirsin 🔥",
      "Bugün hem paylaşım hem yorum hem tepki yaparsan Günlük Kombo Çarpanın açılır ⚡"
    ],
    "uye.html": [
      "Hesabını açtığında Balık (Sv. 1) olarak başlarsın. Üst üste giriş yaparak Seri Çarpanını 2x'e çıkarabilirsin 🐟",
      "Şifre gücü çubuğunu yeşile çıkarmak için büyük-küçük harf, rakam ve sembol ekleyebilirsin 🔐"
    ],
    "profil.html": [
      "Burada Kâşif, Topluluk ve Üretici uzmanlık dallarını ve evrim şartlarını canlı takip edebilirsin 📊",
      "Evrim şartın tamamlandığında bir sonraki forma dönüşürsün — kutlama sürprizine hazır ol 🎉"
    ]
  };

  /* ---------- DOM oluştur ---------- */
  const kap = document.createElement("div");
  kap.id = "periKapsayici";
  kap.innerHTML =
    '<div class="peri-balon" id="periBalon" hidden role="status" aria-live="polite">' +
      '<p id="periBalonMetin"></p>' +
      '<button type="button" class="peri-balon-kapat" aria-label="İpucunu kapat">✕</button>' +
    '</div>' +
    '<div class="peri-panel" id="periPanel" hidden role="dialog" aria-label="Su Perisi Yardım Asistanı">' +
      '<div class="peri-panel-ust">' +
        '<div><b>✨ Su Perisi Lira</b><small>IndieVerse Rehberi</small></div>' +
        '<button type="button" class="peri-kapat" aria-label="Yardımı kapat">✕</button>' +
      '</div>' +
      '<div class="peri-cevap" id="periCevap"></div>' +
      '<div class="peri-sorular">' +
        '<button type="button" data-soru="evrim">🐉 Sonraki evrimim için ne lazım?</button>' +
        '<button type="button" data-soru="seviye">⚡ Seviye barı ve çarpanlar nasıl çalışır?</button>' +
        '<button type="button" data-soru="gorev">🎯 Bugünkü görevlerim neler?</button>' +
        '<button type="button" data-soru="sayfa">🧭 Bu sayfada ne yapabilirim?</button>' +
      '</div>' +
      '<div class="peri-kisayollar">' +
        '<a href="oyuncu.html">🎮 Keşfet</a>' +
        '<a href="topluluk.html">💬 Topluluk</a>' +
        '<a href="profil.html">🏅 Profilim</a>' +
      '</div>' +
      '<div class="peri-kontroller">' +
        '<button type="button" id="periModBtn"></button>' +
        '<button type="button" id="periGizleBtn">💤 Küçült</button>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="peri-govde" id="periGovde" aria-label="Yardımcı Su Perisi Lira — yardım için tıkla">' +
      '<span class="peri-aura"></span>' +
      '<img src="img/peri.png" alt="Su Perisi Lira" draggable="false">' +
    '</button>';
  document.body.appendChild(kap);

  /* Küçültülmüş çağırma küresi */
  const kure = document.createElement("button");
  kure.id = "periKure";
  kure.type = "button";
  kure.setAttribute("aria-label", "Su Perisi Lira'yı çağır");
  kure.title = "Su Perisi Lira'yı çağır ✨";
  kure.innerHTML = '<img src="img/peri.png" alt=""><span>Yardım</span>';
  document.body.appendChild(kure);

  const govde = kap.querySelector("#periGovde");
  const balon = kap.querySelector("#periBalon");
  const balonMetin = kap.querySelector("#periBalonMetin");
  const panel = kap.querySelector("#periPanel");
  const cevap = kap.querySelector("#periCevap");
  const modBtn = kap.querySelector("#periModBtn");
  const gizleBtn = kap.querySelector("#periGizleBtn");

  /* ---------- Konum & Yumuşak Dolaşma Fiziği ---------- */
  const BOY = 92;
  let x = Math.max(24, window.innerWidth - 135);
  let y = Math.max(110, window.innerHeight - 190);
  let hedefX = x, hedefY = y;
  let surukleniyor = false, suruklendi = false, ofsetX = 0, ofsetY = 0;
  let panelAcik = false;
  let sonParilti = 0;
  let balonZaman = null;
  let yon = 1;

  function sinirla(nx, ny) {
    const minX = 14, maxX = Math.max(minX, window.innerWidth - BOY - 14);
    const minY = 82, maxY = Math.max(minY, window.innerHeight - BOY - 24);
    return [Math.min(maxX, Math.max(minX, nx)), Math.min(maxY, Math.max(minY, ny))];
  }

  /* Ekranın kenar şeritlerinden güvenli yeni hedef seç (içeriği kapatmasın) */
  function yeniHedefSec() {
    const w = window.innerWidth, h = window.innerHeight;
    if (w < 680) {
      // Mobilde sağ/sol alt kenarlarda nazikçe gezsin
      hedefX = Math.random() < 0.5 ? 16 : Math.max(16, w - BOY - 16);
      hedefY = h - BOY - 74 - Math.random() * 140;
    } else {
      const kenar = Math.random();
      if (kenar < 0.45) {
        // Sağ şerit
        hedefX = w - BOY - 20 - Math.random() * Math.min(90, w * 0.08);
        hedefY = 110 + Math.random() * Math.max(80, h - 250);
      } else if (kenar < 0.9) {
        // Sol şerit
        hedefX = 18 + Math.random() * Math.min(90, w * 0.08);
        hedefY = 110 + Math.random() * Math.max(80, h - 250);
      } else {
        // Üst/alt geçiş
        hedefX = 100 + Math.random() * Math.max(60, w - 240);
        hedefY = h - BOY - 34 - Math.random() * 55;
      }
    }
    [hedefX, hedefY] = sinirla(hedefX, hedefY);
  }

  function pariltiBirak(px, py) {
    if (azHareket || ayar.gizli) return;
    const p = document.createElement("span");
    p.className = "peri-parilti";
    p.style.left = (px + BOY * 0.45 + (Math.random() - 0.5) * 28) + "px";
    p.style.top = (py + BOY * 0.5 + (Math.random() - 0.5) * 24) + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }

  function konumUygula() {
    kap.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    kap.classList.toggle("solda", x < window.innerWidth / 2);
    kap.classList.toggle("ustte", y < 290);
    const img = govde.querySelector("img");
    if (img) img.style.transform = "scaleX(" + yon + ")";
  }

  function animasyon(t) {
    if (!ayar.gizli && !surukleniyor && !panelAcik && ayar.mod === "dolas") {
      const dx = hedefX - x;
      const dy = hedefY - y;
      const mesafe = Math.hypot(dx, dy);
      if (mesafe < 18) {
        if (Math.random() < 0.015) yeniHedefSec();
      } else {
        const hiz = Math.min(1.65, 0.45 + mesafe * 0.004);
        x += (dx / mesafe) * hiz;
        y += (dy / mesafe) * hiz;
        if (Math.abs(dx) > 6) yon = dx < 0 ? 1 : -1;
        if (t - sonParilti > 220) {
          sonParilti = t;
          pariltiBirak(x, y);
        }
      }
      konumUygula();
    }
    requestAnimationFrame(animasyon);
  }

  /* ---------- İpucu Balonu & Panel ---------- */
  function balonGoster(metin, sure = 6500) {
    if (ayar.gizli || panelAcik) return;
    balonMetin.textContent = metin;
    balon.hidden = false;
    clearTimeout(balonZaman);
    balonZaman = setTimeout(() => { balon.hidden = true; }, sure);
  }

  function soruCevapla(tur) {
    const kul = IV.oturum();
    if (tur === "evrim") {
      if (!kul || !IV.hesapBul(kul)) {
        cevap.innerHTML = 'Şu an misafirsin 🐟 <a href="uye.html">Üye ol veya giriş yap</a>; <b>Balık</b> olarak başlayıp 7 form boyunca <b>Evren Bekçisi</b>ne dönüşebilirsin!';
        return;
      }
      const o = IV.seviyeOzet(IV.xpToplam(kul), kul);
      if (!o.sonraki) {
        cevap.innerHTML = "🎉 Zirvedesin! <b>" + IV.temiz(o.sv.ad) + "</b> formunda " + o.puan + " XP ile evrenin koruyucususun.";
      } else if (o.kilitliSart) {
        cevap.innerHTML = "⚡ <b>" + IV.temiz(o.sonraki.ad) + "</b> için XP'n doldu! Evrimi açmak için tek şart kaldı: <b>" + IV.temiz(o.sartMetin) + "</b>.";
      } else {
        cevap.innerHTML = "Şu an <b>Sv. " + o.seviyeNo + " · " + IV.temiz(o.sv.ad) + " " + o.kademeRoma + "</b> (" + o.puan + " XP) formundasın.<br>" +
          "Sonraki form <b>" + IV.temiz(o.sonraki.ad) + "</b> için <b>" + o.kalan + " XP</b> gerekiyor." +
          (o.sartMetin ? "<br>" + (o.sartTamam ? "✅" : "🔒") + " Evrim şartı: <b>" + IV.temiz(o.sartMetin) + "</b>" : "");
      }
      return;
    }

    if (tur === "seviye") {
      cevap.innerHTML =
        "<b>Yeni Seviye Sistemi:</b> Her evrim formu <b>I, II, III</b> alt kademelerine ayrılır.<br>" +
        "• 🔥 <b>Seri Çarpanı:</b> Üst üste girişle 1.25× → 2.0× XP.<br>" +
        "• ⚡ <b>Kombo Çarpanı:</b> Aynı gün farklı eylemlerle (puan, yorum, paylaşım, favori) 1.5×'e kadar bonus.<br>" +
        "• 🎯 <b>Kritik XP:</b> 4 kriteri puanlamak (+3) veya 50+ karakter yorum (+2) ekstra kazandırır!";
      return;
    }

    if (tur === "gorev") {
      if (!kul || !IV.hesapBul(kul)) {
        cevap.innerHTML = 'Günlük görevler +5 XP kazandırır! Görmek için <a href="uye.html">giriş yap</a>.';
        return;
      }
      const g = IV.gunlukGorevler(kul);
      cevap.innerHTML = "<b>Bugünün Görevleri (+5 XP):</b><br>" + g.map(x =>
        (x.tamam ? "✅ " : "○ ") + IV.temiz(x.ad) + " (" + x.say + "/" + x.hedef + ")"
      ).join("<br>");
      return;
    }

    const ipuclari = SAYFA_IPUCLARI[sayfa] || SAYFA_IPUCLARI["index.html"];
    cevap.innerHTML = ipuclari.map(s => "• " + IV.temiz(s)).join("<br>");
  }

  function panelDurum(ac) {
    panelAcik = ac;
    panel.hidden = !ac;
    kap.classList.toggle("panel-acik", ac);
    if (ac) {
      balon.hidden = true;
      soruCevapla("evrim");
    }
  }

  function gorunumGuncelle() {
    kap.hidden = ayar.gizli;
    kure.hidden = !ayar.gizli;
    modBtn.textContent = ayar.mod === "dolas" ? "📌 Sabitle" : "✨ Dolaşsın";
    if (!ayar.gizli) {
      if (ayar.mod === "sabit") {
        [x, y] = sinirla(window.innerWidth - BOY - 24, window.innerHeight - BOY - 76);
      }
      konumUygula();
    }
  }

  /* ---------- Sürükle & Tıkla ---------- */
  govde.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    surukleniyor = true;
    suruklendi = false;
    ofsetX = e.clientX - x;
    ofsetY = e.clientY - y;
    govde.setPointerCapture(e.pointerId);
  });

  govde.addEventListener("pointermove", e => {
    if (!surukleniyor) return;
    const nx = e.clientX - ofsetX;
    const ny = e.clientY - ofsetY;
    if (Math.hypot(nx - x, ny - y) > 5) suruklendi = true;
    [x, y] = sinirla(nx, ny);
    hedefX = x; hedefY = y;
    konumUygula();
  });

  govde.addEventListener("pointerup", e => {
    if (!surukleniyor) return;
    surukleniyor = false;
    try { govde.releasePointerCapture(e.pointerId); } catch (_) {}
    if (!suruklendi) panelDurum(!panelAcik);
  });

  kap.querySelector(".peri-kapat").addEventListener("click", () => panelDurum(false));
  kap.querySelector(".peri-balon-kapat").addEventListener("click", () => { balon.hidden = true; });
  kap.querySelector(".peri-sorular").addEventListener("click", e => {
    const b = e.target.closest("[data-soru]");
    if (b) soruCevapla(b.dataset.soru);
  });

  modBtn.addEventListener("click", () => {
    ayar.mod = ayar.mod === "dolas" ? "sabit" : "dolas";
    ayarKaydet();
    gorunumGuncelle();
    if (ayar.mod === "dolas") yeniHedefSec();
  });

  gizleBtn.addEventListener("click", () => {
    panelDurum(false);
    ayar.gizli = true;
    ayarKaydet();
    gorunumGuncelle();
  });

  kure.addEventListener("click", () => {
    ayar.gizli = false;
    ayarKaydet();
    gorunumGuncelle();
    balonGoster("Geri döndüm! Yardım için bana tıklayabilirsin ✨", 4500);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panelAcik) panelDurum(false);
  });

  window.addEventListener("resize", () => {
    [x, y] = sinirla(x, y);
    [hedefX, hedefY] = sinirla(hedefX, hedefY);
    konumUygula();
  });

  /* ---------- Canlı Olay Tepkileri ---------- */
  document.addEventListener("xpDegisti", e => {
    const d = e.detail || {};
    if (d.miktar > 0) {
      const ek = d.carpan > 1 ? " (×" + d.carpan + " çarpan!)" : "";
      balonGoster("Harika! +" + d.miktar + " XP kazandın" + ek + " ✨", 4500);
    }
  });
  document.addEventListener("evrimGecirdi", e => {
    const yeni = e.detail && e.detail.yeni;
    if (yeni) balonGoster("Tebrikler! Artık " + yeni.ad + " formundasın 🐉✨", 7000);
  });

  /* ---------- Başlat ---------- */
  gorunumGuncelle();
  if (ayar.mod === "dolas") yeniHedefSec();
  requestAnimationFrame(animasyon);

  // İlk karşılama ipucu (biraz gecikmeli, yumuşak)
  const ipuclari = SAYFA_IPUCLARI[sayfa] || SAYFA_IPUCLARI["index.html"];
  let ipucuIndeks = 0;
  setTimeout(() => {
    if (!panelAcik && !ayar.gizli) balonGoster(ipuclari[0], 6500);
  }, 2400);

  // Arada sırada yeni sayfaya özel ipucu fısılda
  setInterval(() => {
    if (ayar.gizli || panelAcik || document.hidden) return;
    ipucuIndeks = (ipucuIndeks + 1) % ipuclari.length;
    balonGoster(ipuclari[ipucuIndeks], 5500);
  }, 38000);
})();
