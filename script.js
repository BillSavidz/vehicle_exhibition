// script.js
document.addEventListener("DOMContentLoaded", async function () {
  const sheetURL =
    "https://docs.google.com/spreadsheets/d/18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4/gviz/tq?tqx=out:json&sheet=BMW";

  try {
    const response = await fetch(sheetURL);
    const text = await response.text();

    // Clean the Google Sheets response
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    // Helper: format as ¢12,345.68
    const formatPrice = (value) => {
      const num = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      if (isNaN(num)) return "N/A";
      return "¢" + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Go through each card and match it to the sheet row
    const cards = document.querySelectorAll(".vehicle-card");

    cards.forEach((card) => {
      const modelName = card.querySelector("h2").innerText.trim().toLowerCase();

      const row = rows.find((r) => {
        const sheetName = (r.c[0]?.v || "").trim().toLowerCase();
        return sheetName.includes(modelName.split(" ")[1]); // match by key word like i3, iX1, etc.
      });

      if (row) {
        const newPrice = row.c[2]?.v || "";
        const preownedPrice = row.c[4]?.v || "";

        const newPriceEl = card.querySelector(".price.new");
        const prePriceEl = card.querySelector(".price.preowned");

        newPriceEl.textContent = "New: " + formatPrice(newPrice);
        prePriceEl.textContent = "Pre-owned: " + formatPrice(preownedPrice);
      }
    });
  } catch (err) {
    console.error("Error loading BMW prices:", err);
  }
});
