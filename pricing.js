(() => {
  // Plan CTA: WhatsApp message carries the chosen plan + platform.
  const updateCta = (card) => {
    const btn = card.querySelector('.plan-cta');
    const picked = card.querySelector('input[type="radio"]:checked');
    if (!btn || !picked) return;
    const price = card.querySelector('.pm');
    const shown = price && currency !== 'PKR' ? ` — shown price ${price.textContent} / month` : '';
    const msg = `Hi AMR.Z! I'm interested in the ${btn.dataset.plan} (${picked.value})${shown}.`;
    btn.href = 'https://wa.me/923019621417?text=' + encodeURIComponent(msg);
  };
  const updateAllCtas = () => document.querySelectorAll('.plan-card').forEach(updateCta);
  document.querySelectorAll('.plan-card').forEach((card) => {
    card.addEventListener('change', () => updateCta(card));
  });

  // Local-currency pricing. Base prices are PKR; the visitor's country is guessed
  // from their device timezone and prices are converted with live exchange rates.
  const CURRENCIES = {
    PKR: 'Pakistani Rupee', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound',
    AED: 'UAE Dirham', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar',
    OMR: 'Omani Rial', BHD: 'Bahraini Dinar', INR: 'Indian Rupee', BDT: 'Bangladeshi Taka',
    CAD: 'Canadian Dollar', AUD: 'Australian Dollar', NZD: 'New Zealand Dollar',
    MYR: 'Malaysian Ringgit', SGD: 'Singapore Dollar', TRY: 'Turkish Lira',
    CNY: 'Chinese Yuan', JPY: 'Japanese Yen', ZAR: 'South African Rand',
  };
  // Backup rates (1 PKR = x), used only if the live rates can't be loaded.
  const FALLBACK = {
    PKR: 1, USD: 0.00357, EUR: 0.00307, GBP: 0.00266, AED: 0.0131, SAR: 0.0134,
    QAR: 0.013, KWD: 0.0011, OMR: 0.00137, BHD: 0.00134, INR: 0.305, BDT: 0.435,
    CAD: 0.0049, AUD: 0.0054, NZD: 0.006, MYR: 0.0155, SGD: 0.0046, TRY: 0.14,
    CNY: 0.0255, JPY: 0.53, ZAR: 0.064,
  };
  const TZ_CURRENCY = {
    'Asia/Karachi': 'PKR', 'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR',
    'Asia/Kuwait': 'KWD', 'Asia/Muscat': 'OMR', 'Asia/Bahrain': 'BHD',
    'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Dhaka': 'BDT',
    'Asia/Kuala_Lumpur': 'MYR', 'Asia/Singapore': 'SGD', 'Asia/Shanghai': 'CNY',
    'Asia/Tokyo': 'JPY', 'Europe/London': 'GBP', 'Europe/Istanbul': 'TRY',
    'Africa/Johannesburg': 'ZAR', 'Pacific/Auckland': 'NZD',
  };
  const EURO_TZ = /^Europe\/(Amsterdam|Athens|Berlin|Bratislava|Brussels|Dublin|Helsinki|Lisbon|Ljubljana|Luxembourg|Madrid|Malta|Monaco|Paris|Riga|Rome|Tallinn|Vienna|Vilnius|Zagreb)$/;
  const CANADA_TZ = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal)$/;

  const guessCurrency = () => {
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (TZ_CURRENCY[tz]) return TZ_CURRENCY[tz];
    if (EURO_TZ.test(tz)) return 'EUR';
    if (CANADA_TZ.test(tz)) return 'CAD';
    if (tz.startsWith('Australia/')) return 'AUD';
    if (tz.startsWith('America/')) return 'USD';
    return 'USD';
  };

  // The visitor's country comes from /api/country (Vercel reads it from the IP address).
  // The timezone guess above is only used until that answer arrives, or if it is unavailable.
  const COUNTRY_CURRENCY = {
    PK: 'PKR', US: 'USD', GB: 'GBP', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', OM: 'OMR', BH: 'BHD',
    IN: 'INR', BD: 'BDT', CA: 'CAD', AU: 'AUD', NZ: 'NZD', MY: 'MYR', SG: 'SGD', TR: 'TRY', CN: 'CNY',
    JP: 'JPY', ZA: 'ZAR',
  };
  const EURO_COUNTRIES = ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR'];
  const fromCountry = (cc) => COUNTRY_CURRENCY[cc] || (EURO_COUNTRIES.indexOf(cc) !== -1 ? 'EUR' : 'USD');

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  let rates = FALLBACK;
  const knownCountry = session.get('amrz-country');
  let currency = knownCountry ? fromCountry(knownCountry) : guessCurrency();
  if (!CURRENCIES[currency]) currency = 'USD';

  // Round converted prices to friendly numbers.
  const nice = (n) => {
    if (n >= 10000) return Math.round(n / 100) * 100;
    if (n >= 1000) return Math.round(n / 10) * 10;
    if (n >= 100) return Math.round(n / 5) * 5;
    return Math.max(1, Math.round(n));
  };
  const fmt = (pkr) => {
    const value = currency === 'PKR' ? pkr : nice(pkr * rates[currency]);
    if (currency === 'PKR') return 'PKR ' + value.toLocaleString('en-US');
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
    } catch (e) { return currency + ' ' + value.toLocaleString('en-US'); }
  };

  const note = document.getElementById('currency-note');

  const render = () => {
    document.querySelectorAll('.plan-price[data-week]').forEach((p) => {
      p.querySelector('.pw').textContent = fmt(+p.dataset.week);
      p.querySelector('.pm').textContent = fmt(+p.dataset.month);
    });
    note.textContent = currency === 'PKR' ? '' : 'Approximate conversion. Billed in PKR at the current rate.';
    updateAllCtas();
  };

  render();

  // Country by IP. Updates the prices if it disagrees with the timezone guess.
  fetch('/api/country', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.country) return;
      const cc = String(d.country).toUpperCase();
      session.set('amrz-country', cc);
      const next = fromCountry(cc);
      if (CURRENCIES[next] && next !== currency) {
        currency = next;
        render();
      }
    })
    .catch(() => {});

  // Live rates, cached for 12 hours.
  const cached = JSON.parse(store.get('amrz-rates') || 'null');
  if (cached && Date.now() - cached.time < 12 * 3600 * 1000) {
    rates = { ...FALLBACK, ...cached.rates };
    render();
  } else {
    fetch('https://open.er-api.com/v6/latest/PKR')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.result === 'success' && d.rates) {
          rates = { ...FALLBACK, ...d.rates };
          store.set('amrz-rates', JSON.stringify({ time: Date.now(), rates: d.rates }));
          render();
        }
      })
      .catch(() => {});
  }
})();
