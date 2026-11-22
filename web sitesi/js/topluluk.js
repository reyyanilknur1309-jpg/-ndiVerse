/* ================= Topluluk: paylaşım akışı (v3) ================= */
(function () {
  const ANAHTAR = "indieverse_gonderiler";
  const AD_ANAHTAR = "indieverse_ad";
  const ben = IV.oyuncuId();
  const EMOJILER = ["❤️", "🔥", "👏", "🐉"];
  const SAYFA = 8;

  const form = document.getElementById("gonderiFormu");
  const puanAlani = document.getElementById("puanAlani");
  const oyunListesi = document.getElementById("oyunListesi");
  const akis = document.getElementById("akis");
  const sekmeler = document.getElementById("sekmeler");
  const arama = document.getElementById("akisArama");
  const etiketBulutu = document.getElementById("etiketBulutu");
  const enIyiler = document.getElementById("enIyiler");
  const istatistik = document.getElementById("istatistik");
  const yan = document.querySelector(".yan-kolon");

  let aktifSekme = "akis";
  let gorunen = SAYFA;
  const acikYorumlar = new Set();
  const yanitHedef = {};

  /* ---------- Kimlik ---------- */
  const kullanici = () => IV.oturum();
  const kimlik = () => IV.kimlikAnahtari();
  const kayitliAd = () => kullanici() || IV.oku(AD_ANAHTAR, "");
  const benimMi = g => (kullanici() && IV.kucuk(g.kisi) === IV.kucuk(kullanici())) || g.sahip === ben;

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

  function normalle(g) {
    g.begeniler = g.begeniler || [];
    g.yorumlar = g.yorumlar || [];
    if (!g.tepkiler) {
      g.tepkiler = {};
      g.tepkiler[EMOJILER[0]] = g.begeniler.slice();
    }
    EMOJILER.forEach(e => { g.tepkiler[e] = g.tepkiler[e] || []; });
    g.begeniler = EMOJILER.flatMap(e => g.tepkiler[e]);
    g.yorumlar.forEach((y, i) => { if (!y.id) y.id = "y" + i + "_" + (y.zaman || 0); });
    return g;
  }
  function getir() {
    let l = IV.oku(ANAHTAR, null);
    if (!l) { l = ornekler(); IV.yaz(ANAHTAR, l); }
    return l.map(normalle);
  }
  function kaydet(l) { IV.yaz(ANAHTAR, l); }

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
    return IV.temiz(m)
      .replace(/(^|\s)#([\p{L}\p{N}_]+)/gu,
        (t, b, e) => b + '<a href="#" class="hashtag" data-etiket="' + e + '">#' + e + "</a>")
      .replace(/(^|\s)@([\p{L}\p{N}_.-]+)/gu,
        (t, b, e) => b + '<span class="mention">@' + e + "</span>");
  }
  function uyari(baslik, metin) {
    IV.bildir("<b>" + IV.temiz(baslik) + "</b><span>" + IV.temiz(metin) + "</span>", "uyari");
  }
  function sekmeyiSec(ad) {
    aktifSekme = ad;
    gorunen = SAYFA;
    sekmeler.querySelectorAll(".sekme").forEach(b => b.classList.toggle("aktif", b.dataset.sekme === ad));
  }

  /* ---------- Gönderi kartı ---------- */
  function yorumHtml(g) {
    const tek = (y, ic) =>
      '<div class="yorum' + (ic ? " yanit" : "") + '"><b>' + IV.temiz(y.kisi) + ":</b> " + metinHtml(y.metin) +
      " <small>· " + zamanOnce(y.zaman) + "</small>" +
      (ic ? "" : ' <button type="button" class="link-btn" data-yanitla="' + g.id + '" data-yorum-id="' + y.id +
        '" data-kisi="' + IV.temiz(y.kisi) + '">↩ Yanıtla</button>') + "</div>";
    return g.yorumlar.filter(y => !y.yanit).map(y =>
      tek(y, false) + g.yorumlar.filter(c => c.yanit === y.id).map(c => tek(c, true)).join("")).join("");
  }

  function kartHtml(g) {
    const sv = IV.yazarRozet(g.kisi);
    const harf = IV.temiz((Array.from(String(g.kisi).trim())[0] || "?").toUpperCase());
    const turEtiket = { yorum: "💬 Yorum", oneri: "💡 Öneri", paylasim: "📢 Paylaşım" }[g.tur] || "📢 Paylaşım";
    const kendi = benimMi(g);
    const me = kullanici();
    const takipte = me && IV.takipEdilenler(me).includes(IV.kucuk(g.kisi));
    const takipBtn = !kendi && me
      ? '<button type="button" class="ikincil mini takip-btn' + (takipte ? " aktif" : "") + '" data-takip="' + IV.temiz(g.kisi) + '">' +
        (takipte ? "✓ Takipte" : "＋ Takip et") + "</button>" : "";

    const yildiz = g.puan
      ? '<span class="g-yildiz">' + "★".repeat(g.puan) + "☆".repeat(5 - g.puan) + "</span>" : "";
    const oyunObj = g.oyun ? IV.oyunlariGetir().find(o => IV.kucuk(o.ad) === IV.kucuk(g.oyun)) : null;
    let oyun = "";
    if (oyunObj) {
      const p = IV.ortalama(oyunObj);
      oyun = '<a class="g-oyunkart" href="oyun.html?id=' + encodeURIComponent(oyunObj.id) + '"><b>🎮 ' + IV.temiz(oyunObj.ad) + yildiz +
        "</b><span>" + IV.temiz(oyunObj.studyo) + " · " + (p.adet ? p.ort.toFixed(1) + " ★ (" + p.adet + " oy)" : "henüz oy yok") + "</span></a>";
    } else if (g.oyun) {
      oyun = '<div><span class="etiket durum">🎮 ' + IV.temiz(g.oyun) + "</span>" + yildiz + "</div>";
    }

    const kim = kimlik();
    const tepkiler = EMOJILER.map(e => {
      const n = g.tepkiler[e].length, a = g.tepkiler[e].includes(kim);
      return '<button type="button" class="tepki' + (a ? " aktif" : "") + '" data-tepki="' + e + '" data-id="' + g.id +
        '" aria-pressed="' + a + '" aria-label="' + e + ' tepkisi">' + e + (n ? " <span>" + n + "</span>" : "") + "</button>";
    }).join("");

    const hedef = yanitHedef[g.id];
    const yanitUyari = hedef
      ? '<p class="yanit-uyari">↩ @' + IV.temiz(hedef.kisi) + ' kişisine yanıt veriyorsun <button type="button" class="link-btn" data-yanit-iptal="' + g.id + '">Vazgeç</button></p>' : "";
    const sil = kendi ? '<button type="button" class="ikincil" data-sil="' + g.id + '" aria-label="Paylaşımı sil">🗑️</button>' : "";

    return `
      <article class="gonderi" data-id="${g.id}">
        <div class="g-ust">
          <div class="avatar${sv ? " cerceveli" : ""}" style="background:${renk(g.kisi)};${sv ? "--r:" + sv.renk : ""}">${harf}</div>
          <div>
            <div class="g-ad"><b>${IV.temiz(g.kisi)}</b>${sv ? '<img class="g-rozet" src="' + IV.rozetUrl(sv, true) + '" alt="" title="' + IV.temiz(sv.ad) + '">' : ""}${takipBtn}</div>
            <div class="studyo">${sv ? IV.temiz(sv.ad) + " · " : ""}${zamanOnce(g.zaman)}</div>
          </div>
          <span class="etiket durum g-tur">${turEtiket}</span>
        </div>
        ${oyun}
        <p class="g-metin">${metinHtml(g.metin)}</p>
        <div class="g-tepkiler">
          ${tepkiler}
          <button type="button" class="tepki" data-yorum-ac="${g.id}" aria-expanded="${acikYorumlar.has(g.id)}">💬 ${g.yorumlar.length}</button>
          ${sil}
        </div>
        <div class="g-yorumlar" ${acikYorumlar.has(g.id) ? "" : "hidden"}>
          ${yorumHtml(g)}
          <form class="g-yorum-formu">
            <p><input type="text" name="kisi" placeholder="Adın" required maxlength="30" value="${IV.temiz(kayitliAd())}" ${kullanici() ? "readonly" : ""}></p>
            ${yanitUyari}
            <p><input type="text" name="metin" placeholder="Yorumun... (@kişi ile birini anabilirsin)" required maxlength="250"></p>
            <button type="submit" class="ikincil">Yorum Yap</button>
          </form>
        </div>
      </article>`;
  }

  /* ---------- Çizim ---------- */
  function filtrele() {
    const q = IV.kucuk(arama.value).trim();
    const me = kullanici();
    const takip = me ? IV.takipEdilenler(me) : [];
    const l = getir().filter(g => {
      if (aktifSekme === "oneri" && g.tur !== "oneri") return false;
      if (aktifSekme === "yorum" && g.tur !== "yorum") return false;
      if (aktifSekme === "takip" && !takip.includes(IV.kucuk(g.kisi))) return false;
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

  function bosMesaj() {
    if (aktifSekme === "takip") {
      return kullanici()
        ? "Takip ettiklerinin paylaşımı burada görünür. Bir gönderideki “＋ Takip et” düğmesiyle başla."
        : 'Takip akışı için <a href="uye.html">giriş yap</a>.';
    }
    return "Henüz burada bir şey yok. İlk paylaşımı sen yap! 🐉";
  }

  function cizAkis() {
    const l = filtrele();
    const parca = l.slice(0, gorunen);
    akis.innerHTML = l.length
      ? parca.map(kartHtml).join("") +
        (l.length > gorunen ? '<button type="button" class="ikincil daha-fazla" data-daha="1">Daha fazla göster (' + (l.length - gorunen) + ")</button>" : "")
      : '<div class="bos-mesaj">' + bosMesaj() + "</div>";
  }

  const bildirimKutu = document.createElement("div");
  bildirimKutu.className = "yan-kutu";
  bildirimKutu.id = "bildirimler";
  const liderKutu = document.createElement("div");
  liderKutu.className = "yan-kutu";
  if (yan) { yan.prepend(bildirimKutu); yan.appendChild(liderKutu); }

  function cizBildirim() {
    const me = kullanici();
    if (!me) { bildirimKutu.innerHTML = '<h3>🔔 Bildirimler</h3><p><a href="uye.html">Giriş yap</a>, gönderine gelen tepkileri ve yanıtları burada gör.</p>'; return; }
    const l = IV.bildirimler(me);
    const yeni = l.filter(x => !x.o).length;
    bildirimKutu.innerHTML = "<h3>🔔 Bildirimler" + (yeni ? " (" + yeni + ")" : "") + "</h3>" +
      (l.length
        ? l.slice(0, 6).map(x => '<div class="bildirim-item' + (x.o ? "" : " yeni") + '">' + IV.temiz(x.m) + " <small>· " + zamanOnce(x.z) + "</small></div>").join("") +
          (yeni ? '<p style="margin-top:8px;"><button type="button" class="ikincil mini" data-okundu="1">Hepsini okundu say</button></p>' : "")
        : "<p>Henüz bildirim yok.</p>");
  }

  function cizLider() {
    const me = kullanici();
    liderKutu.innerHTML = "<h3>🏆 Haftanın XP Liderleri</h3><ol class=\"lider\">" +
      IV.liderler(5).map((x, k) => {
        const sv = IV.seviyeBul(x.toplam, x.ad).sv;
        return '<li class="' + (me && IV.kucuk(me) === IV.kucuk(x.ad) ? "ben" : "") + '"><span class="sira">' + (["🥇", "🥈", "🥉"][k] || k + 1) +
          '</span><img src="' + IV.rozetUrl(sv, true) + '" alt=""><span>' + IV.temiz(x.ad) + '</span><span class="xp">' + x.hafta + " XP</span></li>";
      }).join("") + "</ol><p style=\"margin-top:8px;\">Son 7 günde kazanılan XP. Açılan hesaplar dışındakiler örnek kullanıcılardır.</p>";
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
      '<li><a href="oyun.html?id=' + encodeURIComponent(x.o.id) + '"><b>' + IV.temiz(x.o.ad) + "</b></a> ⭐ " + x.p.ort.toFixed(1) + " (" + x.p.adet + " oy)</li>").join("");

    const yorumSayisi = tum.reduce((t, g) => t + g.yorumlar.length, 0);
    const tepkiSayisi = tum.reduce((t, g) => t + g.begeniler.length, 0);
    istatistik.textContent = tum.length + " paylaşım · " + yorumSayisi + " yorum · " + tepkiSayisi + " tepki";
    cizBildirim();
    cizLider();
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
    const kisi = kullanici() || form.kisi.value.trim();
    const tur = form.tur.value;
    const oyunAdi = form.oyun.value.trim();
    const metin = form.metin.value.trim();
    const puan = tur === "yorum" ? Number(form.puan.value) : 0;

    if ((tur === "yorum" || tur === "oneri") && !oyunAdi) {
      uyari("Oyun adı eksik", "Yorum ya da öneri için oyunun adını yaz.");
      return;
    }
    if (!IV.hizSiniri("gonderi", 6000)) {
      uyari("Biraz yavaş", "Yeni bir paylaşım için birkaç saniye bekle.");
      return;
    }

    if (tur === "yorum") {
      const oyunlar = IV.oyunlariGetir();
      const oyun = oyunlar.find(o => IV.kucuk(o.ad) === IV.kucuk(oyunAdi));
      if (oyun && !oyun.benim) {
        oyun.oylar = oyun.oylar || {};
        oyun.oylar[kimlik()] = puan;
        if (oyun.beta) {
          oyun.yorumlar = oyun.yorumlar || [];
          oyun.yorumlar.push({ kisi, metin });
        }
        IV.oyunlariKaydet(oyunlar);
        IV.xpKazan("puan", oyun.id);
      }
    }

    const id = "p" + Date.now();
    const liste = getir();
    const yeni = {
      id, kisi, tur, oyun: oyunAdi, puan, metin,
      zaman: Date.now(), begeniler: [], yorumlar: [], sahip: ben, tepkiler: {}
    };
    EMOJILER.forEach(x => { yeni.tepkiler[x] = []; });
    liste.unshift(yeni);
    kaydet(liste.slice(0, 200));
    IV.yaz(AD_ANAHTAR, kisi);
    IV.xpKazan("paylasim", id);
    if (metin.length >= 50) IV.xpKazan("uzunYorum", id);

    const anilan = new Set((metin.match(/@([\p{L}\p{N}_.-]+)/gu) || []).map(a => a.slice(1)));
    anilan.forEach(a => { if (IV.kucuk(a) !== IV.kucuk(kisi)) IV.bildirimEkle(a, kisi + " seni bir paylaşımda andı."); });

    form.oyun.value = "";
    form.metin.value = "";
    arama.value = "";
    sekmeyiSec("akis");
    ciz();
  });

  /* ---------- Akıştaki tıklamalar ---------- */
  function etiketeGit(e) {
    arama.value = "#" + e;
    sekmeyiSec("akis");
    cizAkis();
    document.getElementById("akis-alani").scrollIntoView({ behavior: "smooth" });
  }

  akis.addEventListener("click", e => {
    const tag = e.target.closest("[data-etiket]");
    if (tag) { e.preventDefault(); etiketeGit(tag.dataset.etiket); return; }

    const daha = e.target.closest("[data-daha]");
    if (daha) { gorunen += SAYFA; cizAkis(); return; }

    const tp = e.target.closest("[data-tepki]");
    if (tp) {
      const liste = getir();
      const g = liste.find(x => x.id === tp.dataset.id);
      if (!g) return;
      const emoji = tp.dataset.tepki;
      const kim = kimlik();
      const dizi = g.tepkiler[emoji];
      const i = dizi.indexOf(kim);
      if (i >= 0) dizi.splice(i, 1); else dizi.push(kim);
      g.begeniler = EMOJILER.flatMap(x => g.tepkiler[x]);
      kaydet(liste);
      const me = kullanici();
      if (i < 0 && me) {
        IV.xpKazan("tepki", g.id + emoji);
        if (!benimMi(g)) {
          IV.xpEkle(g.kisi, "begeni", g.id + ":" + IV.kucuk(me));
          IV.bildirimEkle(g.kisi, me + " gönderine " + emoji + " bıraktı.");
        }
      } else if (i < 0) {
        IV.xpKazan("tepki", g.id + emoji);
      }
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

    const yanitla = e.target.closest("[data-yanitla]");
    if (yanitla) {
      const id = yanitla.dataset.yanitla;
      yanitHedef[id] = { id: yanitla.dataset.yorumId, kisi: yanitla.dataset.kisi };
      acikYorumlar.add(id);
      cizAkis();
      const alan = akis.querySelector('.gonderi[data-id="' + id + '"] input[name="metin"]');
      if (alan) alan.focus();
      return;
    }

    const iptal = e.target.closest("[data-yanit-iptal]");
    if (iptal) { delete yanitHedef[iptal.dataset.yanitIptal]; cizAkis(); return; }

    const takip = e.target.closest("[data-takip]");
    if (takip) {
      const me = kullanici();
      if (!me) { uyari("Giriş gerekli", "Birini takip etmek için giriş yapmalısın."); return; }
      IV.takipDegistir(me, takip.dataset.takip);
      ciz();
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
    if (!IV.hizSiniri("yorum", 2500)) { uyari("Biraz yavaş", "Yeni bir yorum için birkaç saniye bekle."); return; }

    const id = f.closest(".gonderi").dataset.id;
    const liste = getir();
    const g = liste.find(x => x.id === id);
    if (!g) return;

    const kisi = kullanici() || f.kisi.value.trim();
    const metin = f.metin.value.trim();
    const hedef = yanitHedef[id];
    const y = { id: "y" + Date.now(), kisi, metin, zaman: Date.now() };
    if (hedef) y.yanit = hedef.id;
    g.yorumlar.push(y);
    kaydet(liste);
    delete yanitHedef[id];

    const haber = new Map();
    if (IV.kucuk(g.kisi) !== IV.kucuk(kisi)) haber.set(IV.kucuk(g.kisi), [g.kisi, kisi + " gönderine yorum yaptı."]);
    if (hedef && IV.kucuk(hedef.kisi) !== IV.kucuk(kisi)) haber.set(IV.kucuk(hedef.kisi), [hedef.kisi, kisi + " yorumuna yanıt verdi."]);
    (metin.match(/@([\p{L}\p{N}_.-]+)/gu) || []).forEach(a => {
      const ad = a.slice(1);
      if (IV.kucuk(ad) !== IV.kucuk(kisi)) haber.set(IV.kucuk(ad), [ad, kisi + " seni bir yorumda andı."]);
    });
    haber.forEach(([kime, mesaj]) => IV.bildirimEkle(kime, mesaj));

    IV.xpKazan("yorum", null);
    if (metin.length >= 50) IV.xpKazan("uzunYorum", y.id);
    IV.yaz(AD_ANAHTAR, kisi);
    acikYorumlar.add(id);
    ciz();
  });

  /* ---------- Sekmeler, arama, yan panel ---------- */
  const takipSekme = document.createElement("button");
  takipSekme.type = "button";
  takipSekme.className = "sekme";
  takipSekme.dataset.sekme = "takip";
  takipSekme.textContent = "👥 Takip";
  const akisSekme = sekmeler.querySelector('[data-sekme="akis"]');
  if (akisSekme) akisSekme.after(takipSekme); else sekmeler.prepend(takipSekme);

  sekmeler.addEventListener("click", e => {
    const b = e.target.closest(".sekme");
    if (!b) return;
    sekmeyiSec(b.dataset.sekme);
    cizAkis();
  });
  arama.addEventListener("input", () => { gorunen = SAYFA; cizAkis(); });
  etiketBulutu.addEventListener("click", e => {
    const t = e.target.closest("[data-etiket]");
    if (t) etiketeGit(t.dataset.etiket);
  });
  bildirimKutu.addEventListener("click", e => {
    if (e.target.closest("[data-okundu]") && kullanici()) IV.bildirimOkundu(kullanici());
  });

  window.addEventListener("storage", e => {
    if (e.key === ANAHTAR || e.key === IV.ANAHTAR) ciz();
  });
  document.addEventListener("bildirimDegisti", cizBildirim);
  document.addEventListener("xpDegisti", cizLider);
  document.addEventListener("oturumDegisti", () => {
    form.kisi.value = kayitliAd();
    form.kisi.readOnly = !!kullanici();
    ciz();
  });

  /* ---------- Başlat ---------- */
  form.kisi.value = kayitliAd();
  form.kisi.readOnly = !!kullanici();
  form.insertAdjacentHTML("afterbegin",
    '<p class="puan-bilgi">' + (kullanici()
      ? "💡 Giriş yaptın: paylaşım +4, yorum +2 XP (50+ karakter ekstra +2 XP ve Kombo Çarpanı!)."
      : '💡 <a href="uye.html">Giriş yaparsan</a> paylaşımların ve yorumların çarpanlı XP kazandırır.') + "</p>");
  puanAlani.hidden = form.tur.value !== "yorum";
  oyunListesiDoldur();
  ciz();
})();
