(function () {
    "use strict";

    var section = document.getElementById("offer");
    if (!section) return;

    var rows = Array.prototype.slice.call(section.querySelectorAll("[data-offer-row]"));
    var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function setActive(index) {
        rows.forEach(function (row, i) {
            var isActive = i === index;
            row.classList.toggle("is-active", isActive);
            row.querySelector(".offer__trigger").setAttribute("aria-expanded", String(isActive));
        });
    }

    rows.forEach(function (row, i) {
        var trigger = row.querySelector(".offer__trigger");

        if (hoverCapable) {
            row.addEventListener("mouseenter", function () { setActive(i); });
            row.addEventListener("mouseleave", function () { setActive(-1); });
            trigger.addEventListener("focus", function () { setActive(i); });
        } else {
            trigger.addEventListener("click", function () {
                var willOpen = !row.classList.contains("is-active");
                setActive(willOpen ? i : -1);
            });
        }
    });

    // keyboard users on hover-capable devices: focus alone already reveals
    // the panel (see the `focus` listener above), so Tab-ing through the
    // rows works without a mouse. Moving focus out of the section closes
    // whichever row is open.
    if (hoverCapable) {
        section.addEventListener("focusout", function (e) {
            if (!section.contains(e.relatedTarget)) setActive(-1);
        });
    }
})();
