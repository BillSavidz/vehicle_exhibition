async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("header-placeholder", "header.html");
  await loadComponent("footer-placeholder", "footer.html");

  // Set dynamic page title
  const page = window.location.pathname.split("/").pop().split(".")[0];
  const titleMap = {
    bmw: "BMW Showroom",
    toyota: "Toyota Showroom",
    volkswagen: "Volkswagen Showroom",
    mercedes: "Mercedes Showroom"
  };

  const pageTitle = document.getElementById("page-title");
  if (pageTitle && titleMap[page]) {
    pageTitle.textContent = titleMap[page];
  }

  // Set dynamic year
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
