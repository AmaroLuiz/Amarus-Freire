(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var section = document.getElementById("depoimentos");
    if (!section || reduceMotion) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    var viewport = section.querySelector("[data-testimonials-viewport]");
    var track = section.querySelector("[data-testimonials-track]");
    if (!viewport || !track) return;

    // real horizontal distance still left to travel — never a guessed
    // pixel value. Re-read on every ScrollTrigger.refresh() (resize,
    // orientation change, fonts loading, content changes, ...).
    function maxX() {
        return Math.max(track.scrollWidth - viewport.clientWidth, 0);
    }

    // clearance below the floating nav pill — pinning at literal
    // "top top" would slam the heading flush against the viewport's
    // top edge, underneath the nav, instead of settling into a clean,
    // fully-visible resting spot. Custom properties don't resolve to
    // px through getComputedStyle (they stay the raw "clamp(...)"
    // string), so this mirrors --testimonials-top's clamp() in JS
    // directly — keep the two in sync if either changes.
    function navOffset() {
        return Math.min(Math.max(window.innerWidth * 0.11, 90), 132);
    }

    var mm = gsap.matchMedia();

    // Only pin/scroll-jack on desktop-sized viewports (same breakpoint
    // CSS uses to switch the track from a column to a row). Below it,
    // testimonials.css keeps a plain, unpinned vertical column.
    mm.add("(min-width: 861px)", function () {
        gsap.to(track, {
            x: function () { return -maxX(); },
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: function () { return "top top+=" + navOffset(); },
                end: function () { return "+=" + maxX(); },
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        // gsap.matchMedia() auto-reverts this tween/ScrollTrigger (and
        // the pin/spacer it created) once the query stops matching —
        // no manual cleanup needed.
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
})();
