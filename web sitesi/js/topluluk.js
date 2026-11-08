/* ================= Topluluk: paylaşım akışı ================= */
(function () {
  const ANAHTAR = "indieverse_gonderiler";
  const AD_ANAHTAR = "indieverse_ad";
  const ben = IV.oyuncuId();

  const form = document.getElementById("gonderiFormu");
  const puanAlani = document.getElementById("puanAlani");
  const oyunListesi = document.getElementById("oyunListesi");
  const akis = document.getElementById("akis");
  const sekmeler = document.getElementById("sekmeler");
  const arama = document.getElementById("akisArama");
  const etiketBulutu = document.getElementById("etiketBulutu");
  const enIyiler = document.getElementById("enIyiler");
  const istatistik = document.getElementById("istatistik");

  let aktifSekme = "akis";
  const acikYorumlar = new Set();

  /* ---------- Veri ---------- */
  function ornekler() {
    const s = Date.now();
    return [
      {
        id: "p1", kisi: "Deniz", tur: "yorum", oyun: "Kayıp Prenses", puan: 5,
        metin: "Saray bölümündeki ses tasarımı ürpertici! Bence yılın en iyi indie korku demosu. #korku #prenses",
        zaman: s - 3 * 3600000, begeniler: ["a1", "a2", "a3"],
        yorumlar: [{ kisi: "Mert", metin: "Ben de çok sevdim, ikinci bölümü bekliyorum!", zaman: s - 2 * 3600000 }],
        sahip: "x1"
      },
      {
        id: "p2", kisi: "Elif", tur: "oneri", oyun: "Bulut Atlayıcı", puan: 0,
        metin: "Rahatlamak isteyenlere öneririm: kısa, tatlı ve hiç zorlamıyor. #cozy #platform",
        zaman: s - 5 * 3600000, begeniler: ["a1", "a2"], yorumlar: [], sahip: "x2"
      },
      {
        id: "p3", kisi: "Mavi Ejder Oyunları", tur: "paylasim", oyun: "Ejderha Yolu", puan: 0,
        metin: "Yeni demo yayında! Balığınızı hızlandırın, ejderhaya dönüşsün 🐉 Geri bildirimlerinizi bekliyoruz. #demo #ejderha",
        zaman: s - 26 * 3600000, begeniler: ["a1", "a2", "a3", "a4"], yorumlar: [], sahip: "x3"
      },
      {
        id: "p4", kisi: "Cem", tur: "oneri", oyun: "Gece Vardiyası", puan: 0,
        metin: "Dedektif oyunlarını sevenler kaçırmasın, hikâye çok sürükleyici. #dedektif #piksel",
        zaman: s - 30 * 3600000, begeniler: ["a1"], yorumlar: [], sahip: "x4"
      }
    ];
  }
  function getir() {
    let l = IV.oku(ANAHTAR, null);
    if (!l) { l = ornekler(); IV.yaz(ANAHTAR, l); }
    return l;
  }
  function kaydet(l) { IV.yaz(ANAHTAR, l); }
    function kayitliAd() {
    const o = IV.oku("indieverse_oturum", null);
    return (o && o.kullanici) || IV.oku(AD_ANAHTAR, "");
  }

  /* ---------- Yardımcılar ---------- */
  function zamanOnce(ts) {
    const dk = Math.floor((Date.now() - ts) / 60000);
    if (dk < 1) return "şimdi";
    if (dk < 60) return dk + " dk önce";
    const sa = Math.floor(dk / 60);
    if (sa < 24) return sa + " saat önce";
    return Math.floor(sa / 24) + " gün önce";
  }
  function renk(ad) {
    let h = 0;
    for (const c of String(ad)) h = (h * 31 + c.charCodeAt(0)) % 360;
    return "hsl(" + h + ", 65%, 45%)";
  }
  function metinHtml(m) {
    return IV.temiz(m).replace(/(^|\s)#([\p{L}\p{N}_]+)/gu,
      (t, bosluk, e) => bosluk + '<a href="#" class="hashtag" data-etiket="' + e + '">#' + e + "</a>");
  }

  /* ---------- Gönderi kartı ---------- */
  function kartHtml(g) {
    const harf = IV.temiz((Array.from(String(g.kisi).trim())[0] || "?").toUpperCase());
    const turEtiket = { yorum: "💬 Yorum", oneri: "💡 Öneri", paylasim: "📢 Paylaşım" }[g.tur] || "📢 Paylaşım";
    const begendi = g.begeniler.includes(ben);
    const yildiz = g.puan
      ? '<span class="g-yildiz">' + "★".repeat(g.puan) + "☆".repeat(5 - g.puan) + "</span>" : "";
    const oyun = g.oyun ? '<div><span class="etiket durum">🎮 ' + IV.temiz(g.oyun) + "</span>" + yildiz + "</div>" : "";
    const yorumlar = g.yorumlar.map(y =>
      '<div class="yorum"><b>' + IV.temiz(y.kisi) + ":</b> " + IV.temiz(y.metin) +
      " <small>· " + zamanOnce(y.zaman) + "</small></div>").join("");
    const sil = g.sahip === ben
      ? '<button type="button" class="ikincil" data-sil="' + g.id + '">🗑️</button>' : "";

    return `
      <article class="gonderi" data-id="${g.id}">
        <div class="g-ust">
          <div class="avatar" style="background:${renk(g.kisi)}">${harf}</div>
          <div>
            <b>${IV.temiz(g.kisi)}</b>
            <div class="studyo">${zamanOnce(g.zaman)}</div>
          </div>
          <span class="etiket durum g-tur">${turEtiket}</span>
        </div>
        ${oyun}
        <p class="g-metin">${metinHtml(g.metin)}</p>
        <div class="g-aksiyon">
          <button type="button" class="ikincil ${begendi ? "begendi" : ""}" data-begen="${g.id}">${begendi ? "❤️" : "🤍"} ${g.begeniler.length}</button>
          <button type="button" class="ikincil" data-yorum-ac="${g.id}">💬 ${g.yorumlar.length}</button>
          ${sil}
        </div>
        <div class="g-yorumlar" ${acikYorumlar.has(g.id) ? "" : "hidden"}>
          ${yorumlar}
          <form class="g-yorum-formu">
            <p><input type="text" name="kisi" placeholder="Adın" required maxlength="30" value="${IV.temiz(kayitliAd())}"></p>
            <p><input type="text" name="metin" placeholder="Yorumun..." required maxlength="250"></p>
            <button type="submit" class="ikincil">Yorum Yap</button>
          </form>
        </div>
      </article>`;
  }

  /* ---------- Çizim ---------- */
  function filtrele() {
    const q = IV.kucuk(arama.value).trim();
    let l = getir().filter(g => {
      if (aktifSekme === "oneri" && g.tur !== "oneri") return false;
      if (aktifSekme === "yorum" && g.tur !== "yorum") return false;
      if (q && !IV.kucuk(g.kisi + " " + g.oyun + " " + g.metin).includes(q)) return false;
      return true;
    });
    if (aktifSekme === "populer") {
      l.sort((a, b) => (b.begeniler.length * 2 + b.yorumlar.length) - (a.begeniler.length * 2 + a.yorumlar.length));
    } else {
      l.sort((a, b) => b.zaman - a.zaman);
    }
    return l;
  }

  function cizAkis() {
    const l = filtrele();
    akis.innerHTML = l.length
      ? l.map(kartHtml).join("")
      : '<div class="bos-mesaj">Henüz burada bir şey yok. İlk paylaşımı sen yap! 🐉</div>';
  }

  function cizYan() {
    const tum = getir();

    const sayac = {};
    tum.forEach(g => {
      (g.metin.match(/(^|\s)#([\p{L}\p{N}_]+)/gu) || []).forEach(t => {
        const e = IV.kucuk(t.trim().slice(1));
        sayac[e] = (sayac[e] || 0) + 1;
      });
    });
    const top = Object.entries(sayac).sort((a, b) => b[1] - a[1]).slice(0, 8);
    etiketBulutu.innerHTML = top.length
      ? top.map(([e, n]) => '<span class="etiket tikla" data-etiket="' + IV.temiz(e) + '">#' + IV.temiz(e) + " · " + n + "</span>").join("")
      : "<p>Henüz etiket yok.</p>";

    const iyiler = IV.oyunlariGetir()
      .map(o => ({ o, p: IV.ortalama(o) }))
      .filter(x => x.p.adet > 0)
      .sort((a, b) => IV.agirlikliPuan(b.o) - IV.agirlikliPuan(a.o))
      .slice(0, 5);
    enIyiler.innerHTML = iyiler.map(x =>
      "<li><b>" + IV.temiz(x.o.ad) + "</b> ⭐ " + x.p.ort.toFixed(1) + " (" + x.p.adet + " oy)</li>").join("");

    const yorumSayisi = tum.reduce((t, g) => t + g.yorumlar.length, 0);
    const begeniSayisi = tum.reduce((t, g) => t + g.begeniler.length, 0);
    istatistik.textContent = tum.length + " paylaşım · " + yorumSayisi + " yorum · " + begeniSayisi + " beğeni";
  }

  function ciz() { cizAkis(); cizYan(); }

  function oyunListesiDoldur() {
    oyunListesi.innerHTML = IV.oyunlariGetir()
      .map(o => '<option value="' + IV.temiz(o.ad) + '"></option>').join("");
  }

  /* ---------- Paylaşım formu ---------- */
  form.tur.addEventListener("change", () => {
    puanAlani.hidden = form.tur.value !== "yorum";
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const kisi = form.kisi.value.trim();
    const tur = form.tur.value;
    const oyunAdi = form.oyun.value.trim();
    const metin = form.metin.value.trim();
    const puan = tur === "yorum" ? Number(form.puan.value) : 0;

    if ((tur === "yorum" || tur === "oneri") && !oyunAdi) {
      alert("Lütfen oyunun adını yaz.");
      return;
    }

    // Sitedeki bir oyuna yorum yapıldıysa puanı ve yorumu oyunun kartına da işle
    if (tur === "yorum") {
      const oyunlar = IV.oyunlariGetir();
      const oyun = oyunlar.find(o => IV.kucuk(o.ad) === IV.kucuk(oyunAdi));
      if (oyun && !oyun.benim) {
        oyun.oylar = oyun.oylar || {};
        oyun.oylar[ben] = puan;
        if (oyun.beta) {
          oyun.yorumlar = oyun.yorumlar || [];
          oyun.yorumlar.push({ kisi, metin });
        }
        IV.oyunlariKaydet(oyunlar);
      }
    }

    const liste = getir();
    liste.unshift({
      id: "p" + Date.now(), kisi, tur, oyun: oyunAdi, puan, metin,
      zaman: Date.now(), begeniler: [], yorumlar: [], sahip: ben
    });
    kaydet(liste.slice(0, 200));
    IV.yaz(AD_ANAHTAR, kisi);

    form.oyun.value = "";
    form.metin.value = "";
    aktifSekme = "akis";
    arama.value = "";
    sekmeler.querySelectorAll(".sekme").forEach(b => b.classList.toggle("aktif", b.dataset.sekme === "akis"));
    ciz();
  });

  /* ---------- Akıştaki tıklamalar ---------- */
  function etiketeGit(e) {
    arama.value = "#" + e;
    aktifSekme = "akis";
    sekmeler.querySelectorAll(".sekme").forEach(b => b.classList.toggle("aktif", b.dataset.sekme === "akis"));
    cizAkis();
    document.getElementById("akis-alani").scrollIntoView({ behavior: "smooth" });
  }

  akis.addEventListener("click", e => {
    const tag = e.target.closest("[data-etiket]");
    if (tag) { e.preventDefault(); etiketeGit(tag.dataset.etiket); return; }

    const begen = e.target.closest("[data-begen]");
    if (begen) {
      const liste = getir();
      const g = liste.find(x => x.id === begen.dataset.begen);
      if (!g) return;
      const i = g.begeniler.indexOf(ben);
      if (i >= 0) g.begeniler.splice(i, 1); else g.begeniler.push(ben);
      kaydet(liste);
      ciz();
      return;
    }

    const ac = e.target.closest("[data-yorum-ac]");
    if (ac) {
      const id = ac.dataset.yorumAc;
      if (acikYorumlar.has(id)) acikYorumlar.delete(id); else acikYorumlar.add(id);
      cizAkis();
      return;
    }

    const sil = e.target.closest("[data-sil]");
    if (sil) {
      if (!confirm("Bu paylaşımı silmek istediğine emin misin?")) return;
      kaydet(getir().filter(x => x.id !== sil.dataset.sil));
      ciz();
    }
  });

  akis.addEventListener("submit", e => {
    const f = e.target.closest(".g-yorum-formu");
    if (!f) return;
    e.preventDefault();
    const id = f.closest(".gonderi").dataset.id;
    const liste = getir();
    const g = liste.find(x => x.id === id);
    if (!g) return;
    g.yorumlar.push({ kisi: f.kisi.value.trim(), metin: f.metin.value.trim(), zaman: Date.now() });
    kaydet(liste);
    IV.yaz(AD_ANAHTAR, f.kisi.value.trim());
    acikYorumlar.add(id);
    ciz();
  });

  /* ---------- Sekmeler, arama, yan panel ---------- */
  sekmeler.addEventListener("click", e => {
    const b = e.target.closest(".sekme");
    if (!b) return;
    aktifSekme = b.dataset.sekme;
    sekmeler.querySelectorAll(".sekme").forEach(x => x.classList.toggle("aktif", x === b));
    cizAkis();
  });
  arama.addEventListener("input", cizAkis);
  etiketBulutu.addEventListener("click", e => {
    const t = e.target.closest("[data-etiket]");
    if (t) etiketeGit(t.dataset.etiket);
  });

  // Başka sekmede yapılan değişiklikler burada da görünsün
  window.addEventListener("storage", e => {
    if (e.key === ANAHTAR || e.key === IV.ANAHTAR) ciz();
  });

  /* ---------- Başlat ---------- */
  form.kisi.value = kayitliAd();
  puanAlani.hidden = form.tur.value !== "yorum";
  oyunListesiDoldur();
  ciz();
})();