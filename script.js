const SHEET_ID = "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";

const SHEET_MAP = {
  bmw: "BMW",
  toyota: "Toyota",
  volkswagen: "Volkswagen",
  mercedes: "Mercedes"
};

function formatGHS(val) {
  if (!val) return "—";
  const num = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  if (isNaN(num)) return "—";

  return "¢" + num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function sheetUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
}

function getBrandFromPage() {
  const page = window.location.pathname.split("/").pop().toLowerCase();

  if (page.includes("bmw")) return "bmw";
  if (page.includes("toyota")) return "toyota";
  if (page.includes("volkswagen")) return "volkswagen";
  if (page.includes("mercedes")) return "mercedes";

  return "default";
}

function createVehicleCard(vehicle) {
  const { name, ghsNew, ghsPre, specs, yt, image } = vehicle;

  const brand = getBrandFromPage();
  const logoPath = `images/logos/${brand}.png`;

  const card = document.createElement("div");
  card.className = "vehicle-card";

  const formattedSpecs = specs
    ? specs
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .join("<br>")
    : "";

  card.innerHTML = `
    <img src="${logoPath}" class="brand-logo" alt="${brand} logo">

    <a href="${yt || "#"}" target="_blank" class="card-link">
      <img src="images/cars/${image || "placeholder.jpg"}" alt="${name}">
    </a>

    <h2>${name}</h2>
    <p>${formattedSpecs}</p>

    <div class="price-tags">
      <span class="price new">New: ${formatGHS(ghsNew)}</span>
      ${
        ghsPre && ghsPre !== "-"
          ? `<span class="price preowned">Pre-owned: ${formatGHS(ghsPre)}</span>`
          : ""
      }
    </div>
  `;

  return card;
}

async function loadVehicles() {
  try {
    const page = window.location.pathname
      .split("/")
      .pop()
      .split(".")[0]
      .toLowerCase();

    const sheetName = SHEET_MAP[page];
    if (!sheetName) return;

    const response = await fetch(sheetUrl(sheetName));
    const text = await response.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const container = document.getElementById("vehicles-container");
    container.innerHTML = "";

    rows.forEach(row => {
      if (!row.c || !row.c[0] || !row.c[0].v) return; // skip empty rows

      const vehicle = {
        name: row.c[0]?.v || "",
        ghsNew: row.c[2]?.v || "",
        ghsPre: row.c[4]?.v || "",
        specs: row.c[6]?.v || "",
        yt: row.c[7]?.v || "",
        image: row.c[9]?.v || ""
      };

      const card = createVehicleCard(vehicle);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading vehicles:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadVehicles);
