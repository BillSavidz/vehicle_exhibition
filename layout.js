function getBrand() {

  const page = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

  if (page.includes("bmw")) return "bmw";
  if (page.includes("toyota")) return "toyota";
  if (page.includes("volkswagen")) return "volkswagen";
  if (page.includes("mercedes")) return "mercedes";

  return null;
}

const brand = getBrand();

const headerHTML = `
<header>

  <img src="logo.jpg"
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
    <a href="bmw.html">BMW</a> |
    <a href="toyota.html">Toyota</a> |
    <a href="volkswagen.html">Volkswagen</a> |
    <a href="mercedes.html">Mercedes</a>
  </nav>

</header>
`;

const footerHTML = `
<footer>

  <p>
    Contact us:
    <a href="mailto:sales@zerosolafrica.co">
      sales@zerosolafrica.co
    </a>
  </p>

  <p>
    ☎
    <a href="tel:+233595445544">
      +233 59 544 5544
    </a>
    |

    <a href="tel:+233595444454">
      +233 59 544 4454
    </a>
    |

    <a href="tel:+17348833934">
      +1 (734) 883-3934
    </a>
  </p>

  <p>
    &copy;
    <span id="year"></span>
    Zerosol Automotive.
    All rights reserved.
  </p>

</footer>
`;

document.getElementById("header-placeholder").innerHTML = headerHTML;

document.getElementById("footer-placeholder").innerHTML = footerHTML;

document.getElementById("year").textContent =
  new Date().getFullYear();