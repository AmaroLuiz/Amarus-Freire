(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var section = document.getElementById("processo");
    if (!section || reduceMotion) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    var track = section.querySelector("[data-process-track]");
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-process-card]"));
    if (!track || cards.length < 2) return;

    function stickyOffset() {
        var v = getComputedStyle(document.documentElement).getPropertyValue("--process-top");
        return parseFloat(v) || 0;
    }

    function stepDistance() {
        // one comfortable viewport-height of scroll per transition —
        // slow enough to clearly see 01 → 02 → 03 → 04, never rushed.
        return Math.max(window.innerHeight * 0.9, 520);
    }

    var mm = gsap.matchMedia();

    // px offset added per card index — once a card is covered, its
    // header (number + title) still peeks out just above the card in
    // front of it, like a fanned stack of paper, instead of vanishing
    // outright. See --process-stagger in process.css, which reserves
    // the matching space below the track.
    var STAGGER = 52;

    // All 4 cards occupy (almost) the same rectangle (.process__card
    // is absolute; inset:0 inside .process__track — see process.css),
    // offset only by that small per-index STAGGER. ScrollTrigger pins
    // the track in the viewport and scrubs each card's translateY
    // from fully below (yPercent:100) up to its resting spot
    // (yPercent:0), one after another. That vertical movement — not
    // opacity, not scale — is what physically drives the next panel
    // up and over the previous one; scale is only a barely-there
    // depth cue on the panel being covered.
    mm.add("(min-width: 861px)", function () {
        cards.forEach(function (card, i) {
            gsap.set(card, { yPercent: i === 0 ? 0 : 100, y: i * STAGGER, scale: 1 });
        });

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: track,
                start: function () { return "top top+=" + stickyOffset(); },
                end: function () { return "+=" + (cards.length - 1) * stepDistance(); },
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        for (var i = 1; i < cards.length; i++) {
            tl.to(cards[i], { yPercent: 0, ease: "none" }, i - 1);
            tl.to(cards[i - 1], { scale: 0.97, ease: "none" }, i - 1);
        }

        // gsap.matchMedia() auto-reverts this timeline/ScrollTrigger
        // (and the inline styles gsap.set() wrote) once the query
        // stops matching — no manual cleanup needed.
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
})();
