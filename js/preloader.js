(function () {
    "use strict";

    var root = document.documentElement;
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    var mark = preloader.querySelector(".preloader__mark");
    var amarus = preloader.querySelector(".preloader__word--amarus");
    var freire = preloader.querySelector(".preloader__word--freire");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var loaded = false;
    var entranceDone = false;
    var finaleStarted = false;

    function reveal() {
        root.classList.remove("is-preloading");
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        window.dispatchEvent(new Event("preloader:done"));
    }

    // No GSAP available (CDN blocked/offline) — never leave the
    // screen stuck up over the site.
    if (typeof gsap === "undefined" || !mark || !amarus || !freire) {
        reveal();
        return;
    }

    function coverScale() {
        // Just enough scale for the mark's diagonal to clear the viewport's
        // diagonal — a fixed large multiplier (e.g. 26x) forces the browser
        // to blow up the raster far past what's ever visible, which is what
        // made the finale feel heavy.
        var rect = mark.getBoundingClientRect();
        var markSize = Math.max(rect.width, rect.height) || 170;
        var viewportDiag = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
        return Math.min(Math.max((viewportDiag / markSize) * 1.2, 8), 20);
    }

    function finale() {
        if (finaleStarted) return;
        finaleStarted = true;

        if (reduceMotion) {
            gsap.to(preloader, { autoAlpha: 0, duration: 0.3, ease: "power1.out", onComplete: reveal });
            return;
        }

        gsap.timeline({ onComplete: reveal })
            .to([amarus, freire], { opacity: 0, duration: 0.25, ease: "power1.out" })
            .to(mark, { scale: coverScale(), duration: 0.6, ease: "power3.in" }, "<")
            .to(preloader, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, "-=0.3");
    }

    function maybeFinale() {
        if (loaded && entranceDone) finale();
    }

    function playEntrance() {
        if (reduceMotion) {
            gsap.to(preloader, { autoAlpha: 1, duration: 0.01 });
            gsap.to([mark, amarus, freire], {
                opacity: 1, duration: 0.4, ease: "power1.out",
                onComplete: function () { entranceDone = true; maybeFinale(); }
            });
            return;
        }

        gsap.set(mark, { xPercent: 140, opacity: 0 });
        gsap.set([amarus, freire], { xPercent: 110, opacity: 0 });

        gsap.timeline({ onComplete: function () { entranceDone = true; maybeFinale(); } })
            .to(mark, { xPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
            .to(amarus, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.25")
            .to(freire, { xPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3");
    }

    playEntrance();

    if (document.readyState === "complete") {
        loaded = true;
        maybeFinale();
    } else {
        window.addEventListener("load", function () {
            loaded = true;
            maybeFinale();
        }, { once: true });
        // Safety net: don't hold the site hostage if "load" never fires
        // (slow third-party asset, offline resource, etc.).
        setTimeout(function () {
            loaded = true;
            entranceDone = true;
            maybeFinale();
        }, 6000);
    }
})();
