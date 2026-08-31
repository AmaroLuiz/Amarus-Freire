(function () {
    "use strict";

    /* =============================================================
       NAV MENU TOGGLE
       ============================================================= */
    (function navMenu() {
        var toggle = document.getElementById("nav-toggle");
        var menu = document.getElementById("nav-menu");
        if (!toggle || !menu) return;

        function close() {
            toggle.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            menu.classList.remove("is-open");
        }

        function open() {
            toggle.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            menu.classList.add("is-open");
        }

        toggle.addEventListener("click", function () {
            if (menu.classList.contains("is-open")) close(); else open();
        });

        document.addEventListener("click", function (e) {
            if (!menu.classList.contains("is-open")) return;
            if (menu.contains(e.target) || toggle.contains(e.target)) return;
            close();
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") close();
        });

        menu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", close);
        });

        var closeBtn = menu.querySelector("[data-nav-close]");
        if (closeBtn) closeBtn.addEventListener("click", close);
    })();
})();
