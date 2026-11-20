// Share to story: <button class=sharebtn data-share="slug" data-title="..." data-photo="/photos/x.jpg" hidden>.
// A tap draws a 1080x1920 PNG card on a canvas (title, photo, and stars plus note right after rating) and opens the
// phone share sheet with the image (navigator.share with files), so Instagram > Story is one more tap.
// No share sheet for files (most desktops): the PNG downloads. Older iPhones: the card opens full screen to press and save.
// Everything runs in the browser. No accounts, keys or uploads. The Cooked it form (app.js) adds a button after a rating.
(function (g) {
  var W = 1080, H = 1920;
  var C = { cream: "#fbf6ea", paper: "#fffdf6", ink: "#2a2723", mute: "#7a7266", line: "#e9e1cf", sage: "#7f9a7a", sageD: "#4f6b4c", empty: "#e4dccb" };

  // ---- Pure helpers (tested in _system/tests/share.test.mjs)
  function wrapLines(text, maxWidth, measure, maxLines) {
    var words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean), lines = [], cur = "";
    for (var i = 0; i < words.length; i++) {
      var w = words[i], tryLine = cur ? cur + " " + w : w;
      if (!cur || measure(tryLine) <= maxWidth) { cur = tryLine; continue; }
      lines.push(cur); cur = w;
    }
    if (cur) lines.push(cur);
    if (maxLines && lines.length > maxLines) {
      var keep = lines.slice(0, maxLines), last = keep[maxLines - 1] + "...";
      while (measure(last) > maxWidth && last.indexOf(" ") > 0) last = last.replace(/\s+\S+\.\.\.$/, "...");
      keep[maxLines - 1] = last; lines = keep;
    }
    return lines;
  }
  // Biggest title size (from sizes, largest first) that fits in maxLines without breaking a word across the edge.
  function fitTitle(title, maxWidth, measureAt, sizes, maxLines) {
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i], m = function (t) { return measureAt(t, s); };
      var lines = wrapLines(title, maxWidth, m);
      if (lines.length <= maxLines && lines.every(function (l) { return m(l) <= maxWidth; })) return { size: s, lines: lines };
    }
    var last = sizes[sizes.length - 1];
    return { size: last, lines: wrapLines(title, maxWidth, function (t) { return measureAt(t, last); }, maxLines) };
  }
  // 4.5 -> [1,1,1,1,0.5]
  function starParts(rating) {
    var r = Math.max(0, Math.min(5, Math.round((parseFloat(rating) || 0) * 2) / 2)), out = [];
    for (var i = 1; i <= 5; i++) out.push(r >= i ? 1 : r >= i - 0.5 ? 0.5 : 0);
    return out;
  }
  function ratingLabel(rating) { var r = parseFloat(rating); return r > 0 ? (Math.round(r * 2) / 2) + "/5" : ""; }
  function shortNote(note, max) {
    max = max || 160;
    var s = String(note || "").replace(/\s+/g, " ").trim();
    if (s.length <= max) return s;
    s = s.slice(0, max - 3); var sp = s.lastIndexOf(" ");
    return (sp > max * 0.6 ? s.slice(0, sp) : s).replace(/[\s,.;:!-]+$/, "") + "...";
  }
  function fileName(slug) { return "blind-tiger-" + (String(slug || "recipe").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "recipe") + ".png"; }
  // Center-crop box for drawing a w x h image into a bw x bh frame (object-fit: cover).
  function coverBox(w, h, bw, bh) {
    var k = Math.max(bw / w, bh / h), sw = bw / k, sh = bh / k;
    return { sx: (w - sw) / 2, sy: (h - sh) / 2, sw: sw, sh: sh };
  }
  var H_ = { wrapLines: wrapLines, fitTitle: fitTitle, starParts: starParts, ratingLabel: ratingLabel, shortNote: shortNote, fileName: fileName, coverBox: coverBox, W: W, H: H };
  g.KSHARE = H_;
  if (!g.document) return;

  // ---- Drawing
  var doc = g.document, HAND = "Hand, 'Bradley Hand', cursive", SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  function loadImg(src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var im = new Image(); im.decoding = "async";
      im.onload = function () { ok(im.naturalWidth ? im : null); }; im.onerror = function () { ok(null); };
      im.src = src;   // site photos are same-origin (/photos/...) and the rating photo is a data: URL, so the canvas stays exportable
    });
  }
  function rrect(x, c, y, w, h, r) { x.beginPath(); x.moveTo(c + r, y); x.arcTo(c + w, y, c + w, y + h, r); x.arcTo(c + w, y + h, c, y + h, r); x.arcTo(c, y + h, c, y, r); x.arcTo(c, y, c + w, y, r); x.closePath(); }
  function star(x, cx, cy, R) {
    x.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
    x.closePath();
  }
  function drawStars(x, parts, left, cy, R, gap) {
    parts.forEach(function (p, i) {
      var cx = left + R + i * (2 * R + gap);
      star(x, cx, cy, R); x.fillStyle = C.empty; x.fill();
      if (p) { x.save(); x.beginPath(); x.rect(cx - R, cy - R, p === 1 ? 2 * R : R, 2 * R); x.clip(); star(x, cx, cy, R); x.fillStyle = C.sageD; x.fill(); x.restore(); }
    });
    return left + 5 * 2 * R + 4 * gap;
  }
  async function render(d) {
    try { await Promise.all([doc.fonts.load("700 120px Hand"), doc.fonts.ready]); } catch (e) {}
    var img = await loadImg(d.photo);
    var cv = doc.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d");
    // gingham tablecloth like the site background, then one paper sheet
    x.fillStyle = C.cream; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(127,154,122,.10)";
    for (var i = 0; i < W; i += 112) x.fillRect(i, 0, 56, H);
    for (var j = 0; j < H; j += 112) x.fillRect(0, j, W, 56);
    var M = 64, top = 120, cw = W - 2 * M, ch = H - 2 * top;
    x.save(); x.shadowColor = "rgba(60,50,30,.22)"; x.shadowBlur = 50; x.shadowOffsetY = 18;
    rrect(x, M, top, cw, ch, 36); x.fillStyle = C.paper; x.fill(); x.restore();
    rrect(x, M, top, cw, ch, 36); x.strokeStyle = C.line; x.lineWidth = 3; x.stroke();
    var P = 56, L = M + P, tw = cw - 2 * P, y = top + P;
    // kicker
    x.fillStyle = C.sage; x.font = "600 30px " + SANS; x.textBaseline = "alphabetic";
    if ("letterSpacing" in x) x.letterSpacing = "6px";
    x.fillText("CREWS & ANNA'S KITCHEN", L, y + 30);
    if ("letterSpacing" in x) x.letterSpacing = "0px";
    y += 70;
    var rated = parseFloat(d.rating) > 0, note = rated ? shortNote(d.note, 150) : "";
    var fy = top + ch - P - 20, bottom = fy - 70 - 60;   // footer rule sits 70px above the address; keep 60px clear
    var measureAt = function (t, s) { x.font = "700 " + s + "px " + HAND; return x.measureText(t).width; };
    x.font = "italic 44px " + SANS;
    var nl = note ? wrapLines("\u201C" + note + "\u201D", tw, function (t) { return x.measureText(t).width; }, 4) : [];
    var extra = (rated ? 110 : 0) + (nl.length ? nl.length * 62 + 10 : 0);
    var sizes = img ? [150, 132, 116, 100, 88, 76] : [190, 170, 150, 132, 116, 100], fit, th, ph = 0;
    for (var si = 0; si < sizes.length; si++) {
      fit = fitTitle(d.title, tw, measureAt, sizes.slice(si), img ? 3 : 4);
      th = Math.round(fit.size * 0.8 + (fit.lines.length - 1) * fit.size * 1.0);
      if (!img) break;
      ph = Math.min(960, bottom - y - 70 - th - 60 - extra);
      if (ph >= 560 || fit.size === sizes[sizes.length - 1]) break;
    }
    if (img && ph < 360) img = null;   // never squeeze a photo into a sliver
    if (img) {
      var bx = coverBox(img.naturalWidth, img.naturalHeight, tw, ph);
      x.save(); rrect(x, L, y, tw, ph, 24); x.clip(); x.drawImage(img, bx.sx, bx.sy, bx.sw, bx.sh, L, y, tw, ph); x.restore();
      y += ph + 70;
    } else {
      y = Math.max(y + 150, Math.round((y + bottom - th - 60 - extra) / 2) - 60);   // no photo: sit the text a little above center
    }
    x.font = "700 " + fit.size + "px " + HAND; x.fillStyle = C.sageD;
    fit.lines.forEach(function (l, k) { x.fillText(l, L, y + fit.size * 0.8 + k * fit.size); });
    y += th + 60;
    if (rated) {
      var end = drawStars(x, starParts(d.rating), L, y + 30, 36, 14);
      x.font = "600 46px " + SANS; x.fillStyle = C.ink; x.fillText(ratingLabel(d.rating) + (d.who ? " from " + d.who : ""), end + 28, y + 47);
      y += 110;
      x.font = "italic 44px " + SANS; x.fillStyle = C.ink;
      nl.forEach(function (l, k) { x.fillText(l, L, y + 44 + k * 62); });
    }
    // footer: a rule and the site address
    x.fillStyle = C.line; x.fillRect(L, fy - 70, tw, 3);
    x.font = "600 44px " + SANS; x.fillStyle = C.sageD;
    if ("letterSpacing" in x) x.letterSpacing = "1px";
    x.fillText("blind-tiger.pages.dev", L, fy);
    if ("letterSpacing" in x) x.letterSpacing = "0px";
    return new Promise(function (ok, no) { cv.toBlob(function (bl) { bl ? ok(bl) : no(new Error("no image")); }, "image/png"); });
  }

  // ---- Share flow. The card is drawn ahead of the tap where possible, because iPhone Safari only opens the share
  // sheet if navigator.share runs right after the tap.
  function dataOf(b) {
    var k = b.kshare || {};
    return { slug: b.dataset.share, title: b.dataset.title || "", photo: k.photo || b.dataset.photo || "", rating: k.rating || "", note: k.note || "", who: k.who || "" };
  }
  function prep(b) { if (!b._card) b._card = render(dataOf(b)).then(function (bl) { return new File([bl], fileName(b.dataset.share), { type: "image/png" }); }); return b._card; }
  var iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function say(b, t) { var m = b.parentNode && b.parentNode.querySelector(".shmsg"); if (m) m.textContent = t; }
  function canFiles(f) { try { return !!(navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; } }
  function preview(f) {
    var url = URL.createObjectURL(f), ov = doc.createElement("div");
    ov.className = "shareov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Story card");
    ov.innerHTML = '<p>Press and hold the card, then Save to Photos. Add it from Instagram > Story.</p><img alt="Story card"><button type=button>Close</button>';
    ov.querySelector("img").src = url;
    ov.querySelector("button").onclick = function () { ov.remove(); URL.revokeObjectURL(url); };
    doc.body.appendChild(ov);
  }
  function download(f) {
    var url = URL.createObjectURL(f), a = doc.createElement("a");
    a.href = url; a.download = f.name; doc.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  async function go(b) {
    if (b.disabled) return;
    var ready = !!b._ready; b.disabled = true;
    if (!ready) say(b, "Making the card...");
    var f;
    try { f = await prep(b); b._ready = true; } catch (e) { b.disabled = false; b._card = null; return say(b, "Couldn't make the card. Try again?"); }
    b.disabled = false; say(b, "");
    if (canFiles(f)) {
      try { await navigator.share({ files: [f], title: b.dataset.title || "" }); }
      catch (e) {
        if (e && e.name === "AbortError") return;
        if (!ready && e && e.name === "NotAllowedError") return say(b, "Card's ready. Tap again to share.");
        iOS ? preview(f) : download(f);
      }
      return;
    }
    if (iOS) return preview(f);
    download(f); say(b, "Saved " + f.name + ". Post it from your phone, or AirDrop it over.");
  }
  function wire(b) {
    if (b._wired) return; b._wired = true; b.hidden = false;
    b.addEventListener("click", function () { go(b); });
    // draw the card once the button is on screen (the home page has every recipe in it, so not all at once)
    var warm = function () { prep(b).then(function () { b._ready = true; }, function () { b._card = null; }); };
    if (!g.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); (g.requestIdleCallback || setTimeout)(warm); } });
    io.observe(b);
  }
  function scan() { [].slice.call(doc.querySelectorAll("button.sharebtn[data-share]")).forEach(wire); }
  g.KSHARE.wire = wire;
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", scan); else scan();
})(typeof window !== "undefined" ? window : globalThis);
