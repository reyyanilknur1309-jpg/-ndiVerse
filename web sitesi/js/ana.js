/* ================= Ana sayfa: canlı sayılar + evrim yolculuğu (v3) ================= */
(function () {
  const oyunlar = IV.oyunlariGetir();
  const gonderiler = IV.oku("indieverse_gonderiler", []);
  const hesaplar = IV.oku("indieverse_hesaplar", []);
  const oy = oyunlar.reduce((t, o) => t + Object.keys(o.oylar || {}).length, 0);
  const yorum = oyunlar.reduce((t, o) => t + (o.yorumlar || []).length, 0)
    + gonderiler.reduce((t, g) => t + (g.yorumlar || []).length, 0);

  function say(id, hedef) {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hedef) { el.textContent = hedef; return; }
    const sure = 900, bas = performance.now();
    (function adim(t) {
      const k = Math.min(1, (t - bas) / sure);
      el.textContent = Math.round(hedef * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(adim);
    })(bas);
  }
  say("statOyun", oyunlar.length);
  say("statOy", oy);
  say("statYorum", yorum);
  say("statUye", hesaplar.length);

  /* Öne çıkan oyun: güvenilir puanı en yüksek oyun */
  const kutu = document.getElementById("haftaninOyunu");
  if (kutu) {
    const C = IV.genelOrtalama(oyunlar);
    const sirali = oyunlar.filter(o => IV.ortalama(o).adet > 0)
      .sort((a, b) => IV.agirlikliPuan(b, C) - IV.agirlikliPuan(a, C));
    const o = sirali[0];
    if (o) {
      const p = IV.ortalama(o);
      kutu.innerHTML = `
        <span class="etiket durum">🏆 Haftanın Oyunu</span>
        <h3><a class="oyun-baslik-link" href="oyun.html?id=${encodeURIComponent(o.id)}">${IV.temiz(o.ad)}</a></h3>
        <p class="studyo">${IV.temiz(o.studyo)} · ${IV.temiz(IV.turler[o.tur] || o.tur)}</p>
        <p>${IV.temiz(o.aciklama)}</p>
        <p class="puan-bilgi"><span class="puan-sayi" style="font-size:1.3rem;">${p.ort.toFixed(1)}</span> ★ · ${p.adet} oy · güvenilir puan ${IV.agirlikliPuan(o, C).toFixed(2)}</p>
        <a class="buton" href="oyun.html?id=${encodeURIComponent(o.id)}">Oyunu İncele →</a>`;
    }
  }

  /* Evrim yolculuğu kartları (XP eşiği + evrim şartı) */
  const yol = document.getElementById("seviyeIzgara");
  if (yol) {
    yol.innerHTML = IV.seviyeler.map((s, k) => `
      <article class="seviye-kart">
        <span class="sira">${k + 1}</span>
        <img src="${IV.rozetUrl(s)}" alt="${IV.temiz(s.ad)}" loading="lazy">
        <h3>${IV.temiz(s.ad)}</h3>
        <p class="seviye-esik">${s.esik} XP</p>
        ${s.sartMetin ? `<p class="seviye-sart">🔒 ${IV.temiz(s.sartMetin)}</p>` : `<p class="seviye-sart">🌊 Başlangıç formu</p>`}
        <p class="seviye-slogan">“${IV.temiz(s.slogan)}”</p>
        <p class="puan-bilgi">${IV.temiz(s.aciklama)}</p>
        <div class="etiketler">${s.ozellikler.map(o => `<span class="etiket durum">${IV.temiz(o)}</span>`).join("")}</div>
      </article>`).join("");
  }
})();
