// script.js
// Reads prices from published Google Sheet and injects into each showroom page

const SHEET_ID = "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";
const SHEET_MAP = {
  bmw: "BMW",
  toyota: "Toyota",
  volkswagen: "Volkswagen",
  mercedes: "Mercedes"
};

// --- Helper functions ---

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/volkwagen/g, "volkswagen") // fix sheet typo
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(val) {
  if (!val) return NaN;
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? NaN : n;
}

function formatGHS(val) {
  const n = parseNumber(val);
  return isNaN(n)
    ? "—"
    : "¢" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sheetUrlFor(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    sheetName
  )}`;
}

function findBestRow(rows, cardTitle) {
  const normTitle = normalize(cardTitle);
  let bestRow = null;
  let bestScore = 0;

  for (const row of rows) {
    const nameCell = row.c[0]?.v || "";
    const normName = normalize(nameCell);
    if (!normName) continue;

    // Token match scoring
    const t1 = new Set(normTitle.split(" "));
    const t2 = new Set(normName.split(" "));
    const intersection = [...t1].filter(x => t2.has(x));
    const score = intersection.length / Math.max(t1.size, t2.size);

    if (score > bestScore) {
      bestScore = score;
      bestRow = row;
    }
  }
  return bestScore > 0.4 ? bestRow : null;
}

// --- Main ---

(async function () {
  const page = window.location.pathname.split("/").pop().split(".")[0].toLowerCase();
  const sheetName = SHEET_MAP[page];
  if (!sheetName) return console.warn("Unknown brand page:", page);

  try {
    const res = await fetch(sheetUrlFor(sheetName));
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    document.querySelectorAll(".vehicle-card").forEach(card => {
      const title = card.querySelector("h2")?.textContent.trim();
      const newEl = card.querySelector(".price.new");
      const preEl = card.querySelector(".price.preowned");

      const match = findBestRow(rows, title);
      if (!match) {
        if (newEl) newEl.textContent = "New: —";
        if (preEl) preEl.textContent = "Pre-owned: —";
        console.warn(`No sheet match for: "${title}"`);
        return;
      }

      // Col indexes
      const ghsNew = match.c[2]?.v || null;
      const ghsPre = match.c[4]?.v || null;

      if (newEl) newEl.textContent = "New: " + formatGHS(ghsNew);
      if (preEl) preEl.textContent = "Pre-owned: " + formatGHS(ghsPre);
    });

    console.log(`Prices updated for "${sheetName}".`);
  } catch (e) {
    console.error("Error loading sheet:", e);
  }
})();
