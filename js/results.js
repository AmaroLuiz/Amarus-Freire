(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var section = document.getElementById("results");
    if (!section) return;

    var targets = section.querySelectorAll("[data-reveal]");

    if (reduceMotion) {
        targets.forEach(function (el) { el.classList.add("is-in"); });
        return;
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    targets.forEach(function (el) { io.observe(el); });
})();
