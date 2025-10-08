// script.js
document.addEventListener("DOMContentLoaded", async function () {
  // Detect which brand page this is (based on filename)
  const pageName = window.location.pathname.split("/").pop().split(".")[0];
  const sheetName = pageName.charAt(0).toUpperCase() + pageName.slice(1); // e.g. bmw -> BMW

  const sheetURL = `https://docs.google.com/spreadsheets/d/18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4/gviz/tq?tqx=out:json&sheet=${sheetName}`;

  try {
    const response = await fetch(sheetURL);
    const text = await response.text();

    // Parse Google Sheets JSON
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    // Helper function: format as ¢12,345.68
    const formatPrice = (value) => {
      const num = parseFloat(value.toString().replace(/[^\d.-]/g, ""));
      if (isNaN(num)) return "N/A";
      return (
        "¢" +
        num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    };

    // Update price tags on the page
    const cards = document.querySelectorAll(".vehicle-card");

    cards.forEach((card) => {
      const modelName = card.querySelector("h2").innerText.trim().toLowerCase();

      // Match by model keyword (ignore case & whitespace)
      const row = rows.find((r) => {
        const sheetNameCell = (r.c[0]?.v || "").trim().toLowerCase();
        return sheetNameCell.includes(modelName.split(" ")[1]); // e.g. iX3, EQB, etc.
      });

      if (row) {
        const newPrice = row.c[2]?.v || "";
        const prePrice = row.c[4]?.v || "";

        const newPriceEl = card.querySelector(".price.new");
        const prePriceEl = card.querySelector(".price.preowned");

        newPriceEl.textContent = "New: " + formatPrice(newPrice);
        prePriceEl.textContent = "Pre-owned: " + formatPrice(prePrice);
      }
    });
  } catch (err) {
    console.error(`Error loading ${sheetName} prices:`, err);
  }
});
