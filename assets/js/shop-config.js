/* ============================================================================
   WVTR SHOP — CONFIGURATION  (Stripe, $0/month)
   ----------------------------------------------------------------------------
   The store runs on Stripe. There is NO monthly fee — you only pay Stripe's
   per-transaction rate (and as a 501(c)(3) you can apply for the lower
   nonprofit rate). Full walkthrough in SHOP-SETUP.md.

   checkoutEndpoint — the URL of the small, free serverless function that
   securely creates the Stripe checkout. Set it after you deploy:
     • Vercel:  /api/create-checkout
     • Netlify: /.netlify/functions/create-checkout

   Leave it "" to keep the store in safe PREVIEW mode (sample products, working
   cart, no real charges) — perfect for just previewing the site's look.
   ============================================================================ */
window.WVTR_SHOP = {
  checkoutEndpoint: "",   // e.g. "/.netlify/functions/create-checkout"
  currency: "$"
};
