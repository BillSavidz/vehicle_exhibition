function getBrand() {
  const page = window.location.pathname.split("/").pop().toLowerCase();
  if (page.includes("bmw")) return "bmw";
  if (page.includes("toyota")) return "toyota";
  if (page.includes("volkswagen")) return "volkswagen";
  if (page.includes("mercedes")) return "mercedes";
  return null;
}

const brand = getBrand();

const headerHTML = `
<header>
  <img src="logo.jpg" alt="Zerosol Logo" class="logo">

  <h1 class="showroom-title">
    ${brand ? `<img src="images/logos/${brand}.png" class="title-logo">` : ""}
    ${
      brand
        ? brand === "bmw"
          ? "BMW"
          : brand.charAt(0).toUpperCase() + brand.slice(1)
        : ""
    } Showroom
  </h1>

  <nav>
    <a href="bmw.html">BMW</a> |
    <a href="toyota.html">Toyota</a> |
    <a href="volkswagen.html">Volkswagen</a> |
    <a href="mercedes.html">Mercedes</a>
  </nav>
</header>
`;

document.getElementById("header-placeholder").innerHTML = headerHTML;