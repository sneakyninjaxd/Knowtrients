/* ============================================================
   KNOWTRIENTS — tiny line chart

   Draws an SVG line chart with no external library, so there is
   nothing to install and nothing to load from the internet.

     lineChart(document.getElementById("myChart"), {
       labels: ["26/8", "27/8", "28/8"],
       series: [
         { name: "Dietary", color: "#8b7bd8", values: [72, 78, 75] },
         { name: "Activity", color: "#e2635c", values: [80, 76, 83] },
       ],
     });

   Options: yMax (default 100), yStep (default 20), unit (default "%"),
   emptyText (shown when there is nothing to plot).
   Call it again with new data to redraw; it replaces what was there.

   Missing values: a null in `values` means "no data that day", not zero.
   The line breaks there instead of dropping to the axis, so a day nobody
   rated anything doesn't look like a day the AI was 0% helpful. A value
   with no neighbour on either side is drawn as a dot.
   ============================================================ */

function lineChart(container, {
  labels = [], series = [], yMax = 100, yStep = 20, unit = "%",
  emptyText = "No data to chart yet.",
} = {}) {
  if (!container) return;

  const hasValue = (v) => v !== null && v !== undefined && Number.isFinite(Number(v));

  // The drawing uses a fixed coordinate space and the SVG scales itself to
  // whatever width the card happens to be, so it works on phones too.
  const W = 760, H = 300;
  const PAD = { top: 16, right: 16, bottom: 46, left: 40 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const anyData = series.some((s) => (s.values || []).some(hasValue));
  if (!labels.length || !series.length || !anyData) {
    container.innerHTML = `<div class="empty-hint">${escapeHtml(emptyText)}</div>`;
    return;
  }

  const x = (i) => PAD.left + (labels.length === 1 ? plotW / 2 : (plotW * i) / (labels.length - 1));
  const y = (v) => PAD.top + plotH - (Math.max(0, Math.min(yMax, v)) / yMax) * plotH;

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${W} ${H}" role="img" class="chart-svg"
     preserveAspectRatio="none" aria-label="Line chart">`);

  // Horizontal grid lines and their labels.
  for (let v = 0; v <= yMax; v += yStep) {
    parts.push(`<line x1="${PAD.left}" y1="${y(v)}" x2="${W - PAD.right}" y2="${y(v)}"
      class="chart-grid" />`);
    parts.push(`<text x="${PAD.left - 8}" y="${y(v) + 4}" class="chart-axis"
      text-anchor="end">${v}</text>`);
  }

  // Date labels. On narrow ranges every label fits; otherwise show every other.
  const every = labels.length > 10 ? 2 : 1;
  labels.forEach((label, i) => {
    if (i % every) return;
    parts.push(`<text x="${x(i)}" y="${H - PAD.bottom + 20}" class="chart-axis"
      text-anchor="middle">${escapeHtml(label)}</text>`);
  });

  // One line per series, with a soft fill underneath. Each unbroken run of
  // values is drawn separately, so gaps stay gaps.
  series.forEach((s) => {
    const colour = s.color || "var(--mint)";
    const runs = [];
    let run = [];
    (s.values || []).forEach((v, i) => {
      if (hasValue(v)) {
        run.push([i, Number(v)]);
      } else if (run.length) {
        runs.push(run);
        run = [];
      }
    });
    if (run.length) runs.push(run);

    runs.forEach((r) => {
      if (r.length < 2) return; // a lone point gets only its dot, below
      const points = r.map(([i, v]) => `${x(i)},${y(v)}`).join(" ");
      parts.push(`<polygon points="${x(r[0][0])},${y(0)} ${points} ${x(r[r.length - 1][0])},${y(0)}"
        fill="${colour}" opacity=".10" />`);
      parts.push(`<polyline points="${points}" fill="none" stroke="${colour}"
        stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`);
    });

    (s.values || []).forEach((v, i) => {
      if (!hasValue(v)) return;
      parts.push(`<circle cx="${x(i)}" cy="${y(Number(v))}" r="3" fill="${colour}">
        <title>${escapeHtml(s.name || "")} ${escapeHtml(labels[i])}: ${v}${unit}</title>
      </circle>`);
    });
  });

  parts.push(`</svg>`);

  // Legend below the chart.
  const legend = series
    .map((s) => {
      const empty = !(s.values || []).some(hasValue);
      return `<span class="chart-key"${empty ? ' style="opacity:.55"' : ""}>
        <span class="chart-dot" style="background:${s.color || "var(--mint)"}"></span>
        ${escapeHtml(s.name || "")}${empty ? " (no data)" : ""}
      </span>`;
    })
    .join("");

  container.innerHTML = parts.join("") + `<div class="chart-legend">${legend}</div>`;
}