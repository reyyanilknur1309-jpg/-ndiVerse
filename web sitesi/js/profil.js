/* ================= Profil sayfası (v3) =================
   Gelişmiş seviye barı (I-II-III kademe, seri/kombo çarpanı,
   evrim şartları, 3 uzmanlık dalı), evrim yolculuğu, günlük
   görevler, seri, başarımlar, favoriler, sıralama ve XP geçmişi.
======================================================== */
(function () {
  const profil = document.getElementById("profil");
  const profilAlan = document.getElementById("profil-alan");
  const basarimAlan = document.getElementById("basarim-alan");
  const favoriAlan = document.getElementById("favori-alan");
  const basarimlar = document.getElementById("basarimlar");
  const basarimOzet = document.getElementById("basarimOzet");
  const favoriler = document.getElementById("favoriler");

  const kullanici = IV.oturum();
  if (!kullanici || !IV.hesapBul(kullanici)) {
    profil.innerHTML = '<div class="bos-mesaj">Profilini görmek için <a href="uye.html">giriş yap ya da üye ol</a>. 🐟</div>';
    basarimAlan.hidden = true;
    favoriAlan.hidden = true;
    return;
  }
  const hesap = IV.hesapBul(kullanici) || {};

  function yeniBolum(id, hedef, konum) {
    const s = document.createElement("section");
    s.id = id;
    hedef.insertAdjacentElement(konum, s);
    return s;
  }
  const yolAlan = yeniBolum("yolculuk-alan", profilAlan, "afterend");
  const gorevAlan = yeniBolum("gorev-alan", yolAlan, "afterend");
  const liderAlan = yeniBolum("lider-alan", favoriAlan, "afterend");
  const gecmisAlan = yeniBolum("gecmis-alan", liderAlan, "afterend");

  function renk(ad) {
    let h = 0;
    for (const c of String(ad)) h = (h * 31 + c.charCodeAt(0)) % 360;
    return "hsl(" + h + ", 65%, 45%)";
  }
  function zamanOnce(ts) {
    const dk = Math.floor((Date.now() - ts) / 60000);
    if (dk < 1) return "şimdi";
    if (dk < 60) return dk + " dk önce";
    const sa = Math.floor(dk / 60);
    if (sa < 24) return sa + " saat önce";
    return Math.floor(sa / 24) + " gün önce";
  }

  /* ---------- Profil kartı + v3 Seviye Barı ---------- */
  function profilCiz() {
    const ist = IV.kullaniciIstatistik(kullanici);
    const o = IV.seviyeOzet(ist.puan, kullanici);
    const sv = o.sv;
    const harf = IV.temiz((Array.from(kullanici)[0] || "?").toUpperCase());
    const seri = IV.seri(kullanici);
    const ilgiler = (hesap.ilgi || []).map(t =>
      '<span class="etiket">' + IV.temiz(IV.turler[t] || t) + "</span>").join("");
    const ozellikler = sv.ozellikler.map(x => '<span class="etiket durum">' + IV.temiz(x) + "</span>").join("");

    profil.innerHTML = `
      <div class="yan-kutu">
        <div class="rozet-ortala"><img class="rozet-buyuk" src="${IV.rozetUrl(sv)}" alt="${IV.temiz(sv.ad)}"></div>
        <div class="profil-ust">
          <div class="avatar buyuk cerceveli" style="background:${renk(kullanici)};--r:${sv.renk}">${harf}</div>
          <div>
            <b>${IV.temiz(kullanici)}</b>
            <div class="studyo">${hesap.rol === "gelistirici" ? "🛠️ Geliştirici" : "🎮 Oyuncu"} · 🔥 ${seri.seri} günlük seri</div>
          </div>
        </div>
        <p class="seviye-satir"><b>Sv. ${o.seviyeNo} · ${IV.temiz(sv.ad)} ${o.kademeRoma}</b> · ${ist.puan} XP</p>
        <p class="seviye-slogan">“${IV.temiz(sv.slogan)}”</p>
        <div class="etiketler" style="margin-bottom:12px;">${ozellikler}</div>
        ${IV.xpBarHtml(ist.puan, kullanici, { detayli: true })}
        <p class="puan-bilgi" style="margin-top:12px;">📝 ${ist.paylasim} paylaşım · 💬 ${ist.yorum} yorum · ❤️ ${ist.begeni} tepki · ⭐ ${ist.puanlanan} oyun puanı · 🎯 ${ist.detayPuan} detaylı puanlama</p>
        <div class="etiketler" style="margin-top:10px;">${ilgiler}</div>
        <p style="margin-top:14px;"><button type="button" class="ikincil" id="cikisBtn">Çıkış Yap</button></p>
      </div>`;
  }

  /* ---------- Evrim yolculuğu ---------- */
  function yolCiz() {
    const puan = IV.xpToplam(kullanici);
    yolAlan.innerHTML = `
      <h2>🐉 Evrim yolculuğu</h2>
      <p>Yedi formun hepsi burada. Her form I, II, III kademelerinden geçer; yeni forma dönüşmek için hem XP eşiği hem evrim şartı gerekir.</p>
      ${IV.yolculukHtml(puan, kullanici)}
      <p class="puan-bilgi" style="margin-top:6px;">XP ve Çarpan Kuralları:</p>
      <div class="xp-kurallar">
        <span class="etiket durum">🚀 Oyun yayınla +8</span>
        <span class="etiket durum">📝 Paylaşım +4</span>
        <span class="etiket durum">📌 Ekip ilanı +4</span>
        <span class="etiket durum">⭐ Oyun puanı +3</span>
        <span class="etiket durum">🎯 4 Kriter Kritik +3</span>
        <span class="etiket durum">💬 Yorum +2</span>
        <span class="etiket durum">✨ 50+ krk inceleme +2</span>
        <span class="etiket durum">✅ Görev +5</span>
        <span class="etiket durum">🔥 Seri Çarpanı 2×</span>
        <span class="etiket durum">⚡ Kombo Çarpanı 1.5×</span>
      </div>
      <p class="puan-bilgi" style="margin-top:8px;">Aynı gün farklı eylemler yaptıkça Kombo Çarpanın yükselir; spam olmasın diye günlük limitler uygulanır.</p>`;
  }

  /* ---------- Görevler ve seri ---------- */
  function gorevCiz() {
    const gorevler = IV.gunlukGorevler(kullanici);
    const seri = IV.seri(kullanici);
    const carpan = IV.carpanBilgi(kullanici);
    const giris = new Set(IV.xpListe(kullanici).filter(x => x.t === "giris").map(x => IV.gun(x.z)));
    const gunAd = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
    const noktalar = Array.from({ length: 7 }, (_, k) => {
      const ts = Date.now() - (6 - k) * 864e5;
      return '<span class="' + (giris.has(IV.gun(ts)) ? "var" : "") + '" title="' + IV.gun(ts) + '">' + gunAd[new Date(ts).getDay()] + "</span>";
    }).join("");

    gorevAlan.innerHTML = `
      <div class="iki-sutun">
        <div>
          <h2>🎯 Bugünün görevleri</h2>
          <p>Her görev +5 XP verir. Yarın yeni görevler gelir.</p>
          ${gorevler.map(g => `
            <div class="gorev ${g.tamam ? "tamam" : ""}">
              <div class="gorev-ust"><b>${g.tamam ? "✅ " : ""}${IV.temiz(g.ad)}</b><span class="odul">${g.tamam ? "Alındı" : "+5 XP"}</span></div>
              <div class="cubuk"><div style="width:${Math.round(g.say / g.hedef * 100)}%"></div></div>
              <small class="puan-bilgi">${g.say} / ${g.hedef}</small>
            </div>`).join("")}
        </div>
        <div class="yan-kutu seri-kutu">
          <h3>🔥 Giriş serisi & Çarpan</h3>
          <div class="seri-sayi">${seri.seri}<small class="puan-bilgi"> gün (×${carpan.seriCarpan})</small></div>
          <p class="puan-bilgi">En uzun seri: ${seri.enUzun} gün. Aktif toplam çarpanın: <b>×${carpan.toplam}</b>.</p>
          <div class="seri-noktalar" aria-label="Son 7 gün">${noktalar}</div>
        </div>
      </div>`;
  }

  /* ---------- Başarımlar ---------- */
  function basarimCiz() {
    const B = window.IVBasarim;
    if (!B) return;
    const d = B.durum(kullanici);
    let acilan = 0;
    basarimlar.innerHTML = B.liste.map(b => {
      const deger = Math.min(b.deger(d), b.hedef);
      const tamam = deger >= b.hedef;
      if (tamam) acilan++;
      return `
        <div class="basarim-kart ${tamam ? "acik" : "kilitli"}">
          <span class="b-ikon">${tamam ? b.ikon : "🔒"}</span>
          <b>${IV.temiz(b.ad)}</b>
          <p class="puan-bilgi">${IV.temiz(b.aciklama)}</p>
          <div class="ilerleme"><div style="width:${Math.round(deger / b.hedef * 100)}%"></div></div>
          <small class="puan-bilgi">${deger} / ${b.hedef}</small>
        </div>`;
    }).join("");
    basarimOzet.textContent = acilan + " / " + B.liste.length + " başarım açıldı.";
  }

  /* ---------- Favoriler ---------- */
  function favoriCiz() {
    const acik = IV.acikKartlar(favoriler);
    const idler = IV.favoriler();
    const liste = IV.oyunlariGetir().filter(o => idler.includes(o.id));
    favoriler.innerHTML = liste.length
      ? liste.map(o => IV.kartHtml(o)).join("")
      : '<div class="bos-mesaj">Henüz favorin yok. <a href="oyuncu.html">Oyun Keşfet</a> sayfasında kartlardaki 🤍 simgesine tıkla.</div>';
    IV.acikKartlariGeriYukle(favoriler, acik);
  }

  /* ---------- Sıralama ve geçmiş ---------- */
  function liderCiz() {
    liderAlan.innerHTML = "<h2>🏆 Haftalık sıralama</h2><p>Son 7 günde en çok XP kazananlar. “örnek” yazanlar demo kullanıcılardır.</p><ol class=\"lider\">" +
      IV.liderler(10).map((x, k) => {
        const sv = IV.seviyeBul(x.toplam, x.ad).sv;
        const ben = IV.kucuk(x.ad) === IV.kucuk(kullanici);
        return '<li class="' + (ben ? "ben" : "") + '"><span class="sira">' + (["🥇", "🥈", "🥉"][k] || k + 1) +
          '</span><img src="' + IV.rozetUrl(sv, true) + '" alt=""><span><b>' + IV.temiz(x.ad) + "</b>" +
          (x.demo ? " <small>örnek</small>" : "") + (ben ? " <small>sen</small>" : "") + '</span><span class="xp">' + x.hafta + " XP</span></li>";
      }).join("") + "</ol>";
  }

  function gecmisCiz() {
    const l = IV.xpGecmis(kullanici, 12);
    gecmisAlan.innerHTML = "<h2>🕑 XP geçmişi</h2><p>Son kazandığın puanlar ve uygulanan çarpanlar.</p>" + (l.length
      ? '<ul class="gecmis">' + l.map(x => {
          const e = IV.XP_ETIKET[x.t] || ["✨", x.t];
          const carpanEtiket = x.c && x.c > 1 ? " · ×" + x.c : "";
          return "<li><span>" + e[0] + "</span><span>" + IV.temiz(e[1]) + ' <small>· ' + zamanOnce(x.z) + carpanEtiket + '</small></span><span class="artis">+' + x.m + " XP</span></li>";
        }).join("") + "</ul>"
      : '<div class="bos-mesaj">Henüz XP kazanmadın. Bir oyunu puanla ya da toplulukta paylaşım yap.</div>');
  }

  function hepsiniCiz() { profilCiz(); yolCiz(); gorevCiz(); basarimCiz(); favoriCiz(); liderCiz(); gecmisCiz(); }

  profil.addEventListener("click", e => {
    if (!e.target.closest("#cikisBtn")) return;
    localStorage.removeItem("indieverse_oturum");
    location.href = "uye.html";
  });

  IV.baglaKartOlaylari(favoriler, () => hepsiniCiz());
  document.addEventListener("favoriDegisti", () => { profilCiz(); basarimCiz(); favoriCiz(); });
  document.addEventListener("xpDegisti", hepsiniCiz);
  window.addEventListener("storage", hepsiniCiz);
  hepsiniCiz();
})();
