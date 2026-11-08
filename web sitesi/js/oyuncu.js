/* ================= Oyun Keşfet sayfası ================= */
(function () {
  const form = document.getElementById("filtreFormu");
  const sonuclar = document.getElementById("sonuclar");
  const sayi = document.getElementById("sonucSayisi");

  function puanla(oyun, kelimeler) {
    let skor = 0;
    const ad = IV.kucuk(oyun.ad);
    const studyo = IV.kucuk(oyun.studyo);
    const anahtar = (oyun.anahtar || []).map(IV.kucuk);
    const metin = IV.kucuk(oyun.amac + " " + oyun.aciklama);
    kelimeler.forEach(k => {
      if (ad.includes(k)) skor += 5;
      if (anahtar.some(a => a.includes(k))) skor += 3;
      if (studyo.includes(k)) skor += 2;
      if (metin.includes(k)) skor += 1;
    });
    return skor;
  }

  function filtrele() {
    const arama = IV.kucuk(form.arananKelime.value).trim();
    const kelimeler = arama.split(/[\s,]+/).filter(Boolean);
    const tur = form.anaTur.value;
    const platformlar = [...form.querySelectorAll('input[name="platform"]:checked')].map(c => c.value);
    const atmosfer = form.querySelector('input[name="atmosfer"]:checked').value;
    const siralama = form.siralama.value;
    const minPuan = Number(form.minPuan.value);

    const tum = IV.oyunlariGetir();
    const C = IV.genelOrtalama(tum);

    let liste = tum.map((o, idx) => ({
      o, idx,
      skor: kelimeler.length ? puanla(o, kelimeler) : 0,
      p: IV.ortalama(o),
      g: IV.agirlikliPuan(o, C)
    }));

    liste = liste.filter(({ o, skor, p }) => {
      if (kelimeler.length && skor === 0) return false;
      if (tur !== "tumu" && o.tur !== tur) return false;
      if (platformlar.length && !platformlar.some(x => (o.platformlar || []).includes(x))) return false;
      if (atmosfer !== "hepsi" && o.atmosfer !== atmosfer && o.atmosfer !== "hepsi") return false;
      if (minPuan && p.ort < minPuan) return false;
      return true;
    });

    liste.sort((a, b) => {
      switch (siralama) {
        case "guvenilir": return b.g - a.g;
        case "ortalama":  return b.p.ort - a.p.ort || b.p.adet - a.p.adet;
        case "oyadet":    return b.p.adet - a.p.adet || b.g - a.g;
        case "yeni":      return a.idx - b.idx;
        default:          return b.skor - a.skor || b.g - a.g;
      }
    });
    return liste.map(x => x.o);
  }

  let kilitSira = [];

  function ciz(sirayiKoru) {
    const acik = IV.acikKartlar(sonuclar);
    const liste = filtrele();
    // Puan verince kartın yer değiştirmemesi için mevcut sırayı koru
    if (sirayiKoru === true && kilitSira.length) {
      liste.sort((a, b) => kilitSira.indexOf(a.id) - kilitSira.indexOf(b.id));
    }
    kilitSira = liste.map(o => o.id);
    sayi.textContent = liste.length ? `${liste.length} oyun bulundu.` : "";
    sonuclar.innerHTML = liste.length
      ? liste.map(o => IV.kartHtml(o)).join("")
      : `<div class="bos-mesaj">😕 Aradığın kriterlere uygun oyun bulunamadı. Başka anahtar kelimeler dene.</div>`;
    IV.acikKartlariGeriYukle(sonuclar, acik);
  }

  form.addEventListener("submit", e => { e.preventDefault(); ciz(); });
  form.addEventListener("change", () => ciz());
  form.arananKelime.addEventListener("input", () => ciz());

  IV.baglaKartOlaylari(sonuclar, () => ciz(true));
  ciz();
})();