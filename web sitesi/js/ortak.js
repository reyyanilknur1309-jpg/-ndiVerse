/* ================= IndieVerse - Ortak Fonksiyonlar ================= */
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

  /* ---------- Evrim yolculuğu (seviyeler) ---------- */
  seviyeler: [
    { ad: "Balık", esik: 0, resim: "seviye-balik",
      slogan: "Akıntıya yeni katıldın.",
      aciklama: "Her büyük ejderha küçük bir balıkla başlar. Oyunları keşfet, ilk puanlarını ver.",
      ozellikler: ["Meraklı", "Hızlı öğrenen", "Sürüye açık"] },
    { ad: "Yumurta", esik: 5, resim: "seviye-yumurta",
      slogan: "İçinde bir şeyler kıpırdıyor.",
      aciklama: "Sabırla biriktirdiğin her puan kabuğun içindeki gücü büyütüyor.",
      ozellikler: ["Sabırlı", "Potansiyel dolu", "Gizemli"] },
    { ad: "Çatlak Yumurta", esik: 12, resim: "seviye-catlak",
      slogan: "Kabuk çatlıyor, dönüşüm başladı.",
      aciklama: "Artık topluluğun fark ettiği biri oldun. Paylaşımların ve yorumların iz bırakıyor.",
      ozellikler: ["Kararlı", "Cesur", "Dönüşüme hazır"] },
    { ad: "Yavru Ejderha", esik: 25, resim: "seviye-yavru",
      slogan: "İlk nefesini aldın.",
      aciklama: "Enerjin yüksek, merakın hâlâ taze. Başkalarının oyunlarını ilerletiyorsun.",
      ozellikler: ["Enerjik", "Oyuncu", "Hızla gelişen"] },
    { ad: "Ejderha", esik: 45, resim: "seviye-ejderha1",
      slogan: "Kanatların gökyüzünü tanıyor.",
      aciklama: "Görüşlerin güveniliyor. Geliştiriciler senin geri bildirimini bekliyor.",
      ozellikler: ["Güçlü", "Özgür", "Lider ruhlu"] },
    { ad: "Kadim Ejder", esik: 80, resim: "seviye-ejderha2",
      slogan: "Bilgeliğin topluluğa yol gösteriyor.",
      aciklama: "Birikimle konuşuyorsun. Yeni gelenlere rehberlik eden nadir isimlerdensin.",
      ozellikler: ["Bilge", "Saygın", "Yol gösterici"] },
    { ad: "Evren Bekçisi", esik: 150, resim: "seviye-baloncuk",
      slogan: "Hem denizi hem göğü biliyorsun.",
      aciklama: "En üst seviye. IndieVerse evreninde balıktan ejderhaya her dönüşümün tanığısın.",
      ozellikler: ["Efsanevi", "Her şeyi gören", "Evrenin koruyucusu"] }
  ],
  seviyeBul(puan) {
    let i = 0;
    this.seviyeler.forEach((s, k) => { if (puan >= s.esik) i = k; });
    return { i, sv: this.seviyeler[i], sonraki: this.seviyeler[i + 1] || null };
  },
  rozetUrl(sv, kucuk) { return "img/" + sv.resim + (kucuk ? "-128" : "") + ".png"; },

  /* Kullanıcı puanı: paylaşım 3, yorum 1, alınan beğeni 1, oyun puanlama 2 */
  kullaniciIstatistik(kullanici) {
    const ben = this.oyuncuId();
    const ad = this.kucuk(kullanici);
    let paylasim = 0, yorum = 0, begeni = 0, puanlanan = 0;
    this.oku("indieverse_gonderiler", []).forEach(x => {
      if (x.sahip === ben) { paylasim++; begeni += (x.begeniler || []).length; }
      (x.yorumlar || []).forEach(y => { if (this.kucuk(y.kisi) === ad) yorum++; });
    });
    this.oyunlariGetir().forEach(o => { if ((o.oylar || {})[ben]) puanlanan++; });
    return { paylasim, yorum, begeni, puanlanan, puan: paylasim * 3 + yorum + begeni + puanlanan * 2 };
  },

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
    let id = localStorage.getItem(this.OYUNCU_ANAHTAR);
    if (!id) {
      id = "o" + Date.now() + Math.random().toString(36).slice(2, 7);
      localStorage.setItem(this.OYUNCU_ANAHTAR, id);
    }
    return id;
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
    const ben = this.oyuncuId();
    const { ort, adet } = this.ortalama(o);
    const benimPuan = (o.oylar || {})[ben] || 0;
    const benimDetay = (o.detaylar || {})[ben] || {};
    const kendi = !!o.benim;
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
      `<p class="puan-bilgi" style="margin-top:12px;">Detaylı puanla (isteğe bağlı):</p>` +
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
          <p><input type="text" name="kisi" placeholder="Adın" required maxlength="30"></p>
          <p><input type="text" name="metin" placeholder="Geri bildirimin..." required maxlength="250"></p>
          <button type="submit" class="ikincil">Gönder</button>
        </form>`;
    } else if (!o.beta) {
      yorumFormu = `<p class="puan-bilgi">Bu geliştirici geri bildirim kabul etmiyor.</p>`;
    }

    const sil = secenek.sil ? `<button type="button" class="ikincil" data-sil="${o.id}">🗑️ Sil</button>` : "";

    return `
      <article class="oyun-kart" data-id="${o.id}">
        <h3>${this.temiz(o.ad)}</h3>
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
      if (!oyun || oyun.benim) return;

      const ben = this.oyuncuId();
      oyun.oylar = oyun.oylar || {};
      oyun.detaylar = oyun.detaylar || {};

      if (sil) {
        delete oyun.oylar[ben];
        delete oyun.detaylar[ben];
      } else if (yildiz.dataset.kriter) {
        oyun.detaylar[ben] = oyun.detaylar[ben] || {};
        oyun.detaylar[ben][yildiz.dataset.kriter] = Number(yildiz.dataset.puan);
      } else {
        oyun.oylar[ben] = Number(yildiz.dataset.puan);
      }
      this.oyunlariKaydet(liste);
      yenidenCiz(kart.dataset.id);
    });

    kapsayici.addEventListener("submit", e => {
      const form = e.target.closest(".yorumFormu");
      if (!form) return;
      e.preventDefault();
      const kart = form.closest(".oyun-kart");
      const liste = this.oyunlariGetir();
      const oyun = liste.find(o => o.id === kart.dataset.id);
      if (!oyun) return;
      oyun.yorumlar = oyun.yorumlar || [];
      oyun.yorumlar.push({ kisi: form.kisi.value.trim(), metin: form.metin.value.trim() });
      this.oyunlariKaydet(liste);
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