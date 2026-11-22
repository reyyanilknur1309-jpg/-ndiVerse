/* ================= IndieVerse - Görsel Efektler (v3) ================= */
(function () {

  /* 1) Mobil menü butonu */
  const header = document.querySelector("header");
  const nav = header && header.querySelector("nav");
  if (header && nav) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Menüyü aç/kapat");
    btn.textContent = "☰";
    header.insertBefore(btn, nav);
    btn.addEventListener("click", () => {
      const acik = nav.classList.toggle("acik");
      btn.textContent = acik ? "✕" : "☰";
    });
  }

  /* 2) Kaydırınca bölümler yumuşakça belirsin */
  const hedefler = document.querySelectorAll("main > section:not(.rol-kapsayici), .rol-kart, .banner");
  if ("IntersectionObserver" in window) {
    const gozlemci = new IntersectionObserver(kayitlar => {
      kayitlar.forEach(k => {
        if (k.isIntersecting) {
          k.target.classList.remove("gizli");
          k.target.classList.add("gorundu");
          gozlemci.unobserve(k.target);
        }
      });
    }, { threshold: 0.08 });
    hedefler.forEach(h => { h.classList.add("gizli"); gozlemci.observe(h); });
  }

  /* 3) Arka planda yavaşça yükselen, yanıp sönen yıldızlar */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "yildizKatman";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, yildizlar = [];

  function boyutla() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const adet = Math.min(90, Math.floor(w * h / 18000));
    yildizlar = Array.from({ length: adet }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      hiz: Math.random() * 0.25 + 0.05,
      faz: Math.random() * Math.PI * 2
    }));
  }

  function ciz(t) {
    ctx.clearRect(0, 0, w, h);
    yildizlar.forEach(s => {
      s.y -= s.hiz;
      if (s.y < -5) { s.y = h + 5; s.x = Math.random() * w; }
      const a = 0.35 + 0.35 * Math.sin(t / 900 + s.faz);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190, 225, 255, " + a + ")";
      ctx.fill();
    });
    requestAnimationFrame(ciz);
  }

  boyutla();
  window.addEventListener("resize", boyutla);
  requestAnimationFrame(ciz);
})();

/* 4) Logo, sekme simgesi ve eksik menü bağlantıları */
(function () {
  const h1 = document.querySelector("header h1");
  if (h1 && !document.querySelector("header .logo")) {
    const a = document.createElement("a");
    a.href = "index.html";
    a.className = "marka";
    a.setAttribute("aria-label", "IndieVerse ana sayfa");
    const img = document.createElement("img");
    img.src = "img/logo.png";
    img.alt = "";
    img.className = "logo";
    h1.parentNode.insertBefore(a, h1);
    a.appendChild(img);
    a.appendChild(h1);
  }

  if (!document.querySelector('link[rel~="icon"]')) {
    const l = document.createElement("link");
    l.rel = "icon";
    l.href = "img/logo.png";
    document.head.appendChild(l);
  }
})();

/* 5) Kaydırma çubuğu, 3B kart eğilme, dalga, imleç ışığı, yukarı çık */
(function () {
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dokunmatik = window.matchMedia("(hover: none)").matches;

  const cubuk = document.createElement("div");
  cubuk.id = "kaydirmaCubugu";
  document.body.appendChild(cubuk);

  const yukari = document.createElement("button");
  yukari.id = "yukari";
  yukari.type = "button";
  yukari.setAttribute("aria-label", "Yukarı çık");
  yukari.textContent = "↑";
  document.body.appendChild(yukari);
  yukari.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: azHareket ? "auto" : "smooth" }));

  const menu = document.querySelector("header");
  let bekle = false;
  window.addEventListener("scroll", () => {
    if (bekle) return;
    bekle = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const toplam = document.documentElement.scrollHeight - window.innerHeight;
      cubuk.style.width = (toplam > 0 ? (y / toplam) * 100 : 0) + "%";
      if (menu) menu.classList.toggle("kaydi", y > 30);
      yukari.classList.toggle("goster", y > 400);
      bekle = false;
    });
  }, { passive: true });

  if (azHareket) return;

  document.addEventListener("click", e => {
    const b = e.target.closest("button, .buton, .rol-buton");
    if (!b || b.closest("#periKapsayici")) return;
    const st = getComputedStyle(b);
    if (st.position === "static") b.style.position = "relative";
    b.style.overflow = "hidden";
    const r = b.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const s = document.createElement("span");
    s.className = "dalga";
    s.style.width = s.style.height = d + "px";
    s.style.left = (e.clientX - r.left - d / 2) + "px";
    s.style.top = (e.clientY - r.top - d / 2) + "px";
    b.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });

  if (dokunmatik) return;

  const KARTLAR = ".oyun-kart, .ozellik, .rol-kart, .seviye-kart";
  let aktif = null;
  document.addEventListener("pointermove", e => {
    const k = e.target.closest ? e.target.closest(KARTLAR) : null;
    if (aktif && aktif !== k) { aktif.style.transform = ""; aktif = null; }
    if (!k) return;
    aktif = k;
    const r = k.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    k.style.transform = "perspective(800px) rotateX(" + (-y * 5).toFixed(2) +
      "deg) rotateY(" + (x * 5).toFixed(2) + "deg) translateY(-6px)";
  });
  document.addEventListener("mouseout", e => {
    if (!e.relatedTarget && aktif) { aktif.style.transform = ""; aktif = null; }
  });

  const isik = document.createElement("div");
  isik.id = "imlecIsik";
  document.body.appendChild(isik);
  document.addEventListener("pointermove", e => {
    isik.style.opacity = 1;
    isik.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
  });
  document.addEventListener("mouseleave", () => { isik.style.opacity = 0; });
})();

/* 6) Evrim ve seviye atlama kutlaması */
(function () {
  if (typeof IV === "undefined") return;

  const SON = "indieverse_son_seviye";
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let acik = false;

  function konfeti() {
    if (azHareket) return;
    const c = document.createElement("canvas");
    c.id = "konfetiKatman";
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext("2d");
    const renkler = ["#4cc9ff", "#7b6bff", "#1d7bff", "#ffffff", "#7dffb0", "#ffd36b"];
    const parca = Array.from({ length: 160 }, () => {
      const aci = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
      const hiz = 7 + Math.random() * 10;
      return {
        x: c.width / 2, y: c.height * 0.45,
        vx: Math.cos(aci) * hiz, vy: Math.sin(aci) * hiz,
        s: 6 + Math.random() * 7,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: renkler[Math.floor(Math.random() * renkler.length)]
      };
    });
    let kare = 0;
    (function ciz() {
      ctx.clearRect(0, 0, c.width, c.height);
      parca.forEach(p => {
        p.vy += 0.28; p.vx *= 0.992;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = kare > 170 ? Math.max(0, 1 - (kare - 170) / 60) : 1;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      kare++;
      if (kare < 230) requestAnimationFrame(ciz); else c.remove();
    })();
  }

  function kutla(eski, yeni) {
    acik = true;
    const katman = document.createElement("div");
    katman.id = "evrimKatman";
    katman.setAttribute("role", "dialog");
    katman.setAttribute("aria-modal", "true");
    katman.setAttribute("aria-label", "Evrim geçirdin");
    katman.innerHTML =
      '<div class="evrim-kutu">' +
        '<p class="evrim-baslik">🎉 Evrim geçirdin!</p>' +
        '<div class="evrim-sahne">' +
          '<span class="evrim-halka"></span><span class="evrim-halka"></span>' +
          '<img class="evrim-eski" src="' + IV.rozetUrl(eski) + '" alt="">' +
          '<img class="evrim-yeni" src="' + IV.rozetUrl(yeni) + '" alt="' + IV.temiz(yeni.ad) + '">' +
        '</div>' +
        '<p class="evrim-gecis">' + IV.temiz(eski.ad) + ' → <b>' + IV.temiz(yeni.ad) + '</b></p>' +
        '<p class="seviye-slogan">“' + IV.temiz(yeni.slogan) + '”</p>' +
        '<div class="etiketler">' +
          yeni.ozellikler.map(o => '<span class="etiket durum">' + IV.temiz(o) + '</span>').join("") +
        '</div>' +
        '<button type="button" class="evrim-kapat">Devam et</button>' +
      '</div>';
    document.body.appendChild(katman);
    requestAnimationFrame(() => katman.classList.add("goster"));
    setTimeout(konfeti, azHareket ? 0 : 900);
    document.dispatchEvent(new CustomEvent("evrimGecirdi", { detail: { eski, yeni } }));

    function kapat() {
      document.removeEventListener("keydown", tus);
      katman.classList.remove("goster");
      setTimeout(() => { katman.remove(); acik = false; }, 400);
    }
    function tus(e) { if (e.key === "Escape") kapat(); }
    document.addEventListener("keydown", tus);
    katman.addEventListener("click", e => {
      if (e.target === katman || e.target.closest(".evrim-kapat")) kapat();
    });
    const dugme = katman.querySelector(".evrim-kapat");
    if (dugme) dugme.focus();
  }

  function rozetleriYenile(sv) {
    const nav = document.querySelector(".nav-rozet");
    if (nav) {
      nav.src = IV.rozetUrl(sv, true);
      nav.alt = sv.ad;
      nav.classList.remove("evrim-pop");
      void nav.offsetWidth;
      nav.classList.add("evrim-pop");
    }
    const buyuk = document.querySelector(".rozet-buyuk");
    if (buyuk) {
      buyuk.src = IV.rozetUrl(sv);
      buyuk.alt = sv.ad;
      buyuk.classList.remove("evrim-pop");
      void buyuk.offsetWidth;
      buyuk.classList.add("evrim-pop");
    }
  }

  function kontrol() {
    if (acik) return;
    const kul = IV.oturum();
    if (!kul || !IV.hesapBul(kul)) return;
    const { i, sv } = IV.seviyeBul(IV.xpToplam(kul), kul);
    const kayit = IV.oku(SON, {});
    const anahtar = IV.kucuk(kul);
    const onceki = kayit[anahtar];

    if (onceki === undefined || i < onceki) {
      kayit[anahtar] = i;
      IV.yaz(SON, kayit);
      return;
    }
    if (i > onceki) {
      kayit[anahtar] = i;
      IV.yaz(SON, kayit);
      rozetleriYenile(sv);
      kutla(IV.seviyeler[onceki], sv);
    }
  }

  window.addEventListener("load", () => setTimeout(kontrol, 600));
  document.addEventListener("xpDegisti", () => setTimeout(kontrol, 250));
  document.addEventListener("favoriDegisti", () => setTimeout(kontrol, 250));
  window.addEventListener("storage", () => setTimeout(kontrol, 300));

  window.evrimTest = function () {
    const kul = IV.oturum();
    const puan = kul ? IV.xpToplam(kul) : 0;
    const { i } = IV.seviyeBul(puan, kul);
    const sonraki = Math.min(i + 1, IV.seviyeler.length - 1);
    acik = false;
    kutla(IV.seviyeler[i], IV.seviyeler[sonraki]);
  };
})();

/* 7) Menüde gelişmiş XP çubuğu, çarpan rozeti, günlük giriş ve bildirim zili */
(function () {
  if (typeof IV === "undefined" || !IV.oturum) return;

  const ul = document.querySelector("header nav ul");
  const link = document.querySelector('header nav a[href="uye.html"], header nav a.nav-profil');
  if (!ul || !link) return;
  let zilLi = null;
  const profilSayfasi = /profil\.html$/i.test(location.pathname);

  function ciz() {
    const kul = IV.oturum();
    if (!kul || !IV.hesapBul(kul)) {
      link.classList.remove("nav-profil");
      if (profilSayfasi) link.classList.remove("aktif");
      link.href = "uye.html";
      link.textContent = "Üye Ol";
      link.removeAttribute("title");
      if (zilLi) { zilLi.remove(); zilLi = null; }
      return;
    }
    const puan = IV.xpToplam(kul);
    const o = IV.seviyeOzet(puan, kul);
    const c = o.carpan;
    link.classList.add("nav-profil");
    if (profilSayfasi) link.classList.add("aktif");
    link.href = "profil.html";
    link.title = "Sv. " + o.seviyeNo + " · " + o.sv.ad + " " + o.kademeRoma + " · " + puan + " XP" +
      (c.toplam > 1 ? " (×" + c.toplam + " çarpan)" : "") + " · profilini aç";
    link.style.setProperty("--r", o.sv.renk);
    link.innerHTML =
      '<img class="nav-rozet" src="' + IV.rozetUrl(o.sv, true) + '" alt="' + IV.temiz(o.sv.ad) + '">' +
      '<span class="nav-metin"><b>' + IV.temiz(kul) +
        (c.toplam > 1 ? ' <em class="nav-carpan">×' + c.toplam + '</em>' : '') +
      '</b><small>Sv.' + o.seviyeNo + ' · ' + IV.temiz(o.sv.ad) + ' ' + o.kademeRoma + '</small></span>' +
      '<span class="nav-xp"><i style="width:' + o.yuzde + '%"></i></span>';

    const yeni = IV.bildirimler(kul).filter(x => !x.o).length;
    if (!zilLi) { zilLi = document.createElement("li"); ul.appendChild(zilLi); }
    zilLi.innerHTML = '<a class="nav-zil" href="topluluk.html#bildirimler" aria-label="Bildirimler, ' + yeni + ' yeni">🔔' +
      (yeni ? '<span class="zil-sayi">' + yeni + '</span>' : "") + "</a>";
  }

  function girisVeCiz() {
    const kul = IV.oturum();
    if (kul) IV.gunlukGiris(kul);
    ciz();
  }

  document.addEventListener("oturumDegisti", girisVeCiz);
  document.addEventListener("bildirimDegisti", ciz);
  document.addEventListener("xpDegisti", () => {
    ciz();
    link.classList.remove("xp-pulse");
    void link.offsetWidth;
    link.classList.add("xp-pulse");
  });
  window.addEventListener("storage", ciz);

  const kaldir = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function (k) {
    kaldir.call(this, k);
    if (k === "indieverse_oturum") document.dispatchEvent(new Event("oturumDegisti"));
  };

  girisVeCiz();
})();
