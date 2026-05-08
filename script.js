const SHEET_ID =
  "18DipGlUjrFydq-xeJncUWtAhSiU2C4l6T8EZhrz9nu4";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbylIuZUUsCFYnvyZf34oU1gh93C7J84aGXfgPtAw0eK-ihlEEep5qJbDOe_35hSQ0GY6A/exec";

const SHEET_MAP = {
  bmw: "BMW",
  toyota: "Toyota",
  volkswagen: "Volkswagen",
  mercedes: "Mercedes"
};

function formatGHS(val) {

  if (!val) return "—";

  const num = parseFloat(
    String(val).replace(/[^\d.-]/g, "")
  );

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

  const page = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  if (page.includes("bmw")) return "bmw";
  if (page.includes("toyota")) return "toyota";
  if (page.includes("volkswagen")) return "volkswagen";
  if (page.includes("mercedes")) return "mercedes";

  return "default";
}

function createVehicleCard(vehicle) {

  const {
    name,
    ghsNew,
    ghsPre,
    specs,
    yt,
    image
  } = vehicle;

  const brand = getBrandFromPage();

  const logoPath =
    `images/logos/${brand}.png`;

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

    <img src="${logoPath}"
         class="brand-logo"
         alt="${brand} logo">

    <a href="${yt || "#"}"
       target="_blank"
       class="card-link">

      <img src="images/cars/${image || "placeholder.jpg"}"
           alt="${name}">

    </a>

    <h2>${name}</h2>

    <p>${formattedSpecs}</p>

    <div class="price-tags">

      <span class="price new">
        New: ${formatGHS(ghsNew)}
      </span>

      ${
        ghsPre && ghsPre !== "-"
          ? `
          <span class="price preowned">
            Pre-owned: ${formatGHS(ghsPre)}
          </span>
          `
          : ""
      }

      <div class="cta-buttons">

        <button
          class="cta-btn enquire-btn"
          onclick="openEnquiry('${name}')">

          Enquire

        </button>

        <a
          class="cta-btn whatsapp-btn"
          target="_blank"
          href="https://wa.me/233595445544?text=${encodeURIComponent(
            `Hello Zerosol, I'm interested in the ${name}.`
          )}">

            <img
              src="images/icons/whatsapp.png"
              alt="WhatsApp"
              class="whatsapp-icon">

            <span>Leave a Message</span>

        </a>

      </div>

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

    const response =
      await fetch(sheetUrl(sheetName));

    const text = await response.text();

    const json =
      JSON.parse(text.substr(47).slice(0, -2));

    const rows = json.table.rows;

    const container =
      document.getElementById("vehicles-container");

    container.innerHTML = "";

    rows.forEach(row => {

      if (!row.c || !row.c[0] || !row.c[0].v)
        return;

      const vehicle = {

        name: row.c[0]?.v || "",

        ghsNew: row.c[2]?.v || "",

        ghsPre: row.c[4]?.v || "",

        specs: row.c[6]?.v || "",

        yt: row.c[7]?.v || "",

        image: row.c[9]?.v || ""

      };

      const card =
        createVehicleCard(vehicle);

      container.appendChild(card);
    });

  } catch (error) {

    console.error(
      "Error loading vehicles:",
      error
    );
  }
}

function openEnquiry(vehicleName) {

  document.getElementById(
    "enquiry-modal"
  ).style.display = "block";

  document.getElementById(
    "vehicle-name"
  ).value = vehicleName;
}

function closeEnquiry() {

  document.getElementById(
    "enquiry-modal"
  ).style.display = "none";
}

window.onclick = function(e) {

  const modal =
    document.getElementById("enquiry-modal");

  if (e.target === modal) {

    closeEnquiry();
  }
};

let enquirySubmitting = false;

document.addEventListener("submit", async function(e) {

  if (e.target.id !== "enquiry-form")
    return;

  e.preventDefault();

  // Prevent double submission
  if (enquirySubmitting)
    return;

  enquirySubmitting = true;

  const submitBtn =
    e.target.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const payload = {

    name:
      document.getElementById(
        "customer-name"
      ).value,

    phone:
      document.getElementById(
        "customer-phone"
      ).value,

    email:
      document.getElementById(
        "customer-email"
      ).value,

    car:
      document.getElementById(
        "vehicle-name"
      ).value,

    budget:
      document.getElementById(
        "customer-budget"
      ).value
  };

  try {

    await fetch(APPS_SCRIPT_URL, {

      method: "POST",

      body: JSON.stringify(payload)
    });

    alert(
      "Enquiry submitted successfully."
    );

    closeEnquiry();

    document.getElementById(
      "enquiry-form"
    ).reset();

  } catch (err) {

    alert(
      "Failed to submit enquiry."
    );

    console.error(err);

  } finally {

    enquirySubmitting = false;

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Enquiry";
  }
});

document.addEventListener(
  "DOMContentLoaded",
  loadVehicles
);