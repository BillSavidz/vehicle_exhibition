// script.js
document.addEventListener("DOMContentLoaded", async () => {
  const sheetName = "BMW";
  const sheetID = "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";
  const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

  // Helper: clean currency values
  const cleanValue = (val) => parseFloat(val.replace(/[^\d.]/g, ""));

  async function fetchSheetData() {
    try {
      const res = await fetch(sheetURL);
      const text = await res.text();
      const json = JSON.parse(text.substr(47).slice(0, -2)); // strip wrapper
      const rows = json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
      return rows.slice(1); // skip header
    } catch (err) {
      console.error("Error fetching sheet data:", err);
      return [];
    }
  }

  const data = await fetchSheetData();
  if (!data.length) return;

  // Go through each vehicle card and update prices
  data.forEach(row => {
    const name = row[0]; // e.g. "BMW i3 SEDAN"
    const ghsNew = row[2]; // column C
    const ghsUsed = row[4]; // column E

    document.querySelectorAll(".vehicle-card").forEach(card => {
      const title = card.querySelector("h2").textContent.trim().toLowerCase();
      if (title.includes(name.toLowerCase())) {
        const newPriceEl = card.querySelector(".price.new");
        const usedPriceEl = card.querySelector(".price.preowned");

        if (newPriceEl) newPriceEl.textContent = `New: ¢${ghsNew}`;
        if (usedPriceEl && ghsUsed && ghsUsed !== "-") {
          usedPriceEl.textContent = `Pre-owned: ¢${ghsUsed}`;
        } else if (usedPriceEl) {
          usedPriceEl.remove();
        }
      }
    });
  });
});
