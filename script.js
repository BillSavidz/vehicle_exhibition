document.addEventListener("DOMContentLoaded", async () => {
  const rateAPI = "https://api.exchangerate.host/latest?base=USD&symbols=GHS";

  try {
    const res = await fetch(rateAPI);
    const data = await res.json();

    let rate = data.rates.GHS + 1; // add $1 to exchange rate
    console.log(`Current adjusted USD→GHS rate: ${rate.toFixed(2)}`);

    // Define USD base cost prices for each model
    const vehicles = {
      bmwi3: { usd: 45000 },
      bmwix: { usd: 56000 },
      bmwix3: { usd: 52000 },
      bmwix1: { usd: 48000 }
    };

    // Update prices dynamically
    Object.keys(vehicles).forEach(model => {
      const usd = vehicles[model].usd;
      const ghsNew = usd * rate;
      const ghsUsed = ghsNew * 0.7; // 30% less for pre-owned

      const newEl = document.getElementById(`${model}-new`);
      const usedEl = document.getElementById(`${model}-used`);

      if (newEl) newEl.textContent = `New: ¢${ghsNew.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
      if (usedEl) usedEl.textContent = `Pre-owned: ¢${ghsUsed.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    });

  } catch (err) {
    console.error("Error fetching exchange rate:", err);
    document.querySelectorAll(".price").forEach(p => p.textContent = "Unavailable");
  }
});
