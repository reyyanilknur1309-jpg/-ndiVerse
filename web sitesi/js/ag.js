/* ================= Geliştirici Ağı (v3) ================= */
(function () {
  const SOHBET = "indieverse_sohbet";
  const ILAN = "indieverse_ilanlar";
  const KANALLAR = [
    { id: "genel", ad: "# genel" }, { id: "programci", ad: "# programcı" },
    { id: "muzik", ad: "# müzik" }, { id: "cizer", ad: "# çizer" }, { id: "tasarim", ad: "# tasarım" }
  ];
  let kanal = "genel";

  const sohbetKutu = document.getElementById("sohbetKutu");
  const sohbetFormu = document.getElementById("sohbetFormu");
  const ilanFormu = document.getElementById("ilanFormu");
  const ilanListesi = document.getElementById("ilanListesi");

  const kullanici = () => IV.oturum();
  const ayni = (a, b) => IV.kucuk(a) === IV.kucuk(b);

  function saat(ts) {
    return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  function uyari(baslik, metin) {
    IV.bildir("<b>" + IV.temiz(baslik) + "</b><span>" + IV.temiz(metin) + "</span>", "uyari");
  }
  function adAlani(form) {
    const me = kullanici();
    if (me) { form.kisi.value = me; form.kisi.readOnly = true; }
    else { form.kisi.readOnly = false; }
  }

  /* ---------- Sohbet ---------- */
  function sohbetGetir() {
    let m = IV.oku(SOHBET, null);
    if (Array.isArray(m)) m = { genel: m };
    if (!m) {
      const s = Date.now();
      m = {
        genel: [
          { kisi: "Gölge Atölyesi", metin: "Merhaba! Korku oyunumuz için müzisyen arıyoruz 🎵", zaman: s - 3600000 },
          { kisi: "Piksel Çiftlik", metin: "Hoş geldiniz, ilanlara göz atmayı unutmayın.", zaman: s - 1800000 }
        ],
        programci: [{ kisi: "Neon Dedektif", metin: "Unity mi Godot mu? Piksel oyunlar için hangisini önerirsiniz?", zaman: s - 5400000 }],
        muzik: [{ kisi: "Mavi Ejder Oyunları", metin: "Telifsiz loop kütüphanesi önerisi olan var mı?", zaman: s - 2400000 }]
      };
      IV.yaz(SOHBET, m);
    }
    KANALLAR.forEach(k => { m[k.id] = m[k.id] || []; });
    return m;
  }

  const kanalSekme = document.createElement("div");
  kanalSekme.className = "sekmeler";
  kanalSekme.setAttribute("role", "tablist");
  kanalSekme.innerHTML = KANALLAR.map(k =>
    '<button type="button" class="sekme' + (k.id === kanal ? " aktif" : "") + '" role="tab" data-kanal="' + k.id + '">' + k.ad + "</button>").join("");
  sohbetKutu.parentNode.insertBefore(kanalSekme, sohbetKutu);

  function sohbetCiz() {
    const mesajlar = sohbetGetir()[kanal];
    sohbetKutu.innerHTML = mesajlar.length
      ? mesajlar.map(m => {
          const sv = IV.yazarRozet(m.kisi);
          return '<div class="mesaj"><b>' + IV.temiz(m.kisi) + "</b>" +
            (sv ? ' <img class="g-rozet" src="' + IV.rozetUrl(sv, true) + '" alt="" title="' + IV.temiz(sv.ad) + '">' : "") +
            " <small>" + saat(m.zaman) + "</small><br>" + IV.temiz(m.metin) + "</div>";
        }).join("")
      : '<div class="bos-mesaj">Bu kanalda henüz mesaj yok. İlk mesajı sen yaz.</div>';
    sohbetKutu.scrollTop = sohbetKutu.scrollHeight;
  }

  kanalSekme.addEventListener("click", e => {
    const b = e.target.closest("[data-kanal]");
    if (!b) return;
    kanal = b.dataset.kanal;
    kanalSekme.querySelectorAll(".sekme").forEach(x => x.classList.toggle("aktif", x === b));
    sohbetFormu.metin.placeholder = "#" + KANALLAR.find(k => k.id === kanal).ad.slice(2) + " kanalına yaz...";
    sohbetCiz();
  });

  sohbetFormu.addEventListener("submit", e => {
    e.preventDefault();
    if (!IV.hizSiniri("sohbet", 1500)) { uyari("Biraz yavaş", "Mesajlar arasında kısa bir ara ver."); return; }
    const metin = sohbetFormu.metin.value.trim();
    const kisi = kullanici() || sohbetFormu.kisi.value.trim();
    if (!kisi || !metin) return;
    const tum = sohbetGetir();
    tum[kanal].push({ kisi, metin, zaman: Date.now() });
    tum[kanal] = tum[kanal].slice(-100);
    IV.yaz(SOHBET, tum);
    sohbetFormu.metin.value = "";
    sohbetCiz();
  });

  /* ---------- İlanlar ---------- */
  const filtre = document.createElement("div");
  filtre.className = "ilan-filtre";
  filtre.innerHTML =
    '<select id="rolFiltre" aria-label="Role göre filtrele"><option value="">Tüm roller</option></select>' +
    '<label><input type="checkbox" id="sadeceAcik" checked> Sadece açık ilanlar</label>';
  ilanListesi.parentNode.insertBefore(filtre, ilanListesi);
  const rolFiltre = filtre.querySelector("#rolFiltre");
  const sadeceAcik = filtre.querySelector("#sadeceAcik");

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
    l.forEach((i, k) => {
      if (!i.id) i.id = "i" + k + "_" + i.zaman;
      if (i.acik === undefined) i.acik = true;
      i.basvuranlar = i.basvuranlar || [];
    });
    return l;
  }

  function rolSecenekleri(liste) {
    const secili = rolFiltre.value;
    const roller = [...new Set(liste.map(i => i.rol.trim()))].sort((a, b) => a.localeCompare(b, "tr"));
    rolFiltre.innerHTML = '<option value="">Tüm roller</option>' +
      roller.map(r => '<option value="' + IV.temiz(IV.kucuk(r)) + '">' + IV.temiz(r) + "</option>").join("");
    rolFiltre.value = roller.some(r => IV.kucuk(r) === secili) ? secili : "";
  }

  function ilanCiz() {
    const tum = ilanGetir();
    rolSecenekleri(tum);
    const me = kullanici();
    const liste = tum.filter(i =>
      (!rolFiltre.value || IV.kucuk(i.rol.trim()) === rolFiltre.value) && (!sadeceAcik.checked || i.acik));

    ilanListesi.innerHTML = liste.length
      ? liste.map(i => {
          const sv = IV.yazarRozet(i.kisi);
          const benim = me && ayni(i.kisi, me);
          const basvurdu = me && i.basvuranlar.some(b => ayni(b, me));
          let aksiyon = "";
          if (benim) {
            aksiyon = '<button type="button" class="ikincil" data-durum="' + i.id + '">' + (i.acik ? "İlanı kapat" : "Yeniden aç") + "</button>" +
              '<button type="button" class="ikincil" data-ilan-sil="' + i.id + '">🗑️ Sil</button>';
          } else if (i.acik) {
            aksiyon = '<button type="button" class="' + (basvurdu ? "ikincil" : "") + '" data-basvur="' + i.id + '">' +
              (basvurdu ? "✓ Başvurdun (geri çek)" : "🙋 Başvur") + "</button>";
          } else {
            aksiyon = '<span class="puan-bilgi">Bu ilan kapandı.</span>';
          }
          const sayi = '<span class="puan-bilgi">' + i.basvuranlar.length + " başvuru</span>";
          const liste2 = benim && i.basvuranlar.length
            ? '<p class="basvuranlar">Başvuranlar: ' + i.basvuranlar.map(IV.temiz).join(", ") + "</p>" : "";
          return '<div class="ilan' + (i.acik ? "" : " kapali") + '">' +
            "<h4>🔎 " + IV.temiz(i.rol) + " aranıyor</h4>" +
            '<p class="studyo">' + IV.temiz(i.kisi) +
            (sv ? ' <img class="g-rozet" src="' + IV.rozetUrl(sv, true) + '" alt="" title="' + IV.temiz(sv.ad) + '">' : "") +
            " · " + new Date(i.zaman).toLocaleDateString("tr-TR") + "</p>" +
            "<p>" + IV.temiz(i.metin) + "</p>" + liste2 +
            '<div class="ilan-aksiyon">' + aksiyon + sayi + "</div></div>";
        }).join("")
      : '<div class="bos-mesaj">Bu filtreye uyan ilan yok. İlk ilanı sen ver.</div>';
  }

  ilanFormu.addEventListener("submit", e => {
    e.preventDefault();
    if (!IV.hizSiniri("ilan", 5000)) { uyari("Biraz yavaş", "Yeni bir ilan için birkaç saniye bekle."); return; }
    const liste = ilanGetir();
    const id = "i" + Date.now();
    liste.unshift({
      id,
      kisi: kullanici() || ilanFormu.kisi.value.trim(),
      rol: ilanFormu.rol.value.trim(),
      metin: ilanFormu.metin.value.trim(),
      zaman: Date.now(), acik: true, basvuranlar: []
    });
    IV.yaz(ILAN, liste);
    IV.xpKazan("ilan", id);
    ilanFormu.reset();
    adAlani(ilanFormu);
    ilanCiz();
  });

  ilanListesi.addEventListener("click", e => {
    const liste = ilanGetir();
    const me = kullanici();

    const bas = e.target.closest("[data-basvur]");
    if (bas) {
      if (!me) { uyari("Giriş gerekli", "Başvurmak için giriş yapmalısın."); return; }
      const i = liste.find(x => x.id === bas.dataset.basvur);
      if (!i) return;
      const k = i.basvuranlar.findIndex(b => ayni(b, me));
      if (k >= 0) i.basvuranlar.splice(k, 1);
      else {
        i.basvuranlar.push(me);
        IV.bildirimEkle(i.kisi, me + " “" + i.rol + "” ilanına başvurdu.");
      }
      IV.yaz(ILAN, liste);
      ilanCiz();
      return;
    }

    const durum = e.target.closest("[data-durum]");
    if (durum) {
      const i = liste.find(x => x.id === durum.dataset.durum);
      if (!i || !me || !ayni(i.kisi, me)) return;
      i.acik = !i.acik;
      IV.yaz(ILAN, liste);
      ilanCiz();
      return;
    }

    const sil = e.target.closest("[data-ilan-sil]");
    if (sil) {
      const i = liste.find(x => x.id === sil.dataset.ilanSil);
      if (!i || !me || !ayni(i.kisi, me)) return;
      if (!confirm("Bu ilanı silmek istediğine emin misin?")) return;
      IV.yaz(ILAN, liste.filter(x => x.id !== i.id));
      ilanCiz();
    }
  });
  rolFiltre.addEventListener("change", ilanCiz);
  sadeceAcik.addEventListener("change", ilanCiz);

  window.addEventListener("storage", e => {
    if (e.key === SOHBET) sohbetCiz();
    if (e.key === ILAN) ilanCiz();
  });
  document.addEventListener("oturumDegisti", () => { adAlani(sohbetFormu); adAlani(ilanFormu); ilanCiz(); });

  adAlani(sohbetFormu);
  adAlani(ilanFormu);
  sohbetFormu.metin.placeholder = "# genel kanalına yaz...";
  sohbetCiz();
  ilanCiz();
})();
