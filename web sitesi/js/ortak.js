/* ================= IndieVerse - Ortak Fonksiyonlar (v3) ================= */
const IV = {
  ANAHTAR: "indieverse_oyunlar",
  OYUNCU_ANAHTAR: "indieverse_oyuncu_id",

  turler: {
    korku: "Korku / Gerilim", rpg: "RPG", platform: "Platform",
    bulmaca: "Bulmaca / Macera", strateji: "Strateji / Kart", "hayatta-kalma": "Hayatta Kalma"
  },
  atmosferler: { psikolojik: "Karanlık / Psikolojik", piksel: "Retro / Piksel", rahat: "Sakin / Cozy", hepsi: "Karma" },
  platformlar: { pc: "PC", konsol: "Konsol", mobil: "Mobil" },
  asamalar: { demo: "Oynanabilir Demo", gelistirme: "Geliştirme / Alfa", tam: "Tam Sürüm" },

  kriterler: [
    { id: "hikaye", ad: "Hikâye" },
    { id: "gorsel", ad: "Görsel" },
    { id: "oynanis", ad: "Oynanış" },
    { id: "atmosfer", ad: "Atmosfer" }
  ],

  /* ---------- Evrim yolculuğu (7 form + evrim şartları) ---------- */
  seviyeler: [
    {
      ad: "Balık", esik: 0, resim: "seviye-balik", renk: "#4cc9ff",
      slogan: "Akıntıya yeni katıldın.",
      aciklama: "Her büyük ejderha küçük bir balıkla başlar. Oyunları keşfet, ilk puanlarını ver.",
      ozellikler: ["Meraklı", "Hızlı öğrenen", "Sürüye açık"],
      sartMetin: "", sartKontrol: () => true
    },
    {
      ad: "Yumurta", esik: 15, resim: "seviye-yumurta", renk: "#8fa8ff",
      slogan: "İçinde bir şeyler kıpırdıyor.",
      aciklama: "Sabırla biriktirdiğin her puan kabuğun içindeki gücü büyütüyor.",
      ozellikler: ["Sabırlı", "Potansiyel dolu", "Gizemli"],
      sartMetin: "En az 1 oyunu puanla",
      sartKontrol: d => d.puanlanan >= 1
    },
    {
      ad: "Çatlak Yumurta", esik: 40, resim: "seviye-catlak", renk: "#9d8bff",
      slogan: "Kabuk çatlıyor, dönüşüm başladı.",
      aciklama: "Artık topluluğun fark ettiği biri oldun. Paylaşımların ve yorumların iz bırakıyor.",
      ozellikler: ["Kararlı", "Cesur", "Dönüşüme hazır"],
      sartMetin: "En az 1 paylaşım yap veya 2 yorum yaz",
      sartKontrol: d => d.paylasim >= 1 || d.yorum >= 2
    },
    {
      ad: "Yavru Ejderha", esik: 85, resim: "seviye-yavru", renk: "#5eead4",
      slogan: "İlk nefesini aldın.",
      aciklama: "Enerjin yüksek, merakın hâlâ taze. Başkalarının oyunlarını ilerletiyorsun.",
      ozellikler: ["Enerjik", "Oyuncu", "Hızla gelişen"],
      sartMetin: "1 oyuna 4 kriter puanı ver veya 2 oyun favorile",
      sartKontrol: d => d.detayPuan >= 1 || d.favori >= 2
    },
    {
      ad: "Ejderha", esik: 160, resim: "seviye-ejderha1", renk: "#4c8dff",
      slogan: "Kanatların gökyüzünü tanıyor.",
      aciklama: "Görüşlerin güveniliyor. Geliştiriciler senin geri bildirimini bekliyor.",
      ozellikler: ["Güçlü", "Özgür", "Lider ruhlu"],
      sartMetin: "En az 3 oyun puanla ve 3 paylaşım/yorum yap",
      sartKontrol: d => d.puanlanan >= 3 && (d.paylasim + d.yorum) >= 3
    },
    {
      ad: "Kadim Ejder", esik: 280, resim: "seviye-ejderha2", renk: "#b794ff",
      slogan: "Bilgeliğin topluluğa yol gösteriyor.",
      aciklama: "Birikimle konuşuyorsun. Yeni gelenlere rehberlik eden nadir isimlerdensin.",
      ozellikler: ["Bilge", "Saygın", "Yol gösterici"],
      sartMetin: "En az 5 oyun puanla ve 3 başarım aç",
      sartKontrol: d => d.puanlanan >= 5 && d.basarimSayisi >= 3
    },
    {
      ad: "Evren Bekçisi", esik: 450, resim: "seviye-baloncuk", renk: "#ffd36b",
      slogan: "Hem denizi hem göğü biliyorsun.",
      aciklama: "En üst seviye. IndieVerse evreninde balıktan ejderhaya her dönüşümün tanığısın.",
      ozellikler: ["Efsanevi", "Her şeyi gören", "Evrenin koruyucusu"],
      sartMetin: "En az 3 günlük seri yap veya 6 başarım aç",
      sartKontrol: d => d.seri >= 3 || d.basarimSayisi >= 6
    }
  ],

  seviyeBul(puan, kullanici) {
    const veri = kullanici && this.hesapBul && this.hesapBul(kullanici)
      ? this.basarimVerisi(kullanici)
      : null;
    let i = 0;
    for (let k = 1; k < this.seviyeler.length; k++) {
      const s = this.seviyeler[k];
      if (puan < s.esik) break;
      if (veri && s.sartKontrol && !s.sartKontrol(veri)) break;
      i = k;
    }
    return { i, sv: this.seviyeler[i], sonraki: this.seviyeler[i + 1] || null };
  },
  rozetUrl(sv, kucuk) { return "img/" + sv.resim + (kucuk ? "-128" : "") + ".png"; },

  /* ---------- Güvenli metin ---------- */
  temiz(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },
  kucuk(s) { return String(s ?? "").toLocaleLowerCase("tr"); },

  /* ---------- Depolama ---------- */
  oku(anahtar, varsayilan) {
    try {
      const v = localStorage.getItem(anahtar);
      return v ? JSON.parse(v) : varsayilan;
    } catch (e) { return varsayilan; }
  },
  yaz(anahtar, deger) {
    try { localStorage.setItem(anahtar, JSON.stringify(deger)); } catch (e) { console.warn("Kaydedilemedi", e); }
  },
  oyuncuId() {
    try {
      let id = localStorage.getItem(this.OYUNCU_ANAHTAR);
      if (!id) {
        id = "o" + Date.now() + Math.random().toString(36).slice(2, 7);
        localStorage.setItem(this.OYUNCU_ANAHTAR, id);
      }
      return id;
    } catch (e) {
      if (!this._geciciId) this._geciciId = "o" + Date.now() + Math.random().toString(36).slice(2, 7);
      return this._geciciId;
    }
  },
  /* Oturum açıksa hesaba özel anahtar, değilse tarayıcı kimliği */
  kimlikAnahtari() {
    const o = this.oku("indieverse_oturum", null);
    return o && o.kullanici ? "u:" + this.kucuk(o.kullanici) : this.oyuncuId();
  },

  /* ---------- Eski istatistik (v3 ile XP defterinden beslenir) ---------- */
  kullaniciIstatistik(kullanici) {
    const ben = this.oyuncuId();
    const ad = this.kucuk(kullanici);
    const kim = ad ? "u:" + ad : ben;
    let paylasim = 0, yorum = 0, begeni = 0, puanlanan = 0, detayPuan = 0;

    this.oku("indieverse_gonderiler", []).forEach(x => {
      if (this.kucuk(x.kisi) === ad || (!ad && x.sahip === ben)) {
        paylasim++;
        begeni += (x.begeniler || []).length;
      }
      (x.yorumlar || []).forEach(y => { if (this.kucuk(y.kisi) === ad) yorum++; });
    });

    this.oyunlariGetir().forEach(o => {
      const oylar = o.oylar || {};
      const detaylar = o.detaylar || {};
      if (oylar[kim] || oylar[ben]) puanlanan++;
      const d = detaylar[kim] || detaylar[ben];
      if (d && this.kriterler.every(k => Number(d[k.id]) > 0)) detayPuan++;
      (o.yorumlar || []).forEach(y => { if (this.kucuk(y.kisi) === ad) yorum++; });
    });

    const puan = this.xpToplam ? this.xpToplam(kullanici) : (paylasim * 3 + yorum + begeni + puanlanan * 2);
    return { paylasim, yorum, begeni, puanlanan, detayPuan, puan };
  },

  /* ---------- Oyun verisi ---------- */
  ornekOyunlar() {
    return [
      {
        id: "g1", studyo: "Gölge Atölyesi", ad: "Kayıp Prenses", tur: "korku", atmosfer: "psikolojik",
        platformlar: ["pc"], asama: "demo", anahtar: ["prenses", "saray", "korku", "lanet", "bulmaca"],
        amac: "Klasik masalı korku hikâyesine çevirmek",
        aciklama: "Lanetli bir sarayda kaybolan prensesi ararken saray her gece biraz daha değişir.",
        demo: "", beta: true, benim: false,
        oylar: { a1: 5, a2: 4, a3: 5 },
        detaylar: {
          a1: { hikaye: 5, gorsel: 4, oynanis: 4, atmosfer: 5 },
          a2: { hikaye: 4, gorsel: 4, oynanis: 3, atmosfer: 5 }
        },
        yorumlar: [{ kisi: "Deniz", metin: "Atmosfer harika, müzikler ürpertici!" }]
      },
      {
        id: "g2", studyo: "Piksel Çiftlik", ad: "Yıldız Çiftliği", tur: "strateji", atmosfer: "rahat",
        platformlar: ["pc", "mobil"], asama: "gelistirme", anahtar: ["uzay", "çiftlik", "cozy", "bitki"],
        amac: "Uzayda huzurlu bir çiftlik yönetimi sunmak",
        aciklama: "Küçük bir gezegende bitki yetiştir, uzaylı komşularla ticaret yap.",
        demo: "", beta: true, benim: false,
        oylar: { a1: 4, a2: 4 }, detaylar: {}, yorumlar: []
      },
      {
        id: "g3", studyo: "Neon Dedektif", ad: "Gece Vardiyası", tur: "bulmaca", atmosfer: "piksel",
        platformlar: ["pc", "konsol"], asama: "tam", anahtar: ["dedektif", "piksel", "gizem", "cinayet"],
        amac: "Retro estetikle zekice bir cinayet çözme deneyimi",
        aciklama: "Yağmurlu bir şehirde ipuçlarını birleştirip şüphelileri sorgula.",
        demo: "", beta: false, benim: false,
        oylar: { a1: 5, a2: 5, a3: 4, a4: 5 },
        detaylar: {
          a1: { hikaye: 5, gorsel: 4, oynanis: 5, atmosfer: 4 },
          a2: { hikaye: 5, gorsel: 5, oynanis: 4, atmosfer: 4 }
        },
        yorumlar: [{ kisi: "Mert", metin: "Hikâye çok sürükleyici." }]
      },
      {
        id: "g4", studyo: "Mavi Ejder Oyunları", ad: "Ejderha Yolu", tur: "rpg", atmosfer: "hepsi",
        platformlar: ["pc", "konsol", "mobil"], asama: "demo", anahtar: ["ejderha", "balık", "macera", "rpg"],
        amac: "Yeterince hızlı yüzen balığın ejderhaya dönüşmesini anlatmak",
        aciklama: "Küçük bir balıkla başla, hızlandıkça evrim geçir ve gökyüzüne yüksel.",
        demo: "", beta: true, benim: false,
        oylar: { a1: 4, a2: 5 }, detaylar: {}, yorumlar: []
      },
      {
        id: "g5", studyo: "Taş Duvar", ad: "Son Sığınak", tur: "hayatta-kalma", atmosfer: "psikolojik",
        platformlar: ["pc"], asama: "gelistirme", anahtar: ["hayatta kalma", "kış", "sığınak", "korku"],
        amac: "Kıt kaynaklarla zor kararlar aldırmak",
        aciklama: "Kar fırtınasında bir grup insanı hayatta tutmaya çalış.",
        demo: "", beta: true, benim: false,
        oylar: { a1: 3, a2: 4 }, detaylar: {}, yorumlar: []
      },
      {
        id: "g6", studyo: "Zıpla Stüdyo", ad: "Bulut Atlayıcı", tur: "platform", atmosfer: "rahat",
        platformlar: ["mobil", "pc"], asama: "tam", anahtar: ["platform", "bulut", "sevimli", "metroidvania"],
        amac: "Kısa ve keyifli bir platform macerası",
        aciklama: "Bulutların arasında zıpla, gizli alanları keşfet.",
        demo: "", beta: false, benim: false,
        oylar: { a1: 4, a2: 4, a3: 5 }, detaylar: {}, yorumlar: []
      }
    ];
  },
  oyunlariGetir() {
    let liste = this.oku(this.ANAHTAR, null);
    if (!liste) {
      liste = this.ornekOyunlar();
      this.yaz(this.ANAHTAR, liste);
    }
    return liste;
  },
  oyunlariKaydet(liste) { this.yaz(this.ANAHTAR, liste); },

  /* ---------- Puan hesapları ---------- */
  ortalama(oyun) {
    const p = Object.values(oyun.oylar || {});
    if (!p.length) return { ort: 0, adet: 0 };
    return { ort: p.reduce((a, b) => a + b, 0) / p.length, adet: p.length };
  },

  genelOrtalama(liste) {
    let toplam = 0, adet = 0;
    liste.forEach(o => {
      const p = Object.values(o.oylar || {});
      toplam += p.reduce((a, b) => a + b, 0);
      adet += p.length;
    });
    return adet ? toplam / adet : 3;
  },

  /* Güvenilir puan: (v/(v+m))*R + (m/(v+m))*C */
  agirlikliPuan(oyun, C) {
    const m = 3;
    if (C === undefined) C = this.genelOrtalama(this.oyunlariGetir());
    const { ort, adet } = this.ortalama(oyun);
    return (adet / (adet + m)) * ort + (m / (adet + m)) * C;
  },

  dagilim(oyun) {
    const sayac = [0, 0, 0, 0, 0];
    Object.values(oyun.oylar || {}).forEach(p => {
      if (p >= 1 && p <= 5) sayac[5 - p]++;
    });
    return sayac;
  },

  kriterOrtalamalari(oyun) {
    const sonuc = {};
    this.kriterler.forEach(k => {
      const v = Object.values(oyun.detaylar || {}).map(d => d[k.id]).filter(Boolean);
      sonuc[k.id] = { ort: v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0, adet: v.length };
    });
    return sonuc;
  },

  /* ---------- Kart HTML'i ---------- */
  kartHtml(o, secenek = {}) {
    const kim = this.kimlikAnahtari();
    const ben = this.oyuncuId();
    const oturumAd = this.oturum ? this.oturum() : null;
    const { ort, adet } = this.ortalama(o);
    const benimPuan = (o.oylar || {})[kim] || (o.oylar || {})[ben] || 0;
    const benimDetay = (o.detaylar || {})[kim] || (o.detaylar || {})[ben] || {};
    const kendi = !!(o.benim && (!o.sahip || !oturumAd || this.kucuk(o.sahip) === this.kucuk(oturumAd)));
    const yuzde = Math.round(ort / 5 * 1000) / 10;
    const guvenilir = this.agirlikliPuan(o, this.genelOrtalama(this.oyunlariGetir()));
    const favori = adet >= 3 && ort >= 4.5;

    const yildizSatiri = (secili, ekstra) => {
      let h = "";
      for (let i = 1; i <= 5; i++) {
        h += `<span class="yildiz ${i <= secili ? "dolu" : ""}" data-puan="${i}" ${ekstra || ""} title="${i} puan ver">★</span>`;
      }
      return h;
    };

    const etiketler = [
      favori ? `<span class="etiket durum">🏆 Topluluk Favorisi</span>` : "",
      `<span class="etiket">${this.temiz(this.turler[o.tur] || o.tur)}</span>`,
      `<span class="etiket">${this.temiz(this.atmosferler[o.atmosfer] || o.atmosfer)}</span>`,
      `<span class="etiket durum">${this.temiz(this.asamalar[o.asama] || o.asama)}</span>`,
      ...(o.platformlar || []).map(p => `<span class="etiket">${this.temiz(this.platformlar[p] || p)}</span>`)
    ].join("");

    const kelimeler = (o.anahtar || []).map(k => `<span class="etiket">#${this.temiz(k)}</span>`).join("");

    const ortSatir = adet
      ? `<span class="puan-sayi">${ort.toFixed(1)}</span>
         <span class="yildiz-ort" style="--yuzde:${yuzde}%" title="${ort.toFixed(1)} / 5">★★★★★</span>
         <span class="puan-bilgi">(${adet} oy)</span>`
      : `<span class="puan-bilgi">Henüz oy yok, ilk puanı sen ver!</span>`;

    const seninSatir = kendi
      ? `<p class="puan-bilgi">Kendi oyununu puanlayamazsın.</p>`
      : `<div class="senin-puan">
           <span class="puan-bilgi">Senin puanın:</span>
           <span class="yildizlar">${yildizSatiri(benimPuan)}</span>
           ${benimPuan ? `<button type="button" class="ikincil mini" data-puan-sil="1">Geri al</button>` : ""}
         </div>`;

    const dag = this.dagilim(o);
    const dagHtml = adet
      ? [5, 4, 3, 2, 1].map((n, i) => {
          const yz = Math.round(dag[i] / adet * 100);
          return `<div class="cubuk-satir"><span>${n} ★</span><div class="cubuk yildizli"><div style="width:${yz}%"></div></div><span>${dag[i]}</span></div>`;
        }).join("")
      : `<p class="puan-bilgi">Henüz oy yok.</p>`;

    const kort = this.kriterOrtalamalari(o);
    const kriterHtml = this.kriterler.map(k => {
      const v = kort[k.id];
      return `<div class="cubuk-satir"><span>${k.ad}</span><div class="cubuk"><div style="width:${v.adet ? v.ort / 5 * 100 : 0}%"></div></div><span>${v.adet ? v.ort.toFixed(1) : "–"}</span></div>`;
    }).join("");

    const kriterOy = kendi ? "" :
      `<p class="puan-bilgi" style="margin-top:12px;">Detaylı puanla (4 kriteri doldurursan <b>+3 Kritik XP</b>):</p>` +
      this.kriterler.map(k =>
        `<div class="cubuk-satir kriter-oy"><span>${k.ad}</span><span class="yildizlar kucuk">${yildizSatiri(benimDetay[k.id] || 0, `data-kriter="${k.id}"`)}</span></div>`
      ).join("");

    const puanDetay = `
      <details class="geri-bildirim">
        <summary>⭐ Puan detayları</summary>
        ${dagHtml}
        <p class="puan-bilgi" style="margin-top:12px;">Kriterlere göre:</p>
        ${kriterHtml}
        ${kriterOy}
        <p class="puan-bilgi" style="margin-top:12px;">Güvenilir puan: <b>${guvenilir.toFixed(2)}</b>
          <small>(az oy alan oyunların puanı genel ortalamaya yaklaştırılır)</small></p>
      </details>`;

    const yorumlar = (o.yorumlar || []).map(y =>
      `<div class="yorum"><b>${this.temiz(y.kisi)}:</b> ${this.temiz(y.metin)}</div>`).join("")
      || `<div class="yorum">Henüz geri bildirim yok.</div>`;

    let demo = "";
    if (o.demo) {
      demo = `<a class="buton" href="${this.temiz(o.demo)}" target="_blank" rel="noopener">🎮 Demoyu Aç</a>`;
    }

    let yorumFormu = "";
    if (secenek.yorumFormu !== false && o.beta) {
      yorumFormu = `
        <form class="yorumFormu">
          <p><input type="text" name="kisi" placeholder="Adın" required maxlength="30" value="${this.temiz(oturumAd || "")}" ${oturumAd ? "readonly" : ""}></p>
          <p><input type="text" name="metin" placeholder="Geri bildirimin... (50+ karakter ekstra Kritik XP verir)" required maxlength="250"></p>
          <button type="submit" class="ikincil">Gönder</button>
        </form>`;
    } else if (!o.beta) {
      yorumFormu = `<p class="puan-bilgi">Bu geliştirici geri bildirim kabul etmiyor.</p>`;
    }

    const sil = secenek.sil ? `<button type="button" class="ikincil" data-sil="${o.id}">🗑️ Sil</button>` : "";
    const detayLink = secenek.detaySayfa
      ? this.temiz(o.ad)
      : `<a class="oyun-baslik-link" href="oyun.html?id=${encodeURIComponent(o.id)}">${this.temiz(o.ad)}</a>`;

    return `
      <article class="oyun-kart" data-id="${o.id}">
        <h3>${detayLink}</h3>
        <div class="studyo">${this.temiz(o.studyo)}</div>
        <div class="etiketler">${etiketler}</div>
        <p class="amac"><b>Amaç:</b> ${this.temiz(o.amac)}</p>
        <p class="amac">${this.temiz(o.aciklama)}</p>
        <div class="etiketler">${kelimeler}</div>
        <div class="puan-kutu">
          <div class="puan-ort">${ortSatir}</div>
          ${seninSatir}
        </div>
        ${demo}
        ${puanDetay}
        <details class="geri-bildirim">
          <summary>💬 Geri bildirimler (${(o.yorumlar || []).length})</summary>
          ${yorumlar}
          ${yorumFormu}
        </details>
        ${sil}
      </article>`;
  },

  /* ---------- Puan ve yorum olayları ---------- */
  baglaKartOlaylari(kapsayici, yenidenCiz) {
    kapsayici.addEventListener("click", e => {
      const sil = e.target.closest("[data-puan-sil]");
      const yildiz = e.target.closest(".yildiz");
      if (!sil && !yildiz) return;

      const kart = (sil || yildiz).closest(".oyun-kart");
      const liste = this.oyunlariGetir();
      const oyun = liste.find(o => o.id === kart.dataset.id);
      if (!oyun) return;
      const oturumAd = this.oturum ? this.oturum() : null;
      if (oyun.benim && (!oyun.sahip || !oturumAd || this.kucuk(oyun.sahip) === this.kucuk(oturumAd))) return;

      const kim = this.kimlikAnahtari();
      const ben = this.oyuncuId();
      oyun.oylar = oyun.oylar || {};
      oyun.detaylar = oyun.detaylar || {};

      if (sil) {
        delete oyun.oylar[kim];
        delete oyun.detaylar[kim];
        delete oyun.oylar[ben];
        delete oyun.detaylar[ben];
      } else if (yildiz.dataset.kriter) {
        oyun.detaylar[kim] = oyun.detaylar[kim] || {};
        oyun.detaylar[kim][yildiz.dataset.kriter] = Number(yildiz.dataset.puan);
        // 4 kriterin tamamı doldurulduysa bonus Kritik XP ver
        if (this.kriterler.every(k => Number(oyun.detaylar[kim][k.id]) > 0)) {
          this.xpKazan("kriter", oyun.id);
        }
      } else {
        oyun.oylar[kim] = Number(yildiz.dataset.puan);
        this.xpKazan("puan", oyun.id);
      }
      this.oyunlariKaydet(liste);
      yenidenCiz(kart.dataset.id);
    });

    kapsayici.addEventListener("submit", e => {
      const form = e.target.closest(".yorumFormu");
      if (!form) return;
      e.preventDefault();
      if (this.hizSiniri && !this.hizSiniri("kart_yorum", 2500)) {
        this.bildir("<b>Biraz yavaş</b><span>Yeni bir yorum için birkaç saniye bekle.</span>", "uyari");
        return;
      }
      const kart = form.closest(".oyun-kart");
      const liste = this.oyunlariGetir();
      const oyun = liste.find(o => o.id === kart.dataset.id);
      if (!oyun) return;
      const kisi = (this.oturum && this.oturum()) || form.kisi.value.trim();
      const metin = form.metin.value.trim();
      if (!kisi || !metin) return;
      oyun.yorumlar = oyun.yorumlar || [];
      oyun.yorumlar.push({ kisi, metin });
      this.oyunlariKaydet(liste);
      this.xpKazan("yorum", null);
      if (metin.length >= 50) this.xpKazan("uzunYorum", oyun.id + ":" + Date.now());
      yenidenCiz(kart.dataset.id);
    });
  },

  acikKartlar(kapsayici) {
    const liste = [];
    kapsayici.querySelectorAll(".oyun-kart").forEach(k => {
      k.querySelectorAll("details").forEach((d, i) => {
        if (d.open) liste.push(k.dataset.id + ":" + i);
      });
    });
    return liste;
  },
  acikKartlariGeriYukle(kapsayici, idler) {
    idler.forEach(s => {
      const [id, i] = s.split(":");
      const kart = kapsayici.querySelector(`.oyun-kart[data-id="${id}"]`);
      const d = kart && kart.querySelectorAll("details")[Number(i)];
      if (d) d.open = true;
    });
  }
};

/* ====================================================================
   v3 EKLERİ: Gelişmiş RPG Seviye Sistemi (Alt Kademeler I-II-III,
   Seri & Günlük Kombo Çarpanı, 3 Uzmanlık Dalı, Evrim Şartları),
   günlük görevler, başarımlar, favoriler, takip ve bildirimler.
   ==================================================================== */
(function () {
  const XP = "indieverse_xp";
  const SERI = "indieverse_seri";
  const BASARIM = "indieverse_basarimlar";
  const FAV = "indieverse_favoriler";
  const TAKIP = "indieverse_takip";
  const BILDIRIM = "indieverse_bildirim";
  const HESAP = "indieverse_hesaplar";
  const OTURUM = "indieverse_oturum";
  const GUN = 864e5;

  /* XP kuralları: xp = taban kazanç, limit = günlük üst sınır, dal = uzmanlık ekseni, carpan = çarpandan etkilenir mi */
  const KURAL = {
    paylasim:  { xp: 4, limit: 5,  dal: "topluluk", carpan: true },
    puan:      { xp: 3, limit: 8,  dal: "kasif",    carpan: true },
    kriter:    { xp: 3, limit: 5,  dal: "kasif",    carpan: true },
    yorum:     { xp: 2, limit: 10, dal: "topluluk", carpan: true },
    uzunYorum: { xp: 2, limit: 5,  dal: "topluluk", carpan: true },
    begeni:    { xp: 1, limit: 15, dal: "topluluk", carpan: false },
    oyun:      { xp: 8, limit: 3,  dal: "uretici",  carpan: true },
    ilan:      { xp: 4, limit: 3,  dal: "uretici",  carpan: true },
    giris:     { xp: 2, limit: 1,  dal: "uretici",  carpan: false },
    seri:      { xp: 8, limit: 1,  dal: "uretici",  carpan: false },
    gorev:     { xp: 5, limit: 3,  dal: "uretici",  carpan: false },
    favori:    { xp: 1, limit: 5,  dal: "kasif",    carpan: false },
    tepki:     { xp: 0, limit: 99, dal: "topluluk", carpan: false },
    test:      { xp: 10, limit: 99, dal: "kasif",   carpan: false }
  };

  IV.XP_ETIKET = {
    paylasim:  ["📝", "Topluluk paylaşımı"],
    puan:      ["⭐", "Oyun puanlama"],
    kriter:    ["🎯", "4 Kriter Kritik XP"],
    yorum:     ["💬", "Yorum"],
    uzunYorum: ["✨", "Detaylı inceleme bonusu"],
    begeni:    ["❤️", "Tepki aldın"],
    oyun:      ["🚀", "Oyun yayınlama"],
    ilan:      ["📌", "Ekip ilanı"],
    giris:     ["🌊", "Günlük giriş"],
    seri:      ["🔥", "7 günlük seri bonusu"],
    gorev:     ["✅", "Görev ödülü"],
    favori:    ["🤍", "Favori ekleme"],
    eski:      ["📦", "Önceki puanların"],
    test:      ["🧪", "Test XP"]
  };

  const KOMBO_TURLER = new Set(["paylasim", "puan", "kriter", "yorum", "favori", "tepki", "oyun", "ilan"]);

  /* Demo kullanıcılar */
  const ORNEKLER = [
    { ad: "Mavi Ejder Oyunları", xp: 195, hafta: 46 },
    { ad: "Gölge Atölyesi", xp: 142, hafta: 34 },
    { ad: "Deniz", xp: 94, hafta: 28 },
    { ad: "Neon Dedektif", xp: 76, hafta: 22 },
    { ad: "Mert", xp: 52, hafta: 18 },
    { ad: "Elif", xp: 34, hafta: 14 },
    { ad: "Cem", xp: 19, hafta: 9 }
  ];
  const ornekBul = ad => ORNEKLER.find(o => IV.kucuk(o.ad) === IV.kucuk(ad));

  const GOREVLER = [
    { id: "puanla", ad: "Bir oyunu puanla", tur: "puan", hedef: 1 },
    { id: "paylas", ad: "Toplulukta bir paylaşım yap", tur: "paylasim", hedef: 1 },
    { id: "yorum2", ad: "2 yorum yaz", tur: "yorum", hedef: 2 },
    { id: "favori", ad: "Bir oyunu favorile", tur: "favori", hedef: 1 },
    { id: "tepki3", ad: "3 gönderiye tepki ver", tur: "tepki", hedef: 3 },
    { id: "kriter1", ad: "Bir oyuna 4 kriter puanı ver", tur: "kriter", hedef: 1 }
  ];

  /* ---------- Genel yardımcılar ---------- */
  IV.gun = function (ts) {
    const d = new Date(ts || Date.now());
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  IV.oturum = function () {
    const o = IV.oku(OTURUM, null);
    return o && o.kullanici ? o.kullanici : null;
  };
  IV.hesapBul = function (ad) {
    if (!ad) return null;
    return IV.oku(HESAP, []).find(h => IV.kucuk(h.kullanici) === IV.kucuk(ad)) || null;
  };
  IV.hizSiniri = function (anahtar, ms) {
    try {
      const son = Number(sessionStorage.getItem("iv_hiz_" + anahtar) || 0);
      if (Date.now() - son < ms) return false;
      sessionStorage.setItem("iv_hiz_" + anahtar, String(Date.now()));
    } catch (e) { /* sessionStorage yoksa sınırlama yok */ }
    return true;
  };

  /* Oturum değişince diğer parçalar haberdar olsun */
  const _yaz = IV.yaz;
  IV.yaz = function (anahtar, deger) {
    _yaz.call(IV, anahtar, deger);
    if (anahtar === OTURUM) document.dispatchEvent(new Event("oturumDegisti"));
  };

  /* ---------- Bildirim balonu (toast) ---------- */
  IV.bildir = function (html, tur) {
    let kap = document.getElementById("xpToastKap");
    if (!kap) {
      kap = document.createElement("div");
      kap.id = "xpToastKap";
      kap.setAttribute("aria-live", "polite");
      document.body.appendChild(kap);
    }
    const t = document.createElement("div");
    t.className = "xp-toast " + (tur || "");
    t.innerHTML = html;
    kap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("goster"));
    setTimeout(() => { t.classList.remove("goster"); setTimeout(() => t.remove(), 400); }, 3400);
  };

  /* ---------- XP defteri ---------- */
  function defter(kullanici, olustur) {
    const tum = IV.oku(XP, {});
    const k = IV.kucuk(kullanici);
    if (!tum[k] && olustur) {
      tum[k] = [];
      IV.yaz(XP, tum);
    }
    return { tum, k, liste: tum[k] || null };
  }
  IV.xpListe = function (kullanici) {
    if (!IV.hesapBul(kullanici)) return [];
    return defter(kullanici, true).liste || [];
  };
  IV.xpToplam = function (kullanici) {
    if (!kullanici) return 0;
    if (IV.hesapBul(kullanici)) return IV.xpListe(kullanici).reduce((t, x) => t + x.m, 0);
    const o = ornekBul(kullanici);
    return o ? o.xp : 0;
  };
  IV.haftalikXp = function (kullanici) {
    if (!IV.hesapBul(kullanici)) { const o = ornekBul(kullanici); return o ? o.hafta : 0; }
    const esik = Date.now() - 7 * GUN;
    return IV.xpListe(kullanici).filter(x => x.t !== "eski" && x.z >= esik).reduce((t, x) => t + x.m, 0);
  };
  IV.xpGecmis = function (kullanici, adet) {
    const l = IV.xpListe(kullanici).filter(x => x.m > 0).slice().reverse();
    return adet ? l.slice(0, adet) : l;
  };

  /* ---------- Seri & Günlük Kombo Çarpanı ---------- */
  IV.carpanBilgi = function (kullanici) {
    if (!kullanici || !IV.hesapBul(kullanici)) {
      return { seriCarpan: 1, komboCarpan: 1, toplam: 1, bugunCesit: 0, seriGun: 0 };
    }
    const seriGun = IV.seri(kullanici).seri;
    let seriCarpan = 1;
    if (seriGun >= 7) seriCarpan = 2.0;
    else if (seriGun >= 5) seriCarpan = 1.5;
    else if (seriGun >= 3) seriCarpan = 1.25;

    const bugun = IV.gun();
    const cesitler = new Set(
      IV.xpListe(kullanici)
        .filter(x => IV.gun(x.z) === bugun && KOMBO_TURLER.has(x.t))
        .map(x => x.t)
    );
    const bugunCesit = cesitler.size;
    let komboCarpan = 1;
    if (bugunCesit >= 4) komboCarpan = 1.5;
    else if (bugunCesit >= 3) komboCarpan = 1.3;
    else if (bugunCesit >= 2) komboCarpan = 1.15;

    const toplam = Math.min(3.0, Number((seriCarpan * komboCarpan).toFixed(2)));
    return { seriCarpan, komboCarpan, toplam, bugunCesit, seriGun };
  };

  /* ---------- 3 Uzmanlık Dalı (Kâşif, Topluluk, Üretici) ---------- */
  IV.uzmanliklar = function (kullanici) {
    const puanlar = { kasif: 0, topluluk: 0, uretici: 0 };
    IV.xpListe(kullanici).forEach(x => {
      const k = KURAL[x.t];
      const dal = k ? k.dal : "kasif";
      puanlar[dal] = (puanlar[dal] || 0) + (x.m || 0);
    });
    const tanim = [
      { id: "kasif", ad: "Kâşif", ikon: "🧭", renk: "#4cc9ff", aciklama: "Puanlama, 4 kriter ve favoriler" },
      { id: "topluluk", ad: "Topluluk", ikon: "🗣️", renk: "#9d8bff", aciklama: "Paylaşım, yorum ve tepkiler" },
      { id: "uretici", ad: "Üretici & Seri", ikon: "🛠️", renk: "#5eead4", aciklama: "Oyun/ilan, görevler ve seri" }
    ];
    return tanim.map(t => {
      const xp = puanlar[t.id] || 0;
      const rutbe = xp >= 120 ? "Efsane" : xp >= 50 ? "Usta" : xp >= 15 ? "Gelişen" : "Çırak";
      const hedef = xp >= 120 ? 200 : xp >= 50 ? 120 : xp >= 15 ? 50 : 15;
      const taban = xp >= 120 ? 120 : xp >= 50 ? 50 : xp >= 15 ? 15 : 0;
      const yuzde = Math.min(100, Math.round((xp - taban) / (hedef - taban) * 100));
      return Object.assign({}, t, { xp, rutbe, hedef, yuzde });
    });
  };

  /* XP ekle: kural, günlük limit, tekrar ref ve aktif çarpanı uygular */
  IV.xpEkle = function (kullanici, tur, ref, ozelMiktar) {
    const kural = KURAL[tur];
    if (!kural || !kullanici || !IV.hesapBul(kullanici)) return 0;
    const d = defter(kullanici, true);
    const bugun = IV.gun();
    if (ref && d.liste.some(x => x.t === tur && x.r === ref)) return 0;
    if (d.liste.filter(x => x.t === tur && IV.gun(x.z) === bugun).length >= kural.limit) return 0;

    const carpan = kural.carpan ? IV.carpanBilgi(kullanici).toplam : 1;
    const taban = ozelMiktar !== undefined ? ozelMiktar : kural.xp;
    const kazanc = taban > 0 ? Math.max(1, Math.round(taban * carpan)) : 0;

    d.liste.push({ t: tur, m: kazanc, z: Date.now(), r: ref || "", c: carpan > 1 ? carpan : 1 });
    IV.yaz(XP, d.tum);

    const ben = IV.oturum();
    const benMi = ben && IV.kucuk(ben) === IV.kucuk(kullanici);
    if (benMi && kazanc > 0 && tur !== "gorev") {
      const e = IV.XP_ETIKET[tur] || ["✨", tur];
      const cYazi = carpan > 1 ? " · ×" + carpan : "";
      IV.bildir("<b>+" + kazanc + " XP" + cYazi + "</b><span>" + IV.temiz(e[1]) + "</span>", "xp");
    }
    document.dispatchEvent(new CustomEvent("xpDegisti", { detail: { kullanici, tur, miktar: kazanc, carpan } }));
    if (tur !== "gorev" && tur !== "seri" && tur !== "test") gorevKontrol(kullanici);
    IV.basarimKontrol(kullanici);
    return kazanc;
  };

  /* Giriş yapmış kullanıcı için XP kazan */
  IV.xpKazan = function (tur, ref) {
    const k = IV.oturum();
    if (!k || !IV.hesapBul(k)) {
      try {
        if (!sessionStorage.getItem("iv_ipucu")) {
          sessionStorage.setItem("iv_ipucu", "1");
          IV.bildir('<b>XP için giriş yap</b><span><a href="uye.html">Üye ol ya da giriş yap</a>; yaptıkların çarpanlı XP kazandırır.</span>', "ipucu");
        }
      } catch (e) { /* yoksay */ }
      return 0;
    }
    return IV.xpEkle(k, tur, ref);
  };

  /* ---------- Gelişmiş Seviye Özeti (Alt Kademe I-II-III + Evrim Şartı) ---------- */
  const ROMA = ["I", "II", "III"];
  IV.seviyeOzet = function (puan, kullanici) {
    const kul = kullanici || IV.oturum();
    const gecerliKul = kul && IV.hesapBul(kul) ? kul : null;
    const { i, sv, sonraki } = IV.seviyeBul(puan, gecerliKul);

    let yuzde = 100, kademe = 3, kalan = 0, kilitliSart = false, sartTamam = true;
    if (sonraki) {
      const aralik = Math.max(1, sonraki.esik - sv.esik);
      const ilerleme = Math.max(0, puan - sv.esik);
      yuzde = Math.min(100, Math.round((ilerleme / aralik) * 100));
      kalan = Math.max(0, sonraki.esik - puan);
      kademe = yuzde >= 67 ? 3 : yuzde >= 34 ? 2 : 1;
      if (gecerliKul && sonraki.sartKontrol) {
        sartTamam = sonraki.sartKontrol(IV.basarimVerisi(gecerliKul));
        if (kalan === 0 && !sartTamam) kilitliSart = true;
      }
    }
    const seviyeNo = sonraki ? i * 3 + kademe : IV.seviyeler.length * 3 - 2;
    const kademeRoma = sonraki ? ROMA[kademe - 1] : "MAX";
    const carpan = gecerliKul ? IV.carpanBilgi(gecerliKul) : { seriCarpan: 1, komboCarpan: 1, toplam: 1, bugunCesit: 0, seriGun: 0 };

    return {
      i, sv, sonraki, yuzde, puan, kalan,
      kademe, kademeRoma, seviyeNo,
      sartTamam, kilitliSart,
      sartMetin: sonraki ? sonraki.sartMetin : "",
      carpan
    };
  };

  IV.yazarRozet = function (ad) {
    if (!ad || (!IV.hesapBul(ad) && !ornekBul(ad))) return null;
    return IV.seviyeBul(IV.xpToplam(ad), ad).sv;
  };

  /* ---------- Yeni Gelişmiş RPG Seviye Barı HTML'i ---------- */
  IV.xpBarHtml = function (puan, kullanici, secenek = {}) {
    const kul = kullanici || IV.oturum();
    const o = IV.seviyeOzet(puan, kul);
    const c = o.carpan;

    const carpanEtiketleri = [];
    if (c.seriCarpan > 1) carpanEtiketleri.push('<span class="xp-chip seri">🔥 ×' + c.seriCarpan + ' Seri</span>');
    if (c.komboCarpan > 1) carpanEtiketleri.push('<span class="xp-chip kombo">⚡ ×' + c.komboCarpan + ' Kombo (' + c.bugunCesit + ' tür)</span>');
    if (!carpanEtiketleri.length) carpanEtiketleri.push('<span class="xp-chip">⚡ ×1.0 · Farklı eylemlerle kombo aç</span>');

    const kademeDurum = o.sonraki
      ? '<div class="xp-kademeler">' +
          [1, 2, 3].map(k =>
            '<span class="' + (o.kademe > k || o.yuzde === 100 ? "gecti" : o.kademe === k ? "simdi" : "") + '">Kademe ' + ROMA[k - 1] + '</span>'
          ).join("") +
        '</div>'
      : '<div class="xp-kademeler"><span class="gecti">★ Zirve Form</span></div>';

    const sonrakiRozet = o.sonraki
      ? '<img class="xp-hedef-rozet' + (o.kilitliSart ? " kilit-uyari" : "") + '" src="' + IV.rozetUrl(o.sonraki, true) +
        '" alt="' + IV.temiz(o.sonraki.ad) + '" title="Sonraki form: ' + IV.temiz(o.sonraki.ad) + '">'
      : '<span class="xp-zirve-ikon" title="En üst seviye">👑</span>';

    const sartSatiri = o.sonraki && o.sartMetin
      ? '<div class="xp-sart ' + (o.sartTamam ? "tamam" : o.kilitliSart ? "bekliyor" : "") + '">' +
          (o.sartTamam
            ? '<span>✅ Evrim şartı tamamlandı: ' + IV.temiz(o.sartMetin) + '</span>'
            : '<span>' + (o.kilitliSart ? "⚡ XP doldu! Evrim için son şart: " : "🔒 Evrim şartı: ") + '<b>' + IV.temiz(o.sartMetin) + '</b></span>') +
        '</div>'
      : "";

    let uzmanlikHtml = "";
    if (secenek.detayli && kul && IV.hesapBul(kul)) {
      const dallar = IV.uzmanliklar(kul);
      uzmanlikHtml = '<div class="uzmanlik-izgara">' + dallar.map(u =>
        '<div class="uzmanlik-kart" style="--r:' + u.renk + '">' +
          '<div class="uz-ust"><span>' + u.ikon + ' <b>' + IV.temiz(u.ad) + '</b></span><small>' + u.rutbe + ' · ' + u.xp + ' XP</small></div>' +
          '<div class="cubuk"><div style="width:' + u.yuzde + '%;background:' + u.renk + '"></div></div>' +
          '<small class="puan-bilgi">' + IV.temiz(u.aciklama) + '</small>' +
        '</div>'
      ).join("") + '</div>';
    }

    return '<div class="xp-panel' + (o.kilitliSart ? " kilit-nabiz" : "") + '" style="--r:' + o.sv.renk + '">' +
      '<div class="xp-ust">' +
        '<span class="xp-sv-rozet">Sv. ' + o.seviyeNo + ' · ' + IV.temiz(o.sv.ad) + ' ' + o.kademeRoma + '</span>' +
        '<div class="xp-chipler">' + carpanEtiketleri.join("") + '</div>' +
      '</div>' +
      '<div class="xp-hat">' +
        '<img class="xp-mevcut-rozet" src="' + IV.rozetUrl(o.sv, true) + '" alt="' + IV.temiz(o.sv.ad) + '">' +
        '<div class="xp-bar-kapsam">' +
          '<div class="xp-bar segmentli" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + o.yuzde +
          '" aria-label="' + IV.temiz(o.sv.ad) + ' seviyesi ilerlemesi">' +
            '<div class="xp-dolgu" style="width:' + o.yuzde + '%"></div>' +
            '<span class="xp-tik" style="left:33.3%"></span><span class="xp-tik" style="left:66.6%"></span>' +
          '</div>' +
          kademeDurum +
        '</div>' +
        sonrakiRozet +
      '</div>' +
      '<div class="xp-satir">' +
        '<span>' + (o.sonraki
          ? (o.kilitliSart
              ? '<b>XP tamam!</b> ' + IV.temiz(o.sonraki.ad) + ' için aşağıdaki şartı tamamla'
              : '<b>' + o.kalan + ' XP</b> sonra ' + IV.temiz(o.sonraki.ad))
          : 'En üst formdasın! 🎉') + '</span>' +
        '<span><b>' + o.puan + '</b>' + (o.sonraki ? ' / ' + o.sonraki.esik : '') + ' XP (%' + o.yuzde + ')</span>' +
      '</div>' +
      sartSatiri +
      uzmanlikHtml +
    '</div>';
  };

  IV.yolculukHtml = function (puan, kullanici) {
    const o = IV.seviyeOzet(puan, kullanici);
    const S = IV.seviyeler;
    const dolu = (o.i + (o.sonraki ? o.yuzde / 100 : 0)) / (S.length - 1) * 100;
    return '<div class="yolculuk"><div class="yol-ic">' +
      '<div class="yol-cizgi"><div class="yol-dolu" style="width:' + dolu.toFixed(1) + '%"></div></div>' +
      '<ol class="yol-duraklar">' + S.map((s, k) =>
        '<li class="' + (k < o.i ? "gecti" : k === o.i ? "simdi" : "kilitli") + '" style="--r:' + s.renk + '"' + (k === o.i ? ' aria-current="step"' : "") + '>' +
        '<img src="' + IV.rozetUrl(s, true) + '" alt=""><b>' + IV.temiz(s.ad) + '</b><small>' + s.esik + ' XP</small></li>').join("") +
      '</ol></div></div>';
  };

  /* ---------- Günlük giriş + seri ---------- */
  IV.gunlukGiris = function (kullanici) {
    if (!kullanici || !IV.hesapBul(kullanici)) return null;
    const tum = IV.oku(SERI, {});
    const k = IV.kucuk(kullanici);
    const bugun = IV.gun(), dun = IV.gun(Date.now() - GUN);
    const s = tum[k] || { son: "", seri: 0, enUzun: 0 };
    if (s.son === bugun) return s;
    s.seri = s.son === dun ? s.seri + 1 : 1;
    s.enUzun = Math.max(s.enUzun || 0, s.seri);
    s.son = bugun;
    tum[k] = s;
    IV.yaz(SERI, tum);
    IV.xpEkle(kullanici, "giris", bugun);
    if (s.seri % 7 === 0) IV.xpEkle(kullanici, "seri", bugun);
    return s;
  };
  IV.seri = function (kullanici) {
    const s = IV.oku(SERI, {})[IV.kucuk(kullanici)];
    if (!s) return { seri: 0, enUzun: 0, bugunTamam: false };
    const aktif = s.son === IV.gun() || s.son === IV.gun(Date.now() - GUN);
    return { seri: aktif ? s.seri : 0, enUzun: s.enUzun || 0, bugunTamam: s.son === IV.gun() };
  };

  /* ---------- Günlük görevler ---------- */
  IV.gunlukGorevler = function (kullanici) {
    const bugun = IV.gun();
    const baz = Number(bugun.replace(/-/g, ""));
    const liste = IV.xpListe(kullanici).filter(x => IV.gun(x.z) === bugun);
    return [0, 2, 4].map(a => {
      const g = GOREVLER[(baz + a) % GOREVLER.length];
      const say = liste.filter(x => x.t === g.tur).length;
      return Object.assign({}, g, { say: Math.min(say, g.hedef), tamam: say >= g.hedef });
    });
  };
  function gorevKontrol(kullanici) {
    const bugun = IV.gun();
    const ben = IV.oturum();
    IV.gunlukGorevler(kullanici).forEach(g => {
      if (!g.tamam) return;
      if (IV.xpEkle(kullanici, "gorev", bugun + ":" + g.id) > 0 && ben && IV.kucuk(ben) === IV.kucuk(kullanici)) {
        IV.bildir("<b>✅ Görev tamamlandı · +" + KURAL.gorev.xp + " XP</b><span>" + IV.temiz(g.ad) + "</span>", "xp");
      }
    });
  }

  /* ---------- Başarımlar ---------- */
  IV.basarimVerisi = function (kullanici) {
    const ist = IV.kullaniciIstatistik(kullanici);
    const acikBasarim = (IV.oku(BASARIM, {})[IV.kucuk(kullanici)] || []).length;
    const ad = IV.kucuk(kullanici);
    const oyunEklenen = IV.oyunlariGetir().filter(o => o.benim && (!o.sahip || IV.kucuk(o.sahip) === ad)).length;
    return Object.assign({}, ist, {
      seri: IV.seri(kullanici).enUzun,
      favori: IV.favoriler().length,
      oyunEklenen,
      basarimSayisi: acikBasarim,
      takip: (IV.oku(TAKIP, {})[ad] || []).length
    });
  };

  window.IVBasarim = {
    durum: k => {
      const d = IV.basarimVerisi(k);
      d.seviye = IV.seviyeBul(d.puan, k).i;
      return d;
    },
    liste: [
      { id: "ilk-adim", ad: "İlk Adım", ikon: "👣", aciklama: "İlk paylaşımını yap.", hedef: 1, deger: d => d.paylasim },
      { id: "elestirmen", ad: "Eleştirmen", ikon: "⭐", aciklama: "5 oyunu puanla.", hedef: 5, deger: d => d.puanlanan },
      { id: "detayci", ad: "Detaycı Göz", ikon: "🎯", aciklama: "2 oyuna 4 kriter puanı ver.", hedef: 2, deger: d => d.detayPuan },
      { id: "sohbet", ad: "Sohbet Ustası", ikon: "💬", aciklama: "10 yorum yaz.", hedef: 10, deger: d => d.yorum },
      { id: "sevilen", ad: "Sevilen Ses", ikon: "❤️", aciklama: "Gönderilerin 10 tepki alsın.", hedef: 10, deger: d => d.begeni },
      { id: "koleksiyoncu", ad: "Koleksiyoncu", ikon: "📚", aciklama: "3 oyunu favorile.", hedef: 3, deger: d => d.favori },
      { id: "seri3", ad: "Alışkanlık", ikon: "🔥", aciklama: "3 gün üst üste giriş yap.", hedef: 3, deger: d => d.seri },
      { id: "seri7", ad: "Vazgeçmeyen", ikon: "🌊", aciklama: "7 gün üst üste giriş yap.", hedef: 7, deger: d => d.seri },
      { id: "yapimci", ad: "Yapımcı", ikon: "🛠️", aciklama: "Bir oyun yayınla.", hedef: 1, deger: d => d.oyunEklenen },
      { id: "sosyal", ad: "Sosyal Balık", ikon: "👥", aciklama: "3 kişiyi takip et.", hedef: 3, deger: d => d.takip },
      { id: "ejderha", ad: "Ejderha", ikon: "🐉", aciklama: "Ejderha seviyesine ulaş.", hedef: 5, deger: d => (d.seviye ?? 0) + 1 },
      { id: "evren", ad: "Evren Bekçisi", ikon: "🌌", aciklama: "En üst seviyeye ulaş.", hedef: 7, deger: d => (d.seviye ?? 0) + 1 }
    ]
  };

  IV.basarimKontrol = function (kullanici) {
    if (!kullanici || !IV.hesapBul(kullanici)) return;
    const d = window.IVBasarim.durum(kullanici);
    const tum = IV.oku(BASARIM, {});
    const k = IV.kucuk(kullanici);
    const acik = tum[k] || [];
    const yeni = window.IVBasarim.liste.filter(b => !acik.includes(b.id) && b.deger(d) >= b.hedef);
    if (!yeni.length) return;
    tum[k] = acik.concat(yeni.map(b => b.id));
    IV.yaz(BASARIM, tum);
    const ben = IV.oturum();
    if (ben && IV.kucuk(ben) === k) {
      yeni.forEach((b, i) => setTimeout(() =>
        IV.bildir("<b>" + b.ikon + " Başarım açıldı</b><span>" + IV.temiz(b.ad) + "</span>", "basarim"), 700 + i * 1000));
    }
  };

  /* ---------- Sıralama ---------- */
  IV.liderler = function (adet) {
    const liste = [], gorulen = new Set();
    IV.oku(HESAP, []).forEach(h => {
      gorulen.add(IV.kucuk(h.kullanici));
      liste.push({ ad: h.kullanici, toplam: IV.xpToplam(h.kullanici), hafta: IV.haftalikXp(h.kullanici), demo: false });
    });
    ORNEKLER.forEach(o => {
      if (!gorulen.has(IV.kucuk(o.ad))) liste.push({ ad: o.ad, toplam: o.xp, hafta: o.hafta, demo: true });
    });
    liste.sort((a, b) => b.hafta - a.hafta || b.toplam - a.toplam);
    return adet ? liste.slice(0, adet) : liste;
  };

  /* ---------- Favoriler (hesaba göre ayrılmış, eski liste destekli) ---------- */
  IV.favoriler = function () {
    const raw = IV.oku(FAV, null);
    if (Array.isArray(raw)) return raw; // eski biçimle uyumlu
    if (!raw || typeof raw !== "object") return [];
    const k = IV.kimlikAnahtari();
    return raw[k] || [];
  };
  IV.favoriDegistir = function (id) {
    let raw = IV.oku(FAV, null);
    const k = IV.kimlikAnahtari();
    if (Array.isArray(raw)) {
      const eski = raw.slice();
      raw = {};
      raw[k] = eski;
    }
    if (!raw || typeof raw !== "object") raw = {};
    const l = raw[k] || [];
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    raw[k] = l;
    IV.yaz(FAV, raw);
    document.dispatchEvent(new CustomEvent("favoriDegisti", { detail: { id, acik: i < 0 } }));
    if (i < 0) IV.xpKazan("favori", id);
    const kul = IV.oturum();
    if (kul) IV.basarimKontrol(kul);
    return i < 0;
  };

  /* ---------- Takip ve bildirimler ---------- */
  IV.takipEdilenler = function (kullanici) { return IV.oku(TAKIP, {})[IV.kucuk(kullanici)] || []; };
  IV.bildirimEkle = function (kime, metin) {
    if (!kime) return;
    const tum = IV.oku(BILDIRIM, {});
    const k = IV.kucuk(kime);
    const l = tum[k] || [];
    l.unshift({ m: metin, z: Date.now(), o: false });
    tum[k] = l.slice(0, 30);
    IV.yaz(BILDIRIM, tum);
    document.dispatchEvent(new Event("bildirimDegisti"));
  };
  IV.bildirimler = function (kullanici) { return IV.oku(BILDIRIM, {})[IV.kucuk(kullanici)] || []; };
  IV.bildirimOkundu = function (kullanici) {
    const tum = IV.oku(BILDIRIM, {});
    (tum[IV.kucuk(kullanici)] || []).forEach(x => { x.o = true; });
    IV.yaz(BILDIRIM, tum);
    document.dispatchEvent(new Event("bildirimDegisti"));
  };
  IV.takipDegistir = function (ben, hedef) {
    const tum = IV.oku(TAKIP, {});
    const k = IV.kucuk(ben), h = IV.kucuk(hedef);
    const l = tum[k] || [];
    const i = l.indexOf(h);
    if (i >= 0) l.splice(i, 1); else l.push(h);
    tum[k] = l;
    IV.yaz(TAKIP, tum);
    if (i < 0) IV.bildirimEkle(hedef, ben + " seni takip etmeye başladı.");
    IV.basarimKontrol(ben);
    return i < 0;
  };

  /* ---------- Oyun kartı: favori butonu ---------- */
  const _kart = IV.kartHtml;
  IV.kartHtml = function (o, secenek) {
    const h = _kart.call(IV, o, secenek);
    const fav = IV.favoriler().includes(o.id);
    const btn = '<button type="button" class="fav-btn' + (fav ? " acik" : "") + '" data-fav="' + IV.temiz(o.id) +
      '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Favorilerden çıkar" : "Favorilere ekle") +
      '" title="' + (fav ? "Favorilerden çıkar" : "Favorilere ekle") + '">' + (fav ? "❤️" : "🤍") + "</button>";
    return h.replace(/(<article class="oyun-kart"[^>]*>)/, "$1" + btn);
  };

  const _bagla = IV.baglaKartOlaylari;
  IV.baglaKartOlaylari = function (kapsayici, yenidenCiz) {
    _bagla.call(IV, kapsayici, yenidenCiz);
    kapsayici.addEventListener("click", e => {
      const b = e.target.closest("[data-fav]");
      if (!b) return;
      IV.favoriDegistir(b.dataset.fav);
      yenidenCiz(b.dataset.fav);
    });
  };

  /* Sunum/test yardımcısı: konsoldan xpTest(25) yazarak seviye/evrim test edilebilir */
  window.xpTest = function (miktar) {
    const k = IV.oturum();
    if (!k) { console.warn("Önce giriş yapmalısın."); return; }
    IV.xpEkle(k, "test", "t" + Date.now(), Number(miktar) || 15);
  };
})();
