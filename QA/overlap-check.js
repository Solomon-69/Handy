// Run in the browser console on http://localhost:1420/src/overlay/index.html (vite dev, mock backend).
// Walks every bar state x size x glass and fails if the middle item touches the cross, timer or dot.
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const bad = [];
  const sizes = [0.92, 1.15];
  const states = [
    ["recording", () => __emit("show-overlay", "recording")],
    ["transcribing", () => __emit("show-overlay", "transcribing")],
    ["prompting", async () => { __emit("show-overlay", "transcribing"); await wait(200); __emit("prompt-chip-working", "prompt"); }],
    ["cleaning", async () => { __emit("show-overlay", "transcribing"); await wait(200); __emit("prompt-chip-working", "clean"); }],
  ];
  for (const size of sizes) {
    document.documentElement.style.setProperty("--ov-scale", String(size));
    for (const glass of ["clear", "black"]) {
      document.documentElement.dataset.glass = glass;
      for (const [name, go] of states) {
        __emit("hide-overlay"); await wait(500);
        await go(); await wait(900);
        const row = document.querySelector(".sbase");
        const mid = row && row.querySelector(".swave, .swork");
        if (!mid) { bad.push(`${name}/${size}/${glass}: no middle item`); continue; }
        const m = mid.getBoundingClientRect();
        for (const sel of [".sx", ".stimer", ".sdot"]) {
          const el = row.querySelector(sel);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.width && r.left < m.right + 4 && r.right > m.left - 4 && r.top < m.bottom && r.bottom > m.top)
            bad.push(`${name}/${size}/${glass}: ${sel} touches the middle item (gap ${Math.round(Math.min(r.left - m.right, m.left - r.right))}px)`);
        }
        const c = row.closest(".scard").getBoundingClientRect();
        if (m.left < c.left || m.right > c.right) bad.push(`${name}/${size}/${glass}: middle item sticks out of the pill`);
      }
    }
  }
  return bad.length ? "FAIL\n" + bad.join("\n") : "PASS: no overlap in any state";
})();
