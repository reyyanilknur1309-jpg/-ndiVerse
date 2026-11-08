/* ================= Oyun detay sayfası ================= */
(function () {
  const id = new URLSearchParams(location.search).get("id");
  const kutu = document.getElementById("detay");
  const benzer = document.getElementById("benzer");
  const benzerAlan = document.getElementById("benzer-alan");

  function ciz() {
    const liste = IV.oyunlariGetir();
    const o = liste.find(x => x.id === id);
    if (!o) {
      kutu.innerHTML = '<div class="bos-mesaj">😕 Oyun bulunamadı. <a href="oyuncu.html">Oyunlara dön</a></div>';
      benzerAlan.hidden = true;
      return;
    }
    document.title = "IndieVerse - " + o.ad;

    const acik = IV.acikKartlar(kutu);
    kutu.innerHTML = IV.kartHtml(o);
    IV.acikKartlariGeriYukle(kutu, acik);

    const acikB = IV.acikKartlar(benzer);
    const diger = liste.filter(x => x.id !== o.id && x.tur === o.tur).slice(0, 3);
    benzer.innerHTML = diger.length
      ? diger.map(x => IV.kartHtml(x)).join("")
      : '<div class="bos-mesaj">Bu türde başka oyun yok.</div>';
    IV.acikKartlariGeriYukle(benzer, acikB);
  }

  IV.baglaKartOlaylari(kutu, () => ciz());
  IV.baglaKartOlaylari(benzer, () => ciz());
  ciz();
})();
