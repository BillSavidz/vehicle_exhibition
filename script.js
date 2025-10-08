document.addEventListener("DOMContentLoaded", async () => {
  // --- CONFIG ---
  const SHEET_ID = "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";
  // End config

  // derive sheet name from filename: "bmw.html" -> "BMW"
  const pageFile = window.location.pathname.split("/").pop();
  const pageName = pageFile ? pageFile.split(".")[0] : "bmw";
  const sheetName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  const sheetURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName
  )}`;

  // Format a raw sheet value into "¢12,345.68"
  function formatPriceForDisplay(rawVal) {
    if (rawVal === null || rawVal === undefined || rawVal === "") return "—"; // dash when empty
    // rawVal may be number or string like "¢736,854.24" or "$54,744.00" or "736854.24"
    const cleaned = rawVal.toString().replace(/[^0-9.\-]/g, "");
    const n = parseFloat(cleaned);
    if (Number.isNaN(n)) return "—";
    return "¢" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Normalize a model name to an alphanumeric lowercase token
  function normalizeName(s) {
    return (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  // Extract model token by removing leading brand letters (e.g. "volkswagenid6" -> "id6")
  function modelToken(normalized) {
    return normalized.replace(/^[a-z]+/, ""); // strip leading letters (brand)
  }

  // Attempt to parse the gviz JSON wrapper robustly
  async function fetchSheetJson(url) {
    const res = await fetch(url);
    const text = await res.text();
    // Extract JSON object in case Google wraps it
    const match = text.match(/(\{[\s\S]*\})/);
    if (!match) throw new Error("Unexpected sheet response format");
    return JSON.parse(match[1]);
  }

  try {
    const json = await fetchSheetJson(sheetURL);
    const cols = (json.table.cols || []).map((c) => (c.label ? c.label.toString() : ""));
    const rawRows = json.table.rows || [];

    // Convert rows -> array of cell values (empty string when null)
    const rows = rawRows.map((r) => (r.c || []).map((c) => (c ? c.v : "")));

    // For debugging if you open console:
    console.debug(`[sheet:${sheetName}] parsed ${rows.length} data rows, cols:`, cols);

    // For quick lookups, create an index mapping normalized names -> row object
    const index = rows.map((r) => {
      const nameCell = r[0] || ""; // column A: Name
      const normalized = normalizeName(nameCell);
      const token = modelToken(normalized);
      return {
        raw: r,
        name: nameCell,
        normalized,
        token,
      };
    });

    // Iterate the vehicle cards on page
    const cards = document.querySelectorAll(".vehicle-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const h2 = card.querySelector("h2");
      if (!h2) return;
      const cardTitle = h2.innerText.trim();
      const normCard = normalizeName(cardTitle);
      const tokenCard = modelToken(normCard);

      // Find best matching row:
      // 1) exact normalized match
      // 2) exact token match
      // 3) normalized includes or token includes (fallback)
      const matchRow =
        index.find((x) => x.normalized === normCard) ||
        index.find((x) => x.token === tokenCard) ||
        index.find((x) => x.normalized.includes(normCard) || normCard.includes(x.normalized)) ||
        index.find((x) => x.token && tokenCard && (x.token.includes(tokenCard) || tokenCard.includes(x.token)));

      // price DOM elements
      const newEl = card.querySelector(".price.new");
      const usedEl = card.querySelector(".price.preowned");

      if (!matchRow) {
        // Not found — show dash
        if (newEl) newEl.textContent = "New: —";
        if (usedEl) usedEl.textContent = "Pre-owned: —";
        console.warn(`[${sheetName}] no sheet row matched card: "${cardTitle}"`);
        return;
      }

      // Column indices (0-based): Name=A(0), USD new=B(1), GHS new=C(2), USD pre-owned=D(3), GHS pre-owned=E(4), ...
      const row = matchRow.raw;
      const ghsNewRaw = row[2] ?? "";
      const ghsUsedRaw = row[4] ?? "";

      if (newEl) newEl.textContent = "New: " + formatPriceForDisplay(ghsNewRaw);
      if (usedEl) {
        // If pre-owned empty or "-" show dash
        const displayed = (ghsUsedRaw === "" || ghsUsedRaw === "-" || ghsUsedRaw === null) ? "—" : formatPriceForDisplay(ghsUsedRaw);
        usedEl.textContent = "Pre-owned: " + displayed;
      }

      // debug
      console.debug(`card "${cardTitle}" matched sheet "${matchRow.name}" -> new:${ghsNewRaw}, used:${ghsUsedRaw}`);
    });
  } catch (err) {
    console.error(`Could not load sheet (${sheetName}) data:`, err);
    // show dashes if fetch fails
    document.querySelectorAll(".vehicle-card").forEach((card) => {
      const newEl = card.querySelector(".price.new");
      const usedEl = card.querySelector(".price.preowned");
      if (newEl) newEl.textContent = "New: —";
      if (usedEl) usedEl.textContent = "Pre-owned: —";
    });
  }
});
