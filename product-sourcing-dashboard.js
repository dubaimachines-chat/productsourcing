const state = {
  currentSku: "SM7B",
  currentBrand: "Shure",
  results: [],
  outreach: [],
  quotes: [
    { vendor: "Dubai AV Trading", contact: "+971 50 000 2211", price: "AED 1,740", lead: "2 days", status: "Phone quoted" },
    { vendor: "Gulf Pro Audio", contact: "sales@gulfpro.example", price: "AED 1,690", lead: "4 days", status: "Email pending" },
    { vendor: "Local distributor", contact: "+971 4 000 1188", price: "AED 1,825", lead: "Ready stock", status: "Confirmed" }
  ]
};

const sourceLabels = {
  audio: ["Google.ae", "Local UAE sellers", "Official product pages", "Priced exact landing pages"],
  golf: ["Google.ae", "Local UAE sellers", "Official product pages", "Priced exact landing pages"],
  industrial: ["Google.ae", "Local UAE sellers", "Official product pages", "Priced exact landing pages"],
  general: ["Google.ae", "Local UAE sellers", "Official product pages", "Priced exact landing pages"]
};

const knownExactLocalMatches = [
  {
    keywords: ["cassida", "xpecto lite"],
    skus: ["xpecto lite"],
    rows: [
      {
        source: "Google.ae local",
        supplier: "Cassida Middle East",
        currency: "AED",
        base: 1400,
        lead: "Local seller",
        match: "Exact",
        confidence: 96,
        productUrl: "https://cassida.me/products/xpecto-lite-single",
        evidence: "Exact product landing page from Cassida Middle East"
      },
    ]
  },
  {
    keywords: ["hp", "m521dn"],
    skus: ["m521dn"],
    rows: [
      {
        source: "Google.ae shopping",
        supplier: "Desertcart.ae",
        currency: "AED",
        base: 4242,
        lead: "Local listing",
        condition: "Used",
        match: "Local exact candidate",
        confidence: 88,
        productUrl: "https://www.google.ae/search?q=HP%20LaserJet%20Pro%20MFP%20M521dn%20A8P79A%20Desertcart.ae",
        evidence: "Google.ae shows exact title: HP LaserJet Pro MFP M521dn Printer (A8P79A), AED 4,242, Desertcart.ae"
      },
      {
        source: "Google.ae shopping",
        supplier: "eBay",
        currency: "AED",
        base: 2204,
        lead: "International listing",
        condition: "Renewed",
        match: "Local exact candidate",
        confidence: 82,
        productUrl: "https://www.google.ae/search?q=HP%20LaserJet%20Pro%20MFP%20M521dn%20renewed%20eBay",
        evidence: "Google.ae shows exact M521dn title from eBay, renewed, AED 2,203.73 plus possible charges"
      },
    ]
  },
  {
    keywords: ["samsung", "qm32r-t"],
    skus: ["qm32r-t"],
    rows: [
      {
        source: "Google.ae shopping",
        supplier: "Gear-up.me",
        currency: "AED",
        base: 6503,
        lead: "Local listing",
        condition: "New",
        match: "Local exact candidate",
        confidence: 91,
        productUrl: "https://www.google.ae/search?q=Samsung%20QM32R-T%2032-inch%20Interactive%20Display%20Gear-up.me",
        evidence: "Google.ae shows exact model QM32R-T with AED 6,503 from Gear-up.me"
      },
      {
        source: "Google.ae shopping",
        supplier: "Desertcart.ae",
        currency: "AED",
        base: 8160,
        lead: "Local listing",
        condition: "New",
        match: "Local exact candidate",
        confidence: 90,
        productUrl: "https://www.google.ae/search?q=Samsung%20QM32R-T%2032%20FHD%20Touch%20Desertcart.ae",
        evidence: "Google.ae shows exact model QM32R-T 32 FHD Touch with AED 8,160 from Desertcart.ae"
      },
      {
        source: "Google.ae shopping",
        supplier: "DubaiMachines.com",
        currency: "AED",
        base: 3388,
        lead: "Local listing",
        condition: "New",
        match: "Local exact candidate",
        confidence: 87,
        productUrl: "https://www.google.ae/search?q=Samsung%20QM32R-T%2032%20Touch%20DubaiMachines.com",
        evidence: "Google.ae shows exact model QM32R-T with AED 3,388 from DubaiMachines.com"
      }
    ]
  },
  {
    keywords: ["shure", "sm7b"],
    skus: ["sm7b"],
    rows: [
      {
        source: "International seller",
        supplier: "Sweetwater",
        currency: "USD",
        base: 399,
        lead: "Check seller page",
        condition: "New",
        match: "Exact",
        confidence: 96,
        productUrl: "https://www.sweetwater.com/store/detail/SM7B--shure-sm7b-cardioid-dynamic-vocal-microphone",
        evidence: "Exact Shure SM7B product landing page with listed price"
      },
      {
        source: "International seller",
        supplier: "B&H Photo",
        currency: "USD",
        base: 399,
        lead: "Check seller page",
        condition: "New",
        match: "Exact",
        confidence: 94,
        productUrl: "https://www.bhphotovideo.com/c/product/68436-REG/Shure_SM7B_SM7B_Cardioid_Dynamic_Microphone.html",
        evidence: "Exact Shure SM7B product landing page with listed price"
      },
      {
        source: "International seller",
        supplier: "Thomann",
        currency: "EUR",
        base: 399,
        lead: "Check seller page",
        condition: "New",
        match: "Exact",
        confidence: 90,
        productUrl: "https://www.thomann.de/intl/shure_sm_7b_studiomikro.htm",
        evidence: "Exact Shure SM7B product landing page; open seller page before final quote"
      }
    ]
  }
];

const currencySymbols = {
  AED: "AED",
  USD: "$",
  EUR: "€",
  JPY: "¥"
};

function money(currency, amount) {
  if (currency === "AED") return `AED ${amount.toLocaleString()}`;
  return `${currencySymbols[currency] || currency} ${amount.toLocaleString()}`;
}

function aed(amount) {
  return `AED ${Math.round(amount).toLocaleString()}`;
}

function converterRate(currency) {
  if (currency === "AED") return 1;
  const input = document.getElementById(`rate${currency}`);
  return Number(input?.value) || 1;
}

function convertToAed(amount, currency) {
  if (currency === "AED") return amount;
  const bufferedRate = converterRate(currency) * 1.05;
  return amount * bufferedRate;
}

function detectCategory(brand, sku, notes) {
  const text = `${brand} ${sku} ${notes}`.toLowerCase();

  if (/(shure|sennheiser|yamaha|audio|microphone|speaker|mixer|sweetwater)/.test(text)) {
    return "audio";
  }

  if (/(fujikura|ventus|speeder|golf|shaft|driver shaft|fairway)/.test(text)) {
    return "golf";
  }

  if (/(siemens|allen[- ]?bradley|schneider|omron|plc|sensor|contactor|6es|industrial|automation)/.test(text)) {
    return "industrial";
  }

  return "general";
}

function localExactMatches(brand, sku) {
  const text = `${brand} ${sku}`.toLowerCase();
  const cleanSku = sku.trim().toLowerCase();
  const found = knownExactLocalMatches.find(group => {
    const skuMatched = group.skus?.some(item => item === cleanSku);
    const keywordMatched = group.keywords.every(keyword => text.includes(keyword));
    return skuMatched || keywordMatched;
  });
  return found ? found.rows : [];
}

function matchText(match, brand, sku) {
  if (match === "Exact") return `${brand} ${sku} verified on exact product landing page`;
  if (match === "Local exact candidate") return `${brand} ${sku} exact local price candidate from Google.ae`;
  return `${brand} ${sku} exact priced result`;
}

function sourceSearchUrl(source, brand, sku) {
  const query = encodeURIComponent(`${brand} ${sku}`.trim());
  const sourceName = source.toLowerCase();

  if (sourceName.includes("google.ae")) return `https://www.google.ae/search?q=${query}`;
  if (sourceName.includes("sweetwater")) return `https://www.sweetwater.com/store/search?s=${query}`;
  if (sourceName.includes("ebay")) return `https://www.ebay.com/sch/i.html?_nkw=${query}`;
  if (sourceName.includes("amazon jp")) return `https://www.amazon.co.jp/s?k=${query}`;
  if (sourceName.includes("amazon de")) return `https://www.amazon.de/s?k=${query}`;
  if (sourceName.includes("amazon")) return `https://www.amazon.com/s?k=${query}`;
  if (sourceName.includes("alibaba")) return `https://www.alibaba.com/trade/search?SearchText=${query}`;
  if (sourceName.includes("rakuten")) return `https://search.rakuten.co.jp/search/mall/${query}/`;
  if (sourceName.includes("made-in-china")) return `https://www.made-in-china.com/products-search/hot-china-products/${query}.html`;

  return `https://www.google.com/search?q=${query}`;
}

function renderSourceTags(category) {
  document.getElementById("sourceTags").innerHTML = sourceLabels[category]
    .map(source => `<span>${source}</span>`)
    .join("");
}

function buildResults(formData) {
  const qty = Number(formData.get("quantity")) || 1;
  const brand = formData.get("brand") || "Unknown brand";
  const sku = formData.get("sku") || "Unknown SKU";
  const notes = formData.get("notes") || "";
  const category = detectCategory(brand, sku, notes);
  renderSourceTags(category);

  const resultRows = localExactMatches(brand, sku);

  return resultRows
    .filter(item => item.base && (item.match === "Exact" || item.match === "Local exact candidate"))
    .map((item, index) => {
      const qtyDiscount = qty >= 10 ? 0.92 : qty >= 5 ? 0.96 : 1;
      const adjusted = item.base ? Math.round(item.base * qtyDiscount) : null;
      const hasVerifiedPrice = item.match === "Exact" && item.productUrl && adjusted;
      const hasLocalCandidatePrice = item.match === "Local exact candidate" && adjusted;
      const displayPrice = hasVerifiedPrice || hasLocalCandidatePrice;
      return {
        ...item,
        id: `${item.source}-${index}`,
        sku,
        brand,
        amount: adjusted,
        price: displayPrice ? money(item.currency, adjusted) : "Not quoted",
        aedPrice: displayPrice ? aed(convertToAed(adjusted, item.currency)) : "Verify first",
        aedRate: hasVerifiedPrice ? (converterRate(item.currency) * 1.05).toFixed(4) : "",
        verifyUrl: item.productUrl || sourceSearchUrl(item.source, brand, sku),
        verifiedPrice: Boolean(hasVerifiedPrice),
        localCandidatePrice: Boolean(hasLocalCandidatePrice),
        evidence: item.evidence || (hasVerifiedPrice ? "Exact product landing page" : "Search result only"),
        note: matchText(item.match, brand, sku)
      };
    });
}

function renderSummary() {
  const exactCount = state.results.filter(item => item.match === "Exact" && item.productUrl).length;
  const localCandidateCount = state.results.filter(item => item.localCandidatePrice).length;
  const verifiedRows = state.results.filter(item => item.verifiedPrice || item.localCandidatePrice);
  const best = [...verifiedRows].sort((a, b) => convertToAed(a.amount, a.currency) - convertToAed(b.amount, b.currency))[0] || {};
  const fastest = [...verifiedRows].sort((a, b) => Number.parseInt(a.lead) - Number.parseInt(b.lead))[0] || {};
  const cards = [
    ["Exact matches", String(exactCount)],
    ["Local candidates", String(localCandidateCount)],
    ["Best AED price", best.aedPrice || "No verified price"],
    ["Fastest lead time", fastest.lead || "No verified lead time"]
  ];

  document.getElementById("summaryCards").innerHTML = cards.map(([label, value]) => `
    <div class="summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderResults() {
  const tbody = document.getElementById("resultsBody");
  const rows = state.results;

  if (!rows.length) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">No exact part-number results with pricing found in the current data. Try another SKU/brand or connect live Google.ae/vendor search.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(item => `
    <tr>
      <td><span class="match-pill ${item.match.toLowerCase().replaceAll(" ", "-")}">${item.match}</span></td>
      <td>
        <strong>${item.source}</strong><br>
        <span class="muted">${item.note}</span>
        <span class="evidence-note">${item.evidence}</span>
      </td>
      <td>${item.supplier}</td>
      <td>
        <strong>${item.aedPrice}</strong><br>
        <span class="muted">${item.verifiedPrice ? `${item.price}${item.currency === "AED" ? " local price" : ` · rate ${item.aedRate}`}` : item.localCandidatePrice ? `${item.price} seen on Google.ae; open seller page to confirm` : "No price until exact landing page is verified"}</span>
      </td>
      <td>${item.lead}</td>
      <td><a class="verify-link" href="${item.verifyUrl}" target="_blank" rel="noopener">${item.verifiedPrice ? "Product page" : item.localCandidatePrice ? "Check seller" : "Search link"}</a></td>
      <td>
        <div class="confidence" aria-label="${item.confidence}% confidence"><span style="width:${item.confidence}%"></span></div>
        <span class="muted">${item.confidence}%</span>
      </td>
      <td><button class="row-action" type="button" data-enquire="${item.id}">Draft enquiry</button></td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-enquire]").forEach(button => {
    button.addEventListener("click", () => addOutreach(button.dataset.enquire));
  });
}

function renderQuotes() {
  document.getElementById("quotesBody").innerHTML = state.quotes.map(item => `
    <tr>
      <td><strong>${item.vendor}</strong></td>
      <td>${item.contact}</td>
      <td>${item.price}</td>
      <td>${item.lead}</td>
      <td>${item.status}</td>
    </tr>
  `).join("");
}

function draftMessage(item) {
  return `Hello,

We are looking for your best offer for the following item:

Part number: ${item.sku}
Brand: ${item.brand}
Quantity: ${document.getElementById("quantity").value}
Delivery country: UAE

Please confirm:
- Best unit price
- Stock availability
- Lead time
- MOQ
- Shipping cost to UAE and ex-works option
- Whether the item is original, new and unused

Kindly share datasheet, product photos and quotation validity.

Regards,
Procurement Team`;
}

function addOutreach(id) {
  const item = state.results.find(result => result.id === id);
  if (!item) return;

  if (!state.outreach.some(existing => existing.id === id)) {
    state.outreach.push({ ...item, draft: draftMessage(item) });
  }

  renderOutreach();
  showToast(`Draft prepared for ${item.supplier}. Review before sending.`);
}

function renderOutreach() {
  const list = document.getElementById("outreachList");

  if (!state.outreach.length) {
    list.innerHTML = `<div class="draft"><strong>No supplier drafts yet.</strong><span class="muted">Choose “Draft enquiry” from search results to prepare a message.</span></div>`;
    return;
  }

  list.innerHTML = state.outreach.map(item => `
    <article class="draft">
      <div>
        <strong>${item.supplier}</strong>
        <span class="muted"> via ${item.source} · ${item.match} match · ${item.confidence}% confidence</span>
      </div>
      <textarea>${item.draft}</textarea>
      <div class="draft-actions">
        <button type="button" data-copy="${item.id}">Copy draft</button>
        <button type="button" data-approve="${item.id}">Mark approved</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const card = button.closest(".draft");
      const text = card.querySelector("textarea").value;
      await navigator.clipboard.writeText(text);
      showToast("Enquiry draft copied.");
    });
  });

  document.querySelectorAll("[data-approve]").forEach(button => {
    button.addEventListener("click", () => {
      showToast("Marked approved. In production this would send through the approved channel.");
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function switchTab(id) {
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.tab === id));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === id));
}

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.currentSku = formData.get("sku");
  state.currentBrand = formData.get("brand");
  state.results = buildResults(formData);
  renderSummary();
  renderResults();
  showToast(`Deep search completed for ${state.currentSku}.`);
});

document.getElementById("addQuote").addEventListener("click", () => {
  state.quotes.unshift({
    vendor: "New local vendor",
    contact: "Add contact",
    price: "AED -",
    lead: "Pending",
    status: "To call"
  });
  renderQuotes();
  showToast("Local quote row added.");
});

function recalculateRates() {
    state.results = buildResults(new FormData(document.getElementById("searchForm")));
    renderSummary();
    renderResults();
    showToast("AED prices recalculated with 5% buffer.");
}

document.querySelectorAll("#rateUSD, #rateEUR, #rateJPY").forEach(input => {
  input.addEventListener("input", recalculateRates);
  input.addEventListener("change", recalculateRates);
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

state.results = buildResults(new FormData(document.getElementById("searchForm")));
renderSummary();
renderResults();
renderQuotes();
renderOutreach();
