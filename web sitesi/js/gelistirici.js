/* ================= Geliştirici Paneli (v3) ================= */
(function () {
  const form = document.getElementById("oyunEkleFormu");
  const mesaj = document.getElementById("basariMesaji");
  const projelerim = document.getElementById("projelerim");

  function studyoDoldur() {
    const kul = IV.oturum();
    if (kul && !form.studyoAdi.value.trim()) form.studyoAdi.value = kul;
  }

  function ciz() {
    const acik = IV.acikKartlar(projelerim);
    const kul = IV.oturum();
    const benimkiler = IV.oyunlariGetir().filter(o =>
      o.benim && (!o.sahip || !kul || IV.kucuk(o.sahip) === IV.kucuk(kul))
    );
    projelerim.innerHTML = benimkiler.length
      ? benimkiler.map(o => IV.kartHtml(o, { sil: true, yorumFormu: false })).join("")
      : `<div class="bos-mesaj">Henüz proje eklemedin. Yukarıdaki formu doldurarak ilk oyununu yayınla! (+8 XP ve Yapımcı başarımı)</div>`;
    IV.acikKartlariGeriYukle(projelerim, acik);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const platformlar = [...form.querySelectorAll('input[name="platform"]:checked')].map(c => c.value);
    if (!platformlar.length) {
      IV.bildir("<b>Platform seçilmedi</b><span>Lütfen en az bir platform işaretle.</span>", "uyari");
      return;
    }

    const kul = IV.oturum();
    const oyun = {
      id: "u" + Date.now(),
      studyo: form.studyoAdi.value.trim(),
      ad: form.oyunAdi.value.trim(),
      tur: form.oyunTuru.value,
      atmosfer: form.atmosfer.value,
      platformlar,
      asama: form.querySelector('input[name="asama"]:checked').value,
      anahtar: form.anahtarKelimeler.value.split(",").map(k => k.trim()).filter(Boolean),
      amac: form.oyunAmaci.value.trim(),
      aciklama: form.oyunAciklama.value.trim(),
      demo: form.demoLink.value.trim(),
      beta: form.betaTest.checked,
      benim: true,
      sahip: kul || "",
      oylar: {},
      detaylar: {},
      yorumlar: []
    };

    const liste = IV.oyunlariGetir();
    liste.unshift(oyun);
    IV.oyunlariKaydet(liste);

    IV.xpKazan("oyun", oyun.id);
    if (kul) IV.basarimKontrol(kul);

    form.reset();
    studyoDoldur();
    mesaj.hidden = false;
    setTimeout(() => { mesaj.hidden = true; }, 5000);
    ciz();
  });

  projelerim.addEventListener("click", e => {
    const btn = e.target.closest("[data-sil]");
    if (!btn) return;
    if (!confirm("Bu projeyi silmek istediğine emin misin?")) return;
    const liste = IV.oyunlariGetir().filter(o => o.id !== btn.dataset.sil);
    IV.oyunlariKaydet(liste);
    ciz();
  });

  IV.baglaKartOlaylari(projelerim, () => ciz());
  document.addEventListener("oturumDegisti", () => { studyoDoldur(); ciz(); });
  studyoDoldur();
  ciz();
})();
