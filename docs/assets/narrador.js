/* Narrador: «Resumen para escuchar». Elige voz y velocidad, y recuerda la voz en este navegador. */
(function () {
  "use strict";
  var script = document.currentScript;
  var base = script ? script.src.replace(/narrador\.js.*$/, "") : "assets/";
  var CLAVE = "narrador.voz";
  /* Nombre de cada voz y de dónde viene (las páginas ya publicadas solo traen «Mujer», «Hombre»…): se muestra también el crédito de la elegida.
     Los hablantes de Sharvard no tienen nombre público: se usa el del conjunto de datos. */
  var NOMBRES = { mujer: "Sharvard · mujer (Piper)", hombre: "Sharvard · hombre (Piper)", hombre2: "Davefx · hombre (Piper)", gabriel: "Gabriel (TTSMaker)" };
  var CREDITOS = {
    mujer: "Voz Sharvard (hablante femenina), de la Universidad de Edimburgo, licencia CC BY 3.0, con el programa Piper.",
    hombre: "Voz Sharvard (hablante masculino), de la Universidad de Edimburgo, licencia CC BY 3.0, con el programa Piper.",
    hombre2: "Voz Davefx, de un conjunto abierto (CC0), con el programa Piper.",
    gabriel: "Voz Gabriel (República Dominicana), generada con TTSMaker."
  };

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento: no pasa nada */ } }

  function montar(el) {
    if (el.dataset.listo) return;
    el.dataset.listo = "1";
    var voces = el.dataset.voces.split(",").map(function (s) { var p = s.split(":"); return { id: p[0], nombre: NOMBRES[p[0]] || p[1] }; });
    var slug = el.dataset.slug;
    var actual = leer();
    if (!voces.some(function (v) { return v.id === actual; })) actual = voces[0].id;

    var cab = document.createElement("div");
    cab.className = "narrador-cab";
    cab.innerHTML = '<span class="narrador-icono" aria-hidden="true">&#127911;</span><strong>' + (el.dataset.titulo || "Resumen para escuchar") + "</strong>";
    var audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    var fila = document.createElement("div");
    fila.className = "narrador-ajustes";

    var descarga = document.createElement("a");
    descarga.className = "narrador-descarga";
    descarga.textContent = "Descargar MP3";
    var selVoz = document.createElement("select");
    selVoz.setAttribute("aria-label", "Voz");
    voces.forEach(function (v) { var o = document.createElement("option"); o.value = v.id; o.textContent = v.nombre; selVoz.appendChild(o); });
    selVoz.value = actual;
    var selVel = document.createElement("select");
    selVel.setAttribute("aria-label", "Velocidad");
    [0.75, 1, 1.25, 1.5].forEach(function (x) { var o = document.createElement("option"); o.value = x; o.textContent = x + "×"; selVel.appendChild(o); });
    selVel.value = "1";

    var credito = document.createElement("small");
    credito.className = "narrador-credito";
    function cargar(conservar) {
      credito.textContent = CREDITOS[selVoz.value] || "";
      var t = conservar ? audio.currentTime : 0, sonaba = conservar && !audio.paused;
      audio.src = base + "audio/" + slug + "-" + selVoz.value + ".mp3";
      descarga.href = audio.src;
      descarga.setAttribute("download", slug + "-" + selVoz.value + ".mp3");
      audio.playbackRate = parseFloat(selVel.value);
      if (conservar) audio.addEventListener("loadedmetadata", function f() {
        audio.removeEventListener("loadedmetadata", f);
        audio.currentTime = t; audio.playbackRate = parseFloat(selVel.value);
        if (sonaba) audio.play();
      });
    }
    selVoz.addEventListener("change", function () { guardar(selVoz.value); cargar(true); });
    selVel.addEventListener("change", function () { audio.playbackRate = parseFloat(selVel.value); });
    audio.addEventListener("play", function () { audio.playbackRate = parseFloat(selVel.value); });

    var l1 = document.createElement("label"); l1.textContent = "Voz "; l1.appendChild(selVoz);
    var l2 = document.createElement("label"); l2.textContent = "Velocidad "; l2.appendChild(selVel);
    fila.appendChild(l1); fila.appendChild(l2); fila.appendChild(descarga);
    el.appendChild(cab); el.appendChild(audio); el.appendChild(fila); el.appendChild(credito);
    cargar(false);
  }

  function iniciar() { Array.prototype.forEach.call(document.querySelectorAll(".narrador"), montar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(iniciar);
})();
