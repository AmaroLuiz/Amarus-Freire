(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var section = document.getElementById("depoimentos");
    if (!section || reduceMotion) return;

    var viewport = section.querySelector("[data-testimonials-viewport]");
    var track = section.querySelector("[data-testimonials-track]");
    if (!viewport || !track) return;

    // real horizontal distance still left to travel — never a guessed
    // pixel value. Re-read on every ScrollTrigger.refresh() (resize,
    // orientation change, fonts loading, content changes, ...).
    function maxX() {
        return Math.max(track.scrollWidth - viewport.clientWidth, 0);
    }

    function build() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);
        var mm = gsap.matchMedia();

        // Infinite auto-scrolling carousel below the desktop breakpoint.
        // Clone the card set once so the track is exactly double width,
        // then loop x from 0 to -50% — since the clone is identical to
        // the original, the wrap-around is invisible.
        mm.add("(max-width: 860px)", function () {
            var originals = Array.prototype.slice.call(track.children);
            originals.forEach(function (card) {
                var clone = card.cloneNode(true);
                clone.setAttribute("aria-hidden", "true");
                track.appendChild(clone);
            });

            var loopWidth = track.scrollWidth / 2;
            gsap.set(track, { x: 0 });

            // ~70px/sec — fast enough to read as motion, slow enough to
            // actually read a card's text as it drifts past. Runs
            // continuously: the carousel isn't draggable (viewport is
            // overflow:hidden), so there's no touch-pause here — the
            // user's scroll gestures over the section are unrelated and
            // shouldn't freeze the marquee.
            var tween = gsap.to(track, {
                x: -loopWidth,
                duration: loopWidth / 70,
                ease: "none",
                repeat: -1,
            });

            // gsap.matchMedia() calls this automatically once the query
            // stops matching, so the clones/tween never leak into desktop.
            return function () {
                tween.kill();
                Array.prototype.slice.call(track.children, originals.length).forEach(function (el) {
                    el.remove();
                });
                gsap.set(track, { clearProps: "x" });
            };
        });

        // Pin/scroll-jack on desktop-sized viewports (same breakpoint CSS
        // uses to switch the track from a row-carousel to the pinned row).
        mm.add("(min-width: 861px)", function () {
            gsap.to(track, {
                x: function () { return -maxX(); },
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    // Pins (and the horizontal scrub starts) only once the
                    // section reaches the middle of the screen, not as soon
                    // as it touches the top — on shorter viewports (e.g.
                    // 1280x720), the section's own height pinned flush to
                    // the top overshot the bottom edge, clipping the cards.
                    // Centered, it always has breathing room on both sides.
                    start: "center center",
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

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
        }
    }

    // Same reasoning as process.js: this section is below the fold,
    // so deferring the GSAP/ScrollTrigger pin setup to an idle moment
    // costs nothing visible while keeping it off the critical
    // rendering path (lower Total Blocking Time).
    function whenIdle(fn) {
        if ("requestIdleCallback" in window) {
            requestIdleCallback(fn, { timeout: 2000 });
        } else {
            setTimeout(fn, 200);
        }
    }

    if (document.readyState === "complete") {
        whenIdle(build);
    } else {
        window.addEventListener("load", function () { whenIdle(build); });
    }
})();
