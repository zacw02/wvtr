/* ============================================================================
   WVTR SHOP — PRODUCT CATALOG
   ----------------------------------------------------------------------------
   This is the ONE place to manage what's in the store. Add, edit, or remove
   products here (or just ask Claude: "add a product…").

   Each product:
     id        unique short slug (no spaces)
     name      display name
     desc      one-line description
     price     display price in dollars (number) — for showing only
     category  "apparel" | "accessories"  (matches the filter chips)
     badge     small corner label, or "" for none
     sizes     array of sizes, or [] if none
     image     path to a photo in assets/img/, or "" for a styled placeholder
     stripePrice  the Stripe Price ID (starts with "price_"). Leave "" until you
                  create the product in Stripe — the store shows it in PREVIEW
                  until every item has a real Stripe price and checkout is set up.

   SECURITY NOTE: the amount actually charged always comes from Stripe using the
   stripePrice ID — never from the "price" field here — so display prices can't
   be tampered with by shoppers.
   ============================================================================ */
window.WVTR_PRODUCTS = [
  {
    id: "clean-water-tee",
    name: "Clean Water Tee",
    desc: "Soft cotton tee with the WVTR wave mark. Unisex fit.",
    price: 28, category: "apparel", badge: "Best Seller",
    sizes: ["S", "M", "L", "XL", "2XL"],
    image: "", stripePrice: ""
  },
  {
    id: "wave-hoodie",
    name: "Wave Hoodie",
    desc: "Heavyweight hoodie, blue wave linework across the back.",
    price: 55, category: "apparel", badge: "",
    sizes: ["S", "M", "L", "XL", "2XL"],
    image: "", stripePrice: ""
  },
  {
    id: "flash-sticker-pack",
    name: "Flash Sticker Pack",
    desc: "Five weatherproof vinyl stickers — wave, drop, and flash designs.",
    price: 12, category: "accessories", badge: "New",
    sizes: [], image: "", stripePrice: ""
  },
  {
    id: "enamel-pin",
    name: "Water Drop Enamel Pin",
    desc: "Hard enamel pin of the WVTR linework drop. Blue on black.",
    price: 10, category: "accessories", badge: "",
    sizes: [], image: "", stripePrice: ""
  },
  {
    id: "wave-dad-cap",
    name: "Wave Dad Cap",
    desc: "Embroidered wave mark on a structured cap. One size.",
    price: 26, category: "apparel", badge: "",
    sizes: [], image: "", stripePrice: ""
  }
];

/* Donation option that lives inside the store (in addition to DonorBox on the
   home page). Amounts are preset buttons; the charge is created securely at
   checkout. No Stripe price needed — donations use a dynamic amount. */
window.WVTR_DONATION = {
  enabled: true,
  amounts: [10, 25, 50, 100],
  defaultAmount: 25
};
