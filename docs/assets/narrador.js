/* Narrador: «Resumen para escuchar». Elige voz y velocidad, y recuerda la voz en este navegador. */
(function () {
  "use strict";
  var script = document.currentScript;
  var base = script ? script.src.replace(/narrador\.js.*$/, "") : "assets/";
  var CLAVE = "narrador.voz";

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento: no pasa nada */ } }

  function montar(el) {
    if (el.dataset.listo) return;
    el.dataset.listo = "1";
    var voces = el.dataset.voces.split(",").map(function (s) { var p = s.split(":"); return { id: p[0], nombre: p[1] }; });
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

    var selVoz = document.createElement("select");
    selVoz.setAttribute("aria-label", "Voz");
    voces.forEach(function (v) { var o = document.createElement("option"); o.value = v.id; o.textContent = v.nombre; selVoz.appendChild(o); });
    selVoz.value = actual;
    var selVel = document.createElement("select");
    selVel.setAttribute("aria-label", "Velocidad");
    [0.75, 1, 1.25, 1.5].forEach(function (x) { var o = document.createElement("option"); o.value = x; o.textContent = x + "×"; selVel.appendChild(o); });
    selVel.value = "1";

    function cargar(conservar) {
      var t = conservar ? audio.currentTime : 0, sonaba = conservar && !audio.paused;
      audio.src = base + "audio/" + slug + "-" + selVoz.value + ".mp3";
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
    fila.appendChild(l1); fila.appendChild(l2);
    el.appendChild(cab); el.appendChild(audio); el.appendChild(fila);
    cargar(false);
  }

  function iniciar() { Array.prototype.forEach.call(document.querySelectorAll(".narrador"), montar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(iniciar);
})();
