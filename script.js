const SHEET_ID = "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbylIuZUUsCFYnvyZf34oU1gh93C7J84aGXfgPtAw0eK-ihlEEep5qJbDOe_35hSQ0GY6A/exec";

const SHEET_MAP = {
  bmw: "BMW",
  toyota: "Toyota",
  volkswagen: "Volkswagen",
  mercedes: "Mercedes",
};

let allVehicles = [];
let currentSort = 0;

function formatGHS(val) {
  if (!val) return "—";

  const num = parseFloat(String(val).replace(/[^\d.-]/g, ""));

  if (isNaN(num)) return "—";

  return (
    "¢" +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function getPriceNumber(price) {
  if (!price) return 0;

  return parseFloat(String(price).replace(/[^\d.-]/g, "")) || 0;
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
  const { name, ghsNew, ghsPre, specs, yt, classSize, image } = vehicle;

  const brand = getBrandFromPage();

  const logoPath = `images/logos/${brand}.png`;

  const card = document.createElement("div");

  card.className = "vehicle-card";

  card.onclick = () =>
    openVehicleModal(encodeURIComponent(JSON.stringify(vehicle)));

  const formattedSpecs = specs
    ? specs
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("<br>")
    : "";

  const hasNewPrice = ghsNew && ghsNew !== "-" && getPriceNumber(ghsNew) > 0;

  const primaryLabel = hasNewPrice ? "Brand New" : "Pre-Owned";

  const primaryPrice = hasNewPrice ? formatGHS(ghsNew) : formatGHS(ghsPre);

  card.innerHTML = `

    <img
      src="${logoPath}"
      class="brand-logo"
      alt="${brand} logo">

    <a
      href="#"
      class="card-link"
      onclick="event.stopPropagation(); openVehicleModal('${encodeURIComponent(
        JSON.stringify(vehicle),
      )}'); return false;">

      <img
        src="images/cars/${image || "placeholder.jpg"}"
        alt="${name}">

    </a>

    <h2>${name}</h2>

    <div class="vehicle-class">
      ${classSize || ""}
    </div>

    <div class="starting-price">
      ${
        hasNewPrice
          ? "Brand New Starting From"
          : "Certified Pre-Owned Starting From"
      }
    </div>

    <div class="starting-price-value">
      ${primaryPrice}
    </div>

    <p>${formattedSpecs}</p>

    <div class="price-section">

      <div class="price-label">
        ${primaryLabel}
      </div>

      <div class="price-main">
        ${primaryPrice}
      </div>

      ${
        hasNewPrice && ghsPre && ghsPre !== "-"
          ? `
          <div class="price-secondary">
            CPO from ${formatGHS(ghsPre)}
          </div>
          `
          : ""
      }

    </div>

  `;

  return card;
}

function openVehicleModal(encodedVehicle) {
  const vehicle = JSON.parse(decodeURIComponent(encodedVehicle));

  const hasNewPrice =
    vehicle.ghsNew &&
    vehicle.ghsNew !== "-" &&
    getPriceNumber(vehicle.ghsNew) > 0;

  document.getElementById("modal-image").src = `images/cars/${vehicle.image}`;

  document.getElementById("modal-title").textContent = vehicle.name;

  document.getElementById("modal-class").textContent = vehicle.classSize || "";

  document.querySelector("#vehicle-modal .starting-price").textContent =
    hasNewPrice
      ? "Brand New Starting From"
      : "Certified Pre-Owned Starting From";

  document.getElementById("modal-price").textContent = hasNewPrice
    ? formatGHS(vehicle.ghsNew)
    : formatGHS(vehicle.ghsPre);

  document.getElementById("modal-specs").innerHTML = vehicle.specs
    ? vehicle.specs.split("\n").join("<br>")
    : "";

  document.getElementById("modal-video").href = vehicle.yt || "#";

  document.getElementById("modal-enquire").onclick = () =>
    openEnquiry(vehicle.name);

  document.getElementById("modal-whatsapp").href =
    `https://wa.me/233595445544?text=${encodeURIComponent(
      `Hello Zerosol, I'm interested in the ${vehicle.name}.`,
    )}`;

  document.getElementById("vehicle-modal").style.display = "block";
}

function closeVehicleModal() {
  document.getElementById("vehicle-modal").style.display = "none";
}

function getInputNumber(id) {
  return Number(document.getElementById(id).value.replace(/,/g, "")) || 0;
}

function getVehiclePrice(vehicle) {
  const newPrice = getPriceNumber(vehicle.ghsNew);

  if (newPrice > 0) return newPrice;

  return getPriceNumber(vehicle.ghsPre);
}

function applyFilters() {
  let vehicles = [...allVehicles];

  const searchTerm =
    document.getElementById("search-box")?.value.toLowerCase() || "";

  const minPrice = getInputNumber("min-price");

  const maxPrice = getInputNumber("max-price");

  const filterBtn = document.getElementById("filter-btn");

  const active = minPrice || maxPrice;

  filterBtn.classList.toggle("active", active);

  if (searchTerm) {
    vehicles = vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(searchTerm) ||
        v.specs.toLowerCase().includes(searchTerm),
    );
  }

  if (minPrice) {
    vehicles = vehicles.filter((v) => getVehiclePrice(v) >= minPrice);
  }

  if (maxPrice) {
    vehicles = vehicles.filter((v) => getVehiclePrice(v) <= maxPrice);
  }

  if (currentSort === 1) {
    vehicles.sort((a, b) => getVehiclePrice(a) - getVehiclePrice(b));
  }

  if (currentSort === 2) {
    vehicles.sort((a, b) => getVehiclePrice(b) - getVehiclePrice(a));
  }

  renderVehicles(vehicles);
}

function renderEmptyState(vehicleCount) {
  const container = document.getElementById("vehicles-container");

  if (vehicleCount > 0) return;

  container.innerHTML = `

    <div class="empty-state">

      <h3>
        No vehicles found
      </h3>

      <p>
        Try adjusting your search
        or price filters.
      </p>

    </div>

  `;
}

function renderVehicles(vehicles) {
  const container = document.getElementById("vehicles-container");

  container.innerHTML = "";

  const resultsCount = document.getElementById("results-count");

  if (resultsCount) {
    resultsCount.textContent = `Showing ${vehicles.length} of ${allVehicles.length} vehicles`;
  }

  vehicles.forEach((vehicle) => {
    const card = createVehicleCard(vehicle);

    container.appendChild(card);
  });

  renderEmptyState(vehicles.length);
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

    allVehicles = [];

    rows.forEach((row) => {
      if (!row.c || !row.c[0] || !row.c[0].v) return;

      const vehicle = {
        name: row.c[0]?.v || "",

        ghsNew: row.c[2]?.v || "",

        ghsPre: row.c[4]?.v || "",

        specs: row.c[6]?.v || "",

        yt: row.c[7]?.v || "",

        classSize: row.c[8]?.v || "",

        image: row.c[9]?.v || "",
      };

      allVehicles.push(vehicle);
    });

    renderVehicles(allVehicles);
  } catch (error) {
    console.error("Error loading vehicles:", error);
  }
}

function openEnquiry(vehicleName) {
  document.getElementById("enquiry-modal").style.display = "block";

  document.getElementById("vehicle-name").value = vehicleName;
}

function closeEnquiry() {
  document.getElementById("enquiry-modal").style.display = "none";
}

document.addEventListener("click", function (e) {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

let enquirySubmitting = false;

document.addEventListener("submit", async function (e) {
  if (e.target.id !== "enquiry-form") return;

  e.preventDefault();

  if (enquirySubmitting) return;

  enquirySubmitting = true;

  const submitBtn = e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const payload = {
    name: document.getElementById("customer-name").value,

    phone: document.getElementById("customer-phone").value,

    email: document.getElementById("customer-email").value,

    car: document.getElementById("vehicle-name").value,

    budget: document.getElementById("customer-budget").value,
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    alert("Enquiry submitted successfully.");

    closeEnquiry();

    document.getElementById("enquiry-form").reset();
  } catch (err) {
    alert("Failed to submit enquiry.");

    console.error(err);
  } finally {
    enquirySubmitting = false;

    submitBtn.disabled = false;

    submitBtn.textContent = "Submit Enquiry";
  }
});

document.addEventListener("input", function (e) {
  // Search box
  if (e.target.id === "search-box") {
    applyFilters();
    return;
  }

  // Price inputs
  if (e.target.id === "min-price" || e.target.id === "max-price") {
    // Keep digits only
    let value = e.target.value.replace(/[^\d]/g, "");

    // Prevent negative values
    if (Number(value) < 0) value = "0";

    // Add comma separators
    e.target.value = value === "" ? "" : Number(value).toLocaleString("en-US");

    applyFilters();
  }
});

document.addEventListener("DOMContentLoaded", loadVehicles);

document.addEventListener("click", function (e) {
  if (e.target.closest("#sort-btn") === null) return;

  currentSort++;

  if (currentSort > 2) currentSort = 0;

  const sortIcon = document.getElementById("sort-icon");

  const sortBtn = document.getElementById("sort-btn");

  switch (currentSort) {
    case 0:
      sortIcon.src = "images/icons/sort.svg";

      sortBtn.title = "No Sort";

      break;

    case 1:
      sortIcon.src = "images/icons/sort-asc.svg";

      sortBtn.title = "Price: Low → High";

      break;

    case 2:
      sortIcon.src = "images/icons/sort-desc.svg";

      sortBtn.title = "Price: High → Low";

      break;
  }

  applyFilters();
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filter-btn").addEventListener("click", () => {
    document.getElementById("price-filter-row").classList.toggle("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("min-price").value = "";

    document.getElementById("max-price").value = "";

    document.getElementById("price-filter-row").classList.add("hidden");

    applyFilters();
  });
});

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");

  if (!header) return;

  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });
});
