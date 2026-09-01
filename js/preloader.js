(function () {
    "use strict";

    var root = document.documentElement;
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    var logo = preloader.querySelector(".preloader__logo");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var started = false;

    function reveal() {
        root.classList.remove("is-preloading");
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }

    // No GSAP available (CDN blocked/offline) — never leave the black
    // screen stuck up over the site.
    if (typeof gsap === "undefined" || !logo) {
        reveal();
        return;
    }

    function play() {
        if (started) return;
        started = true;

        if (reduceMotion) {
            gsap.to(preloader, { autoAlpha: 0, duration: 0.3, ease: "power1.out", onComplete: reveal });
            return;
        }

        gsap.timeline({ onComplete: reveal })
            .to({}, { duration: 0.3 })                                              // beat: pequena pausa / expectativa
            .to(logo, { rotation: 360, scale: 1.15, duration: 0.85, ease: "power3.inOut" }) // rotação + aumento progressivo
            .to(logo, { scale: 24, duration: 0.55, ease: "power4.in" }, "-=0.1")     // aceleração final / impacto
            .to(preloader, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, "-=0.45"); // fundo some junto, revela a hero
    }

    if (document.readyState === "complete") {
        play();
    } else {
        window.addEventListener("load", play, { once: true });
        // Safety net: don't hold the site hostage if "load" never fires
        // (slow third-party asset, offline resource, etc.).
        setTimeout(play, 4000);
    }
})();
