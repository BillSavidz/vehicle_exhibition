document.addEventListener("DOMContentLoaded", async () => {
  const rateAPI = "https://api.exchangerate.host/latest?base=USD&symbols=GHS";
  const cacheKey = "usd_to_ghs_rate";
  const cacheTimeKey = "usd_to_ghs_rate_time";
  const CACHE_DURATION_HOURS = 24; // refresh daily

  async function fetchExchangeRate() {
    try {
      const response = await fetch(rateAPI);
      if (!response.ok) throw new Error("Network response error");
      const data = await response.json();
      const rawRate = data.rates.GHS;
      const adjustedRate = rawRate + 1; // add $1 to the rate per your rule

      // cache it
      localStorage.setItem(cacheKey, adjustedRate);
      localStorage.setItem(cacheTimeKey, Date.now());
      console.log(`Fetched new rate: ${adjustedRate.toFixed(2)}`);
      return adjustedRate;
    } catch (error) {
      console.warn("Could not fetch live rate, using cached or fallback:", error);
      const cachedRate = localStorage.getItem(cacheKey);
      if (cachedRate) {
        console.log(`Using cached rate: ${parseFloat(cachedRate).toFixed(2)}`);
        return parseFloat(cachedRate);
      } else {
        console.log("No cache available — defaulting to 16.0 GHS/USD");
        return 16.0; // fallback
      }
    }
  }

  function isCacheValid() {
    const savedTime = localStorage.getItem(cacheTimeKey);
    if (!savedTime) return false;
    const elapsedHours = (Date.now() - parseInt(savedTime, 10)) / (1000 * 60 * 60);
    return elapsedHours < CACHE_DURATION_HOURS;
  }

  async function getRate() {
    if (isCacheValid()) {
      const cachedRate = parseFloat(localStorage.getItem(cacheKey));
      console.log(`Using cached valid rate: ${cachedRate.toFixed(2)}`);
      return cachedRate;
    } else {
      return await fetchExchangeRate();
    }
  }

  // Run the dynamic pricing update
  const rate = await getRate();

  // Base cost in USD for each model
  const vehicles = {
    bmwi3: { usd: 45000 },
    bmwix: { usd: 56000 },
    bmwix3: { usd: 52000 },
    bmwix1: { usd: 48000 }
  };

  Object.keys(vehicles).forEach(model => {
    const usd = vehicles[model].usd;
    const ghsNew = usd * rate;
    const ghsUsed = ghsNew * 0.7; // pre-owned discount (30%)

    const newEl = document.getElementById(`${model}-new`);
    const usedEl = document.getElementById(`${model}-used`);

    if (newEl) newEl.textContent = `New: ¢${ghsNew.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (usedEl) usedEl.textContent = `Pre-owned: ¢${ghsUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  });
});
