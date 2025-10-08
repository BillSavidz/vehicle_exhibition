document.addEventListener('DOMContentLoaded', async () => {
  const cards = document.querySelectorAll('.vehicle-card');

  // Fetch the latest USD→GHS rate
  let rate;
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=GHS');
    const data = await res.json();
    rate = data.rates.GHS + 1; // Add $1 to the exchange rate
  } catch (err) {
    console.error('Error fetching exchange rate:', err);
    rate = 16; // fallback value
  }

  // Update GHS prices and make cards clickable
  cards.forEach(card => {
    const usd = parseFloat(card.dataset.usd);
    const ghs = (usd * rate).toFixed(2);
    card.querySelector('.price-ghs').textContent = `GHS ${ghs}`;

    // Open YouTube video when clicked
    const video = card.dataset.video;
    card.addEventListener('click', () => window.open(video, '_blank'));
  });
});
