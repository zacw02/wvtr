/* ============================================================================
   WVTR — Stripe Checkout function  (Vercel Serverless Function, free tier)
   ----------------------------------------------------------------------------
   Vercel automatically turns files in /api into serverless endpoints, so this
   is reachable at:  /api/create-checkout

   Same job & security model as the Netlify version:
     • Creates a secure Stripe Checkout Session and returns the hosted URL.
     • Merch amounts come from Stripe (via the Price ID), never the browser.
     • The donation amount is taken from the request and validated.

   Requires an environment variable in Vercel:  STRIPE_SECRET_KEY
   (Vercel ▸ Project ▸ Settings ▸ Environment Variables). Never commit it.

   NOTE: you only need this for LIVE payments. To just preview the site's look,
   deploy without it — the store runs in Preview mode and never calls this.
   ============================================================================ */
const Stripe = require("stripe");

const MAX_DONATION = 100000; // $100,000 safety cap
const MAX_QTY = 100;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: "Server not configured: STRIPE_SECRET_KEY missing." });

  const stripe = Stripe(key);

  // Vercel usually parses JSON bodies, but handle a raw string just in case.
  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload || "{}"); } catch (e) { payload = {}; } }
  payload = payload || {};

  const items = Array.isArray(payload.items) ? payload.items : [];
  const donation = Number(payload.donation) || 0;

  const line_items = [];
  const sizeNotes = [];

  for (const it of items) {
    if (!it || typeof it.stripePrice !== "string" || !it.stripePrice.startsWith("price_")) {
      return res.status(400).json({ error: "A product is not connected to Stripe yet." });
    }
    let qty = parseInt(it.quantity, 10) || 1;
    qty = Math.max(1, Math.min(MAX_QTY, qty));
    line_items.push({ price: it.stripePrice, quantity: qty });
    if (it.size) sizeNotes.push((it.name || "Item") + " x" + qty + " (" + it.size + ")");
  }

  if (donation > 0) {
    const cents = Math.round(donation * 100);
    if (cents < 100 || cents > MAX_DONATION * 100) {
      return res.status(400).json({ error: "Donation amount out of range." });
    }
    line_items.push({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: cents, product_data: { name: "Donation — Clean Water" } }
    });
  }

  if (line_items.length === 0) return res.status(400).json({ error: "Cart is empty." });

  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const origin = host ? proto + "://" + host : "";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      metadata: sizeNotes.length ? { sizes: sizeNotes.join("; ").slice(0, 490) } : {},
      success_url: origin + "/shop.html?checkout=success",
      cancel_url: origin + "/shop.html?checkout=cancelled"
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Stripe error." });
  }
};
