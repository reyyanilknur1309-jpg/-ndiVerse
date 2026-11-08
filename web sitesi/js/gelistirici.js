/* ================= Geliştirici Paneli ================= */
(function () {
  const form = document.getElementById("oyunEkleFormu");
  const mesaj = document.getElementById("basariMesaji");
  const projelerim = document.getElementById("projelerim");

  function ciz() {
    const acik = IV.acikKartlar(projelerim);
    const benimkiler = IV.oyunlariGetir().filter(o => o.benim);
    projelerim.innerHTML = benimkiler.length
      ? benimkiler.map(o => IV.kartHtml(o, { sil: true, yorumFormu: false })).join("")
      : `<div class="bos-mesaj">Henüz proje eklemedin. Yukarıdaki formu doldurarak ilk oyununu yayınla!</div>`;
    IV.acikKartlariGeriYukle(projelerim, acik);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const platformlar = [...form.querySelectorAll('input[name="platform"]:checked')].map(c => c.value);
    if (!platformlar.length) {
      alert("Lütfen en az bir platform seç.");
      return;
    }

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
      oylar: {},
      yorumlar: []
    };

    const liste = IV.oyunlariGetir();
    liste.unshift(oyun);
    IV.oyunlariKaydet(liste);

    form.reset();
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
  ciz();
})();