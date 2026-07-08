/* ============================================================================
   WVTR — Stripe Checkout function  (runs free on Netlify Functions)
   ----------------------------------------------------------------------------
   Receives the cart from the site, creates a secure Stripe Checkout Session,
   and returns the hosted checkout URL. The shopper is redirected there to pay —
   card details never touch our site (PCI handled by Stripe).

   SECURITY: merch amounts come from Stripe (via the Price ID), NOT from the
   browser, so shoppers can't change prices. Only the donation amount is taken
   from the request, and it is validated to a sane range.

   Requires an environment variable:  STRIPE_SECRET_KEY   (sk_live_… or sk_test_…)
   Set it in Netlify ▸ Site settings ▸ Environment variables. Never commit it.
   ============================================================================ */
const Stripe = require("stripe");

const MAX_DONATION = 100000; // $100,000 safety cap
const MAX_QTY = 100;

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { statusCode: 500, headers, body: JSON.stringify({ error: "Server not configured: STRIPE_SECRET_KEY missing." }) };

  const stripe = Stripe(key);

  let payload;
  try { payload = JSON.parse(event.body || "{}"); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body." }) }; }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const donation = Number(payload.donation) || 0;

  const line_items = [];
  const sizeNotes = [];

  // Merch — trust ONLY the Stripe Price ID + quantity. Amount comes from Stripe.
  for (const it of items) {
    if (!it || typeof it.stripePrice !== "string" || !it.stripePrice.startsWith("price_")) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "A product is not connected to Stripe yet." }) };
    }
    let qty = parseInt(it.quantity, 10) || 1;
    qty = Math.max(1, Math.min(MAX_QTY, qty));
    line_items.push({ price: it.stripePrice, quantity: qty });
    if (it.size) sizeNotes.push((it.name || "Item") + " ×" + qty + " (" + it.size + ")");
  }

  // Donation — dynamic amount, validated.
  if (donation > 0) {
    const cents = Math.round(donation * 100);
    if (cents < 100 || cents > MAX_DONATION * 100) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Donation amount out of range." }) };
    }
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: cents,
        product_data: { name: "Donation — Clean Water" }
      }
    });
  }

  if (line_items.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Cart is empty." }) };
  }

  // Build absolute return URLs from the request origin.
  const origin =
    (event.headers && (event.headers.origin || (event.headers.referer && event.headers.referer.replace(/\/[^/]*$/, "")))) ||
    "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Collect a shipping address for physical merch. Remove if you only sell digital.
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      phone_number_collection: { enabled: false },
      metadata: sizeNotes.length ? { sizes: sizeNotes.join("; ").slice(0, 490) } : {},
      success_url: (origin || "") + "/shop.html?checkout=success",
      cancel_url: (origin || "") + "/shop.html?checkout=cancelled"
    });
    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Stripe error." }) };
  }
};
