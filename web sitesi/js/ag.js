/* ================= Geliştirici Ağı: sohbet + ekip ilanları ================= */
(function () {
  const SOHBET = "indieverse_sohbet";
  const ILAN = "indieverse_ilanlar";

  const sohbetKutu = document.getElementById("sohbetKutu");
  const sohbetFormu = document.getElementById("sohbetFormu");
  const ilanFormu = document.getElementById("ilanFormu");
  const ilanListesi = document.getElementById("ilanListesi");

  function saat(ts) {
    return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }

  function sohbetGetir() {
    let m = IV.oku(SOHBET, null);
    if (!m) {
      m = [
        { kisi: "Gölge Atölyesi", metin: "Merhaba! Korku oyunumuz için müzisyen arıyoruz 🎵", zaman: Date.now() - 3600000 },
        { kisi: "Piksel Çiftlik", metin: "Hoş geldiniz, ilanlara göz atmayı unutmayın.", zaman: Date.now() - 1800000 }
      ];
      IV.yaz(SOHBET, m);
    }
    return m;
  }

  function sohbetCiz() {
    const mesajlar = sohbetGetir();
    sohbetKutu.innerHTML = mesajlar.map(m =>
      `<div class="mesaj"><b>${IV.temiz(m.kisi)}</b> <small>${saat(m.zaman)}</small><br>${IV.temiz(m.metin)}</div>`
    ).join("");
    sohbetKutu.scrollTop = sohbetKutu.scrollHeight;
  }

  function ilanGetir() {
    let l = IV.oku(ILAN, null);
    if (!l) {
      l = [{
        kisi: "Neon Dedektif", rol: "Programcı",
        metin: "Piksel dedektif oyunumuz için Unity bilen bir programcı arıyoruz.",
        zaman: Date.now() - 7200000
      }];
      IV.yaz(ILAN, l);
    }
    return l;
  }

  function ilanCiz() {
    const liste = ilanGetir();
    ilanListesi.innerHTML = liste.length
      ? liste.map(i => `
        <div class="ilan">
          <h4>🔎 ${IV.temiz(i.rol)} aranıyor</h4>
          <p class="studyo">${IV.temiz(i.kisi)} · ${new Date(i.zaman).toLocaleDateString("tr-TR")}</p>
          <p>${IV.temiz(i.metin)}</p>
        </div>`).join("")
      : `<div class="bos-mesaj">Henüz ilan yok.</div>`;
  }

  sohbetFormu.addEventListener("submit", e => {
    e.preventDefault();
    const mesajlar = sohbetGetir();
    mesajlar.push({
      kisi: sohbetFormu.kisi.value.trim(),
      metin: sohbetFormu.metin.value.trim(),
      zaman: Date.now()
    });
    IV.yaz(SOHBET, mesajlar.slice(-100)); // en fazla son 100 mesaj
    sohbetFormu.metin.value = "";
    sohbetCiz();
  });

  ilanFormu.addEventListener("submit", e => {
    e.preventDefault();
    const liste = ilanGetir();
    liste.unshift({
      kisi: ilanFormu.kisi.value.trim(),
      rol: ilanFormu.rol.value.trim(),
      metin: ilanFormu.metin.value.trim(),
      zaman: Date.now()
    });
    IV.yaz(ILAN, liste);
    ilanFormu.reset();
    ilanCiz();
  });

  // Aynı sitenin başka sekmesinde yazılan mesaj/ilan burada da görünsün
  window.addEventListener("storage", e => {
    if (e.key === SOHBET) sohbetCiz();
    if (e.key === ILAN) ilanCiz();
  });

  sohbetCiz();
  ilanCiz();
})();