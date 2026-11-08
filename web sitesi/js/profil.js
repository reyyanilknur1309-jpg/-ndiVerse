/* ================= Profil sayfası: seviye, başarımlar, favoriler ================= */
(function () {
  const profil = document.getElementById("profil");
  const basarimAlan = document.getElementById("basarim-alan");
  const favoriAlan = document.getElementById("favori-alan");
  const basarimlar = document.getElementById("basarimlar");
  const basarimOzet = document.getElementById("basarimOzet");
  const favoriler = document.getElementById("favoriler");

  const oturum = IV.oku("indieverse_oturum", null);
  if (!oturum) {
    profil.innerHTML = '<div class="bos-mesaj">Profilini görmek için <a href="uye.html">giriş yap ya da üye ol</a>. 🐟</div>';
    basarimAlan.hidden = true;
    favoriAlan.hidden = true;
    return;
  }

  const hesap = IV.oku("indieverse_hesaplar", [])
    .find(h => IV.kucuk(h.kullanici) === IV.kucuk(oturum.kullanici)) || {};

  function renk(ad) {
    let h = 0;
    for (const c of String(ad)) h = (h * 31 + c.charCodeAt(0)) % 360;
    return "hsl(" + h + ", 65%, 45%)";
  }

  function profilCiz() {
    const ist = IV.kullaniciIstatistik(oturum.kullanici);
    const { sv, sonraki } = IV.seviyeBul(ist.puan);
    const harf = IV.temiz((Array.from(oturum.kullanici)[0] || "?").toUpperCase());
    const yuzde = sonraki
      ? Math.min(100, Math.round((ist.puan - sv.esik) / (sonraki.esik - sv.esik) * 100)) : 100;
    const ilgiler = (hesap.ilgi || []).map(t =>
      '<span class="etiket">' + IV.temiz(IV.turler[t] || t) + "</span>").join("");
    const ozellikler = sv.ozellikler.map(o => '<span class="etiket durum">' + IV.temiz(o) + "</span>").join("");

    profil.innerHTML = `
      <div class="yan-kutu">
        <div class="rozet-ortala"><img class="rozet-buyuk" src="${IV.rozetUrl(sv)}" alt="${IV.temiz(sv.ad)}"></div>
        <div class="profil-ust">
          <div class="avatar buyuk" style="background:${renk(oturum.kullanici)}">${harf}</div>
          <div>
            <b>${IV.temiz(oturum.kullanici)}</b>
            <div class="studyo">${hesap.rol === "gelistirici" ? "🛠️ Geliştirici" : "🎮 Oyuncu"}</div>
          </div>
        </div>
        <p class="seviye-satir"><b>${IV.temiz(sv.ad)}</b> · ${ist.puan} puan</p>
        <p class="seviye-slogan">“${IV.temiz(sv.slogan)}”</p>
        <div class="etiketler" style="margin-bottom:10px;">${ozellikler}</div>
        <div class="ilerleme" title="%${yuzde}"><div style="width:${yuzde}%"></div></div>
        <p class="puan-bilgi">${sonraki
          ? IV.temiz(sonraki.ad) + " için " + (sonraki.esik - ist.puan) + " puan kaldı."
          : "En üst seviyedesin! 🎉"}</p>
        <p class="puan-bilgi" style="margin-top:8px;">📝 ${ist.paylasim} paylaşım · 💬 ${ist.yorum} yorum · ❤️ ${ist.begeni} beğeni · ⭐ ${ist.puanlanan} oyun puanı</p>
        <div class="etiketler" style="margin-top:10px;">${ilgiler}</div>
      </div>`;
  }

  function basarimCiz() {
    const B = window.IVBasarim;
    if (!B) return;
    const d = B.durum(oturum.kullanici);
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

  function favoriCiz() {
    const acik = IV.acikKartlar(favoriler);
    const idler = IV.oku("indieverse_favoriler", []);
    const liste = IV.oyunlariGetir().filter(o => idler.includes(o.id));
    favoriler.innerHTML = liste.length
      ? liste.map(o => IV.kartHtml(o)).join("")
      : '<div class="bos-mesaj">Henüz favorin yok. <a href="oyuncu.html">Oyun Keşfet</a> sayfasında kartlardaki 🤍 simgesine tıkla.</div>';
    IV.acikKartlariGeriYukle(favoriler, acik);
  }

  function hepsiniCiz() { profilCiz(); basarimCiz(); favoriCiz(); }

  IV.baglaKartOlaylari(favoriler, () => hepsiniCiz());
  document.addEventListener("favoriDegisti", () => { basarimCiz(); favoriCiz(); });
  window.addEventListener("storage", hepsiniCiz);
  hepsiniCiz();
})();
