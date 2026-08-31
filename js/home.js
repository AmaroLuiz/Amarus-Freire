(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var section = document.getElementById("solutions");

    /* =============================================================
       1) PARTICLE / CONSTELLATION BACKGROUND
       ============================================================= */
    (function particles() {
        var canvas = document.getElementById("particles");
        var ctx = canvas.getContext("2d");
        var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
        var points = [];
        var inView = true;
        var raf = null;

        function resize() {
            w = section.offsetWidth;
            h = section.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            var count = Math.round((w * h) / 34000);
            count = Math.max(24, Math.min(count, 90));
            points = [];
            for (var i = 0; i < count; i++) {
                points.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.12,
                    vy: (Math.random() - 0.5) * 0.12,
                    r: Math.random() * 1.2 + 0.4
                });
            }
        }

        function step() {
            if (!inView) { raf = null; return; }
            ctx.clearRect(0, 0, w, h);
            var linkDist = 130;

            for (var i = 0; i < points.length; i++) {
                var p = points[i];
                if (!reduceMotion) {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                }
            }
            for (var i = 0; i < points.length; i++) {
                for (var j = i + 1; j < points.length; j++) {
                    var a = points[i], b = points[j];
                    var dx = a.x - b.x, dy = a.y - b.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < linkDist) {
                        ctx.strokeStyle = "rgba(21,94,231," + (0.14 * (1 - dist / linkDist)) + ")";
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            ctx.fillStyle = "rgba(170,178,192,0.55)";
            for (var i = 0; i < points.length; i++) {
                var p = points[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (!reduceMotion) { raf = requestAnimationFrame(step); }
        }

        resize();
        step();
        window.addEventListener("resize", debounce(function () { resize(); if (!raf) step(); }, 150));

        var io = new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            if (inView && !raf && !reduceMotion) step();
            if (inView && reduceMotion) step(); // draw one static frame
        }, { threshold: 0 });
        io.observe(section);
    })();

    /* =============================================================
       2) FLOWING LINE — built from live anchor points, scroll-drawn
       ============================================================= */
    var flowCore, flowHalo, flowDot, flowLen = 0;
    (function flowLine() {
        var svg = document.getElementById("flow");
        flowCore = document.getElementById("flow-path");
        flowHalo = document.getElementById("flow-halo");
        flowDot = document.getElementById("flow-dot");

        // Hand-placed waypoints (start → weave near/through each block → end),
        // expressed relative to real element positions, so the path always
        // tracks the actual layout at any breakpoint. Fractions alternate
        // strongly left/right within each block to echo the sinuous,
        // "river" character of the original hand-drawn wireframe — the
        // line dips into the rectangles themselves, not just around them.
        function waypoints() {
            var sRect = section.getBoundingClientRect();

            var swTitle = section.querySelector(".block-head h3");
            var swLg = section.querySelector(".sw-lg");
            var swMd = section.querySelector(".sw-md");
            var swWide = section.querySelector(".sw-wide");
            var mkTop = section.querySelector(".mk-top");
            var mkA = section.querySelector(".mk-a");
            var mkB = section.querySelector(".mk-b");
            var mkC = section.querySelector(".mk-c");
            var auWide = section.querySelector(".au-wide");
            var auTall = section.querySelector(".au-tall");
            var auSq = section.querySelector(".au-sq");

            function relY(el, fracInside) {
                var r = el.getBoundingClientRect();
                return (r.top - sRect.top) + r.height * fracInside;
            }
            function relX(el, fracInside) {
                var r = el.getBoundingClientRect();
                return (r.left - sRect.left) + r.width * fracInside;
            }

            var raw = [
                // start — right below the word "Software" itself
                { x: relX(swTitle, 0.1), y: relY(swTitle, 1.25) },
                // weaves across the big vertical panel
                { x: relX(swLg, 0.2), y: relY(swLg, 0.18) },
                { x: relX(swLg, 0.75), y: relY(swLg, 0.42) },
                { x: relX(swMd, 0.55), y: relY(swMd, 0.55) },
                { x: relX(swMd, 0.85), y: relY(swMd, 0.9) },
                // dips through the wide strip
                { x: relX(swWide, 0.15), y: relY(swWide, 0.3) },
                { x: relX(swWide, 0.8), y: relY(swWide, 0.75) },
                // long travel down to Marketing, curving into the top panel
                { x: relX(mkTop, 0.85), y: relY(mkTop, 0.35) },
                { x: relX(mkTop, 0.35), y: relY(mkTop, 0.85) },
                // weaves through the trio
                { x: relX(mkA, 0.75), y: relY(mkA, 0.15) },
                { x: relX(mkB, 0.3), y: relY(mkB, 0.35) },
                { x: relX(mkB, 0.8), y: relY(mkB, 0.65) },
                { x: relX(mkC, 0.35), y: relY(mkC, 0.85) },
                // long travel down to Automação
                { x: relX(auWide, 0.06), y: relY(auWide, -0.1) },
                // winds inside the wide panel, several beats
                { x: relX(auWide, 0.3), y: relY(auWide, 0.25) },
                { x: relX(auWide, 0.55), y: relY(auWide, 0.55) },
                { x: relX(auWide, 0.85), y: relY(auWide, 0.82) },
                // into the tall panel
                { x: relX(auTall, 0.25), y: relY(auTall, 0.15) },
                { x: relX(auTall, 0.7), y: relY(auTall, 0.5) },
                { x: relX(auTall, 0.3), y: relY(auTall, 0.85) },
                // closes through the square
                { x: relX(auSq, 0.7), y: relY(auSq, 0.35) },
                { x: relX(auSq, 0.4), y: relY(auSq, 0.9) }
            ];

            // Safety clamp: whatever the fractions above compute to, the
            // line must never render past the section's own box — keeps
            // it fully on-screen at any breakpoint/content height.
            var m = 8;
            var clamped = raw.map(function (p) {
                return {
                    x: Math.min(Math.max(p.x, m), Math.max(sRect.width - m, m)),
                    y: Math.min(Math.max(p.y, m), Math.max(sRect.height - m, m))
                };
            });

            // Enforce strictly increasing y. The scroll-sync reveal looks
            // up length by y-position, which only works cleanly on a path
            // that always moves forward — any backward dip (even a small
            // one, or a near-tie between two points from different grid
            // items) makes the reveal stall and then jump ahead, reading
            // as a "teleport". This guarantees smooth, continuous motion
            // regardless of how the fractions above land at any viewport.
            var MIN_STEP = 6;
            for (var i = 1; i < clamped.length; i++) {
                if (clamped[i].y <= clamped[i - 1].y + MIN_STEP) {
                    clamped[i].y = clamped[i - 1].y + MIN_STEP;
                }
            }

            return clamped;
        }

        function catmullRomToBezier(pts) {
            if (pts.length < 2) return "";
            var d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1) + " ";
            for (var i = 0; i < pts.length - 1; i++) {
                var p0 = pts[i === 0 ? 0 : i - 1];
                var p1 = pts[i];
                var p2 = pts[i + 1];
                var p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
                var c1x = p1.x + (p2.x - p0.x) / 6;
                var c1y = p1.y + (p2.y - p0.y) / 6;
                var c2x = p2.x - (p3.x - p1.x) / 6;
                var c2y = p2.y - (p3.y - p1.y) / 6;
                d += "C" + c1x.toFixed(1) + "," + c1y.toFixed(1) + " " +
                    c2x.toFixed(1) + "," + c2y.toFixed(1) + " " +
                    p2.x.toFixed(1) + "," + p2.y.toFixed(1) + " ";
            }
            return d;
        }

        function rebuild() {
            var sRect = section.getBoundingClientRect();
            svg.setAttribute("viewBox", "0 0 " + sRect.width + " " + sRect.height);
            var pts = waypoints();
            var d = catmullRomToBezier(pts);
            flowCore.setAttribute("d", d);
            flowHalo.setAttribute("d", d);
            flowLen = flowCore.getTotalLength();
            flowCore.style.strokeDasharray = flowLen;
            flowHalo.style.strokeDasharray = flowLen;

            // Sample the path into a length↔y lookup table. This is what
            // lets the reveal be driven by actual on-screen Y position
            // instead of an overall scroll fraction — so the animated tip
            // always sits at the same fixed spot in the viewport (never
            // drifts off-screen), and naturally speeds up through wiggly
            // stretches / slows through straight ones, since more path
            // length is needed to advance the same y there.
            var SAMPLE_COUNT = 180;
            samples = [];
            for (var i = 0; i <= SAMPLE_COUNT; i++) {
                var len = (flowLen * i) / SAMPLE_COUNT;
                var pt = flowCore.getPointAtLength(len);
                samples.push({ len: len, y: pt.y });
            }
            pathStartY = samples[0].y;
            pathEndY = samples[samples.length - 1].y;

            updateFlow();
        }

        // Given a target y (section-local px), find how far along the
        // path (by length) that y is first reached.
        function lengthForY(targetY) {
            if (!samples.length) return 0;
            if (targetY <= samples[0].y) return 0;
            if (targetY >= samples[samples.length - 1].y) return flowLen;
            for (var i = 1; i < samples.length; i++) {
                if (samples[i].y >= targetY) {
                    var a = samples[i - 1], b = samples[i];
                    var t = (b.y === a.y) ? 0 : (targetY - a.y) / (b.y - a.y);
                    return a.len + (b.len - a.len) * t;
                }
            }
            return flowLen;
        }

        var samples = [];
        var pathStartY = 0, pathEndY = 0;

        // The reveal tracks a fixed "reading line" partway down the
        // viewport — the drawn tip is always right there, so it can
        // never end up scrolled off the top or waiting off the bottom.
        var SYNC_FRACTION = 0.6;

        function updateFlow() {
            if (!flowLen) return;
            if (reduceMotion) {
                flowCore.style.strokeDashoffset = 0;
                flowHalo.style.strokeDashoffset = 0;
                flowDot.style.opacity = 0;
                return;
            }
            var sRect = section.getBoundingClientRect();
            var syncViewportY = window.innerHeight * SYNC_FRACTION;
            var syncSectionY = syncViewportY - sRect.top;
            var targetY = Math.min(Math.max(syncSectionY, pathStartY), pathEndY);

            var revealLen = lengthForY(targetY);
            var offset = flowLen - revealLen;
            flowCore.style.strokeDashoffset = offset;
            flowHalo.style.strokeDashoffset = offset;

            if (revealLen > 2 && revealLen < flowLen - 2) {
                var pt = flowCore.getPointAtLength(revealLen);
                flowDot.setAttribute("cx", pt.x);
                flowDot.setAttribute("cy", pt.y);
                flowDot.style.opacity = 1;
            } else {
                flowDot.style.opacity = 0;
            }
        }

        window.__flowRebuild = rebuild;
        window.__flowUpdate = updateFlow;

        // rebuild once fonts/layout have settled
        window.addEventListener("load", rebuild);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(rebuild);
        }
        setTimeout(rebuild, 50);

        var ro = new ResizeObserver(debounce(rebuild, 120));
        ro.observe(section);
    })();

    /* =============================================================
       3) SCROLL LOOP — drives line progress + subtle parallax
       ------------------------------------------------------------
       Transform ownership is split on purpose so effects never
       fight each other:
         .visual            → CSS only, controls the reveal (fade+rise)
         .visual__inner      → JS only, controls parallax (data-py)
                                composed with tilt (data-tx/data-ty)
       applyInner() is the single place that writes the final
       transform for .visual__inner, combining both offsets.
       ============================================================= */
    function applyInner(inner) {
        var px = parseFloat(inner.dataset.tx || 0);
        var py = parseFloat(inner.dataset.py || 0) + parseFloat(inner.dataset.ty || 0);
        inner.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0)";
    }

    (function scrollLoop() {
        var ticking = false;
        var inners = Array.prototype.slice.call(section.querySelectorAll(".visual__inner"));

        function frame() {
            ticking = false;
            var rect = section.getBoundingClientRect();
            var vh = window.innerHeight;

            if (window.__flowUpdate) window.__flowUpdate();

            if (!reduceMotion) {
                var centerDelta = (rect.top + rect.height / 2 - vh / 2);
                inners.forEach(function (inner, i) {
                    var speed = 0.02 + (i % 3) * 0.006;
                    inner.dataset.py = (centerDelta * speed * -1).toFixed(1);
                    applyInner(inner);
                });
            }
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(frame);
                ticking = true;
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        frame();
    })();

    /* =============================================================
       4) REVEAL ON SCROLL
       ============================================================= */
    (function reveal() {
        var targets = section.querySelectorAll(".visual, [data-reveal]");
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
        }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
        targets.forEach(function (el) { io.observe(el); });
    })();

    /* =============================================================
       5) MICRO TILT ON HOVER
       ============================================================= */
    (function tilt() {
        if (reduceMotion) return;
        var items = section.querySelectorAll("[data-tilt]");
        items.forEach(function (el) {
            var inner = el.querySelector(".visual__inner");
            el.addEventListener("pointermove", function (e) {
                var r = el.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width;
                var y = (e.clientY - r.top) / r.height;
                var max = 6;
                inner.style.transition = "none";
                inner.dataset.tx = ((x - 0.5) * max).toFixed(1);
                inner.dataset.ty = ((y - 0.5) * max).toFixed(1);
                applyInner(inner);
                el.style.setProperty("--glow-x", (x * 100).toFixed(0) + "%");
                el.style.setProperty("--glow-y", (y * 100).toFixed(0) + "%");
            });
            el.addEventListener("pointerleave", function () {
                inner.style.transition = "transform .5s cubic-bezier(.16,.8,.3,1)";
                inner.dataset.tx = 0;
                inner.dataset.ty = 0;
                applyInner(inner);
            });
        });
    })();

    /* =============================================================
       6) IMAGE VARIANT SWITCHER — 3 dots below each panel
       ============================================================= */
    (function panelSwitcher() {
        var wraps = section.querySelectorAll(".visual-wrap");
        wraps.forEach(function (wrap) {
            var panel = wrap.querySelector(".visual");
            var frames = wrap.querySelectorAll(".art-frame");
            var dots = wrap.querySelectorAll(".dot");
            var tag = wrap.querySelector(".visual__tag");
            if (!frames.length || !dots.length) return;

            dots.forEach(function (dot, idx) {
                dot.addEventListener("click", function () {
                    if (dot.classList.contains("is-active")) return;
                    frames.forEach(function (f, i) { f.classList.toggle("is-active", i === idx); });
                    dots.forEach(function (d, i) {
                        d.classList.toggle("is-active", i === idx);
                        d.setAttribute("aria-selected", i === idx ? "true" : "false");
                    });
                    if (tag && frames[idx].dataset.tag) { tag.textContent = frames[idx].dataset.tag; }
                });
            });
        });
    })();

    /* utils */
    function debounce(fn, wait) {
        var t;
        return function () {
            var args = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, args); }, wait);
        };
    }
})();