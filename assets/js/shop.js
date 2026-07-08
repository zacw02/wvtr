/* ============================================================================
   WVTR SHOP — behavior (Stripe, $0/month)
   ----------------------------------------------------------------------------
   • Renders the custom storefront from assets/js/products.js.
   • Runs a real cart (add / qty / remove / subtotal).
   • Checkout: POSTs the cart to the serverless function, which creates a secure
     Stripe Checkout Session; the shopper is redirected to Stripe's hosted,
     PCI-compliant payment page. Card data never touches this site.

   PREVIEW mode (checkoutEndpoint empty, or any item missing its Stripe price):
   everything works except the final charge, which shows a friendly note.
   No frameworks, no build step.
   ============================================================================ */
(function () {
  "use strict";

  var cfg = window.WVTR_SHOP || {};
  var CUR = cfg.currency || "$";
  var PRODUCTS = window.WVTR_PRODUCTS || [];
  var DONATION = window.WVTR_DONATION || { enabled: false };

  var endpoint = cfg.checkoutEndpoint || "";
  var allHavePrices = PRODUCTS.length > 0 && PRODUCTS.every(function (p) { return p.stripePrice; });
  var LIVE = !!endpoint && allHavePrices;

  var grid = document.getElementById("shopGrid");
  var note = document.getElementById("shopNote");

  /* ---------- render product cards ---------- */
  function placeholder(label) {
    return '<div class="placeholder"><span>' + esc(label) + '</span></div>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function productCard(p) {
    var media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" />'
      : placeholder("Photo: " + p.name);
    var badge = p.badge ? '<span class="product-card__badge">' + esc(p.badge) + '</span>' : "";
    var sizeSel = (p.sizes && p.sizes.length)
      ? '<label class="sr-only" for="sz-' + p.id + '">Size</label>' +
        '<select class="size-select" id="sz-' + p.id + '">' +
        p.sizes.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join("") + '</select>'
      : "";
    return '' +
      '<article class="product-card" data-category="' + esc(p.category || "") + '">' +
        '<div class="product-card__media">' + badge + media + '</div>' +
        '<div class="product-card__body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p class="product-card__desc">' + esc(p.desc || "") + '</p>' +
          '<div class="product-card__price">' + CUR + Number(p.price).toFixed(2) + '</div>' +
          '<div class="product-card__row">' + sizeSel +
            '<button class="btn btn--primary add-btn" data-id="' + p.id + '">Add to Cart</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function donationCard() {
    var amts = (DONATION.amounts || []).map(function (a) {
      return '<button data-amt="' + a + '"' + (a === DONATION.defaultAmount ? ' class="is-sel"' : "") + '>' + CUR + a + '</button>';
    }).join("");
    return '' +
      '<article class="product-card product-card--donate" data-category="give">' +
        '<div class="product-card__media"><span class="product-card__badge">Give</span>' + placeholder("100% funds water projects") + '</div>' +
        '<div class="product-card__body">' +
          '<h3>Give Clean Water</h3>' +
          '<p class="product-card__desc">Add a donation to your order — every dollar funds filters, wells, and field work.</p>' +
          '<div class="donate-amounts" role="group" aria-label="Donation amount">' + amts + '</div>' +
          '<div class="product-card__row"><button class="btn btn--primary add-btn" id="donateAdd" data-id="__donation__">Add Donation</button></div>' +
        '</div>' +
      '</article>';
  }

  if (grid) {
    grid.innerHTML = PRODUCTS.map(productCard).join("") + (DONATION.enabled ? donationCard() : "");
  }

  /* ---------- cart ---------- */
  var cart = []; // {id, name, price, size, qty, isDonation}
  var itemsEl = document.getElementById("cartItems");
  var emptyEl = document.getElementById("cartEmpty");
  var subtotalEl = document.getElementById("cartSubtotal");
  var countEl = document.getElementById("cartCount");
  var donationAmount = DONATION.defaultAmount || 0;

  function money(n) { return CUR + n.toFixed(2); }
  function findProduct(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }
  function keyFor(id, size) { return id + "|" + (size || ""); }

  function addToCart(id, size) {
    var line;
    if (id === "__donation__") {
      line = { id: id, name: "Donation — Clean Water", price: donationAmount, size: "", isDonation: true };
    } else {
      var p = findProduct(id); if (!p) return;
      line = { id: id, name: p.name, price: p.price, size: size || "", isDonation: false };
    }
    var k = keyFor(line.id, line.size) + (line.isDonation ? "|" + line.price : "");
    var found = cart.find(function (i) { return keyFor(i.id, i.size) + (i.isDonation ? "|" + i.price : "") === k; });
    if (found) found.qty += 1; else { line.qty = 1; cart.push(line); }
    render(); openCart();
  }
  function changeQty(idx, d) { cart[idx].qty += d; if (cart[idx].qty <= 0) cart.splice(idx, 1); render(); }
  function removeItem(idx) { cart.splice(idx, 1); render(); }

  function render() {
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var subtotal = cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    if (countEl) { countEl.textContent = count; countEl.hidden = count === 0; }
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (!itemsEl) return;
    itemsEl.querySelectorAll(".cart-item").forEach(function (n) { n.remove(); });
    if (cart.length === 0) { if (emptyEl) emptyEl.style.display = ""; return; }
    if (emptyEl) emptyEl.style.display = "none";
    cart.forEach(function (item, idx) {
      var row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<div class="cart-item__thumb" aria-hidden="true"></div>' +
        '<div><div class="cart-item__name"></div>' +
          (item.size ? '<div class="cart-item__meta">Size: ' + esc(item.size) + '</div>' : '') +
          '<div class="cart-item__qty">' +
            '<button aria-label="Decrease quantity" data-act="dec">–</button>' +
            '<span>' + item.qty + '</span>' +
            '<button aria-label="Increase quantity" data-act="inc">+</button>' +
            '<button class="cart-item__remove" data-act="rm">Remove</button>' +
          '</div></div>' +
        '<div class="cart-item__price">' + money(item.qty * item.price) + '</div>';
      row.querySelector(".cart-item__name").textContent = item.name;
      row.querySelector('[data-act="dec"]').addEventListener("click", function () { changeQty(idx, -1); });
      row.querySelector('[data-act="inc"]').addEventListener("click", function () { changeQty(idx, 1); });
      row.querySelector('[data-act="rm"]').addEventListener("click", function () { removeItem(idx); });
      itemsEl.insertBefore(row, itemsEl.firstChild);
    });
  }

  /* ---------- events (delegated so JS-rendered cards work) ---------- */
  if (grid) grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-btn");
    if (btn) {
      var id = btn.getAttribute("data-id");
      var card = btn.closest(".product-card");
      var sel = card ? card.querySelector(".size-select") : null;
      addToCart(id, sel ? sel.value : "");
      return;
    }
    var amt = e.target.closest(".donate-amounts button");
    if (amt) {
      donationAmount = parseFloat(amt.getAttribute("data-amt")) || 0;
      grid.querySelectorAll(".donate-amounts button").forEach(function (x) { x.classList.remove("is-sel"); });
      amt.classList.add("is-sel");
    }
  });

  /* ---------- filters ---------- */
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      document.querySelectorAll(".product-card").forEach(function (card) {
        card.style.display = (f === "all" || card.getAttribute("data-category") === f) ? "" : "none";
      });
    });
  });

  /* ---------- cart drawer open/close ---------- */
  var drawer = document.getElementById("cartDrawer");
  var overlay = document.getElementById("cartOverlay");
  var openBtn = document.getElementById("cartBtn");
  var closeBtn = document.getElementById("cartClose");
  function openCart() { if (!drawer) return; drawer.classList.add("is-open"); overlay.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); }
  function closeCart() { if (!drawer) return; drawer.classList.remove("is-open"); overlay.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); }
  if (openBtn) openBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (overlay) overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  /* ---------- checkout ---------- */
  var checkoutBtn = document.getElementById("cartCheckout");
  var checkoutNote = document.getElementById("checkoutNote");
  if (LIVE && checkoutNote) checkoutNote.textContent = "Secure checkout powered by Stripe.";

  if (checkoutBtn) checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) { openCart(); return; }

    if (!LIVE) {
      openCart();
      if (checkoutNote) {
        checkoutNote.style.color = "#18aaff";
        checkoutNote.textContent = endpoint
          ? "Preview: add each product's Stripe price in products.js to enable checkout."
          : "Preview mode — finish Stripe setup (SHOP-SETUP.md) to take real payments.";
      }
      return;
    }

    // Build a secure payload: product IDs + Stripe price IDs + sizes + donation.
    var lineItems = cart.filter(function (i) { return !i.isDonation; }).map(function (i) {
      var p = findProduct(i.id);
      return { stripePrice: p ? p.stripePrice : "", quantity: i.qty, name: i.name, size: i.size };
    });
    var donationTotal = cart.filter(function (i) { return i.isDonation; })
      .reduce(function (s, i) { return s + i.qty * i.price; }, 0);

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Redirecting…";

    fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lineItems, donation: donationTotal })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.url) { window.location.href = data.url; }
        else { throw new Error(data && data.error ? data.error : "Checkout failed"); }
      })
      .catch(function (err) {
        checkoutBtn.disabled = false; checkoutBtn.textContent = "Checkout";
        if (checkoutNote) { checkoutNote.style.color = "#ff6b6b"; checkoutNote.textContent = "Sorry — checkout couldn't start. " + err.message; }
      });
  });

  /* ---------- preview note visibility ---------- */
  if (note && LIVE) note.remove();

  render();
})();
