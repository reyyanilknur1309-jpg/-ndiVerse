/* ================= Üyelik: kayıt, giriş, profil ================= */
(function () {
  const HESAPLAR = "indieverse_hesaplar";
  const OTURUM = "indieverse_oturum";

  const kayitF = document.getElementById("kayitFormu");
  const girisF = document.getElementById("girisFormu");
  const sekmeler = document.getElementById("uyeSekmeler");
  const mesaj = document.getElementById("uyeMesaj");
  const profilKutusu = document.getElementById("profilKutusu");
  const gucCubuk = document.getElementById("gucCubuk");
  const gucYazi = document.getElementById("gucYazi");

  /* ---------- Yardımcılar ---------- */
  async function hashle(s) {
    const veri = "indieverse-demo" + s;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(veri));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 5381;
    for (const c of veri) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return "d" + (h >>> 0).toString(16);
  }
  function hesaplar() { return IV.oku(HESAPLAR, []); }
  function oturumHesabi() {
    const o = IV.oku(OTURUM, null);
    if (!o) return null;
    return hesaplar().find(h => IV.kucuk(h.kullanici) === IV.kucuk(o.kullanici)) || null;
  }
  function mesajGoster(metin, tur) {
    mesaj.textContent = metin;
    mesaj.className = "uye-mesaj " + tur;
    mesaj.hidden = false;
  }
  function renk(ad) {
    let h = 0;
    for (const c of String(ad)) h = (h * 31 + c.charCodeAt(0)) % 360;
    return "hsl(" + h + ", 65%, 45%)";
  }

  /* ---------- Profil kartı ---------- */
  function seviyeListesiCiz(aktifIndex) {
    const kutu = document.getElementById("seviyeListe");
    if (!kutu) return;
    kutu.innerHTML = IV.seviyeler.map((s, k) => `
      <li class="${k === aktifIndex ? "aktif" : ""} ${aktifIndex >= 0 && k > aktifIndex ? "kilitli" : ""}">
        <img src="${IV.rozetUrl(s, true)}" alt="${IV.temiz(s.ad)}">
        <div><b>${IV.temiz(s.ad)}</b><small>${s.esik} puan</small></div>
      </li>`).join("");
  }

  function profilCiz() {
    const h = oturumHesabi();
    if (!h) {
      profilKutusu.innerHTML = `
        <h3>👤 Profil</h3>
        <div class="rozet-ortala"><img class="rozet-buyuk" src="${IV.rozetUrl(IV.seviyeler[0])}" alt="Balık"></div>
        <p>Henüz giriş yapmadın. Üye ol ya da giriş yap; yolculuğun <b>Balık</b> olarak başlar.</p>`;
      seviyeListesiCiz(-1);
      return;
    }
    const ist = IV.kullaniciIstatistik(h.kullanici);
    const { i, sv, sonraki } = IV.seviyeBul(ist.puan);
    const harf = IV.temiz((Array.from(h.kullanici)[0] || "?").toUpperCase());
    const ilgiler = (h.ilgi || []).map(t =>
      '<span class="etiket">' + IV.temiz(IV.turler[t] || t) + "</span>").join("");
    const ozellikler = sv.ozellikler.map(o => `<span class="etiket durum">${IV.temiz(o)}</span>`).join("");
    const yuzde = sonraki
      ? Math.min(100, Math.round((ist.puan - sv.esik) / (sonraki.esik - sv.esik) * 100)) : 100;

    profilKutusu.innerHTML = `
      <h3>👤 Profilim</h3>
      <div class="rozet-ortala"><img class="rozet-buyuk" src="${IV.rozetUrl(sv)}" alt="${IV.temiz(sv.ad)}"></div>
      <div class="profil-ust">
        <div class="avatar buyuk" style="background:${renk(h.kullanici)}">${harf}</div>
        <div>
          <b>${IV.temiz(h.kullanici)}</b>
          <div class="studyo">${h.rol === "gelistirici" ? "🛠️ Geliştirici" : "🎮 Oyuncu"}</div>
        </div>
      </div>
      <p class="seviye-satir"><b>${IV.temiz(sv.ad)}</b> · ${ist.puan} puan</p>
      <p class="seviye-slogan">“${IV.temiz(sv.slogan)}”</p>
      <div class="etiketler" style="margin-bottom:10px;">${ozellikler}</div>
      <div class="ilerleme" title="%${yuzde}"><div style="width:${yuzde}%"></div></div>
      <p class="puan-bilgi">${sonraki
        ? sonraki.ad + " için " + (sonraki.esik - ist.puan) + " puan kaldı."
        : "En üst seviyedesin! 🎉"}</p>
      <p class="puan-bilgi" style="margin-top:8px;">📝 ${ist.paylasim} paylaşım · 💬 ${ist.yorum} yorum · ❤️ ${ist.begeni} beğeni · ⭐ ${ist.puanlanan} oyun puanı</p>
      <div class="etiketler" style="margin-top:10px;">${ilgiler}</div>
      <p style="margin-top:12px;">
        <a class="buton" href="topluluk.html">Topluluğa Git</a>
        <button type="button" class="ikincil" id="cikisBtn">Çıkış Yap</button>
      </p>`;
    seviyeListesiCiz(i);
  }

  /* ---------- Şifre gücü ---------- */
  function gucGuncelle() {
    const s = kayitF.sifre.value;
    let puan = 0;
    if (s.length >= 6) puan++;
    if (s.length >= 10) puan++;
    if (/[a-zçğıöşü]/.test(s) && /[A-ZÇĞİÖŞÜ]/.test(s)) puan++;
    if (/\d/.test(s) && /[^\p{L}\p{N}]/u.test(s)) puan++;
    if (!s) puan = 0;
    const renkler = ["transparent", "#ff6b8b", "#ffb84c", "#4cc9ff", "#7dffb0"];
    const yazilar = ["", "Zayıf", "Orta", "Güçlü", "Çok güçlü"];
    gucCubuk.style.width = (puan * 25) + "%";
    gucCubuk.style.background = renkler[puan];
    gucYazi.textContent = yazilar[puan];
  }
  kayitF.sifre.addEventListener("input", gucGuncelle);

  document.getElementById("sifreGoster").addEventListener("change", e => {
    const tip = e.target.checked ? "text" : "password";
    kayitF.sifre.type = tip;
    kayitF.sifre2.type = tip;
  });

  /* ---------- Sekmeler ---------- */
  sekmeler.addEventListener("click", e => {
    const b = e.target.closest(".sekme");
    if (!b) return;
    sekmeler.querySelectorAll(".sekme").forEach(x => x.classList.toggle("aktif", x === b));
    kayitF.hidden = b.dataset.sekme !== "kayit";
    girisF.hidden = b.dataset.sekme !== "giris";
    mesaj.hidden = true;
  });

  /* ---------- Kayıt ---------- */
  kayitF.addEventListener("submit", async e => {
    e.preventDefault();
    const kullanici = kayitF.kullanici.value.trim();
    const eposta = kayitF.eposta.value.trim();
    const sifre = kayitF.sifre.value;
    const sifre2 = kayitF.sifre2.value;

    if (!/^[\p{L}\p{N}_.-]{3,20}$/u.test(kullanici)) {
      return mesajGoster("Kullanıcı adı 3-20 karakter olmalı; harf, rakam, _ . - kullanabilirsin.", "hata");
    }
    if (sifre.length < 6) return mesajGoster("Şifre en az 6 karakter olmalı.", "hata");
    if (sifre !== sifre2) return mesajGoster("Şifreler aynı değil.", "hata");

    const liste = hesaplar();
    if (liste.some(h => IV.kucuk(h.kullanici) === IV.kucuk(kullanici))) {
      return mesajGoster("Bu kullanıcı adı alınmış, başka bir tane dene.", "hata");
    }
    if (liste.some(h => IV.kucuk(h.eposta) === IV.kucuk(eposta))) {
      return mesajGoster("Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.", "hata");
    }

    liste.push({
      kullanici,
      eposta,
      sifre: await hashle(sifre),
      rol: kayitF.querySelector('input[name="rol"]:checked').value,
      ilgi: [...kayitF.querySelectorAll('input[name="ilgi"]:checked')].map(c => c.value),
      kayit: Date.now()
    });
    IV.yaz(HESAPLAR, liste);
    IV.yaz(OTURUM, { kullanici });

    kayitF.reset();
    gucGuncelle();
    mesajGoster("🎉 Hoş geldin, " + kullanici + "! Hesabın oluşturuldu ve giriş yaptın.", "ok");
    profilCiz();
  });

  /* ---------- Giriş ---------- */
  girisF.addEventListener("submit", async e => {
    e.preventDefault();
    const kimlik = IV.kucuk(girisF.kimlik.value.trim());
    const hesap = hesaplar().find(h =>
      IV.kucuk(h.kullanici) === kimlik || IV.kucuk(h.eposta) === kimlik);

    if (!hesap || hesap.sifre !== await hashle(girisF.sifre.value)) {
      return mesajGoster("Kullanıcı adı/e-posta veya şifre hatalı.", "hata");
    }
    IV.yaz(OTURUM, { kullanici: hesap.kullanici });
    girisF.reset();
    mesajGoster("✅ Giriş yapıldı. Tekrar hoş geldin, " + hesap.kullanici + "!", "ok");
    profilCiz();
  });

  /* ---------- Çıkış ---------- */
  profilKutusu.addEventListener("click", e => {
    if (!e.target.closest("#cikisBtn")) return;
    localStorage.removeItem(OTURUM);
    mesajGoster("Çıkış yaptın. Görüşmek üzere! 🐉", "ok");
    profilCiz();
  });

  window.addEventListener("storage", e => {
    if (e.key === OTURUM || e.key === HESAPLAR || e.key === "indieverse_gonderiler" || e.key === IV.ANAHTAR) profilCiz();
  });

  profilCiz();
})();