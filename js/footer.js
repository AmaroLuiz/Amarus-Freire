(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var footer = document.getElementById("contato");
    if (!footer) return;

    var targets = footer.querySelectorAll("[data-reveal]");

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
    }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

    targets.forEach(function (el) { io.observe(el); });
})();
