(function () {
    "use strict";

    var section = document.getElementById("faq");
    if (!section) return;

    var items = Array.prototype.slice.call(section.querySelectorAll("[data-faq-item]"));

    function setOpen(item, open) {
        item.classList.toggle("is-open", open);
        item.querySelector(".faq__question").setAttribute("aria-expanded", String(open));
    }

    items.forEach(function (item) {
        var question = item.querySelector(".faq__question");
        question.addEventListener("click", function () {
            var willOpen = !item.classList.contains("is-open");
            items.forEach(function (other) { setOpen(other, other === item && willOpen); });
        });
    });
})();
