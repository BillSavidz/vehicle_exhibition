function getBrand() {
  const page = window.location.pathname.split("/").pop().toLowerCase();

  if (page.includes("bmw")) return "bmw";
  if (page.includes("toyota")) return "toyota";
  if (page.includes("volkswagen")) return "volkswagen";
  if (page.includes("mercedes")) return "mercedes";

  return null;
}

const brand = getBrand();

function navLink(page, label) {
  const active = window.location.pathname.toLowerCase().includes(page);

  return `
    <a
      href="${page}.html"
      class="${active ? "active-nav" : ""}">
      ${label}
    </a>
  `;
}

const headerHTML = `
<header>

  <img src="logo.png"
       alt="Zerosol Logo"
       class="logo">

  <h1 class="showroom-title">

    ${
      brand
        ? `<img src="images/logos/${brand}.png"
                 class="title-logo">`
        : ""
    }

    ${
      brand
        ? brand === "bmw"
          ? "BMW"
          : brand.charAt(0).toUpperCase() + brand.slice(1)
        : ""
    }

    Showroom

  </h1>

<nav>

  ${navLink("bmw", "BMW")}

  ${navLink("toyota", "Toyota")}

  ${navLink("volkswagen", "Volkswagen")}

  ${navLink("mercedes", "Mercedes")}

</nav>
</header>
`;

const footerHTML = `
<footer class="premium-footer">

  <div class="footer-brand">

    <h3>Zerosol Automotive</h3>

    <p>
      Electric vehicle leasing, sales, aftersales services, genuine parts.
    </p>

  </div>

  <div class="footer-contact">

    <a href="mailto:sales@zerosolafrica.co">
      ✉ sales@zerosolafrica.co
    </a>

    <a href="tel:+233595445544">
      ☎ +233 59 544 5544
    </a>

    <a href="tel:+233595444454">
      ☎ +233 59 544 4454
    </a>

    <a href="tel:+17348833934">
      ☎ +1 (734) 883-3934
    </a>

  </div>

  <div class="footer-copyright">

    © <span id="year"></span>
    Zerosol Automotive

  </div>

</footer>
`;

document.getElementById("header-placeholder").innerHTML = headerHTML;

document.getElementById("footer-placeholder").innerHTML = footerHTML;

document.getElementById("year").textContent = new Date().getFullYear();

function navLink(page, label) {
  const active = window.location.pathname.includes(page);

  return `
    <a
      href="${page}.html"
      class="${active ? "active-nav" : ""}">
      ${label}
    </a>
  `;
}
