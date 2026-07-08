# Shop Setup — Selling with Stripe (no monthly fee)

The store runs on **Stripe**. There is **no monthly subscription** — you only pay
Stripe's per-transaction rate, and as a registered 501(c)(3) you can apply for
Stripe's **lower nonprofit rate**. The storefront design stays exactly as built;
Stripe just handles the money.

**What you pay:** standard **2.9% + 30¢** per card charge. After nonprofit
approval, **2.2% + 30¢** (see Step 5). No setup fee, no monthly fee.

The store ships in **Preview mode** (sample products, working cart, no real
charges) until the steps below are done.

> **Security boundary:** Claude can build and wire all of this, but *cannot*
> create your Stripe account or enter your secret keys — payment providers
> require the business owner to do that personally. Those steps are marked
> **(you do this)**.

---

## How it works (30-second version)

1. Your products live in one file, `assets/js/products.js` (or ask Claude to edit it).
2. Each product is linked to a **Stripe Price** you create in Stripe.
3. When someone checks out, a tiny free function (`netlify/functions/create-checkout.js`)
   asks Stripe to create a secure checkout page and sends the shopper there to pay.
4. Card details never touch the site — Stripe handles all of that.

---

## Step 1 — Create a Stripe account  *(you do this)*

1. Sign up at [stripe.com](https://stripe.com) and complete business verification.
2. Connect your bank account (Stripe ▸ **Settings ▸ Bank accounts and currencies**)
   so payouts can be deposited.
3. Grab your **Secret key**: Stripe ▸ **Developers ▸ API keys** ▸ *Secret key*
   (starts with `sk_live_…`; use `sk_test_…` while testing). Keep it private —
   it is the one value that must never go in the website files or git.

## Step 2 — Add your products in Stripe  *(you do this, or ask Claude)*

For each item: Stripe ▸ **Products ▸ Add product** → name, image, price → save.
Open the product and copy its **Price ID** (starts with `price_…`).

> With the **Stripe connector** enabled in Claude, you can instead say:
> *"Add a product: Wave Hoodie, $55, and give me the price ID."* Claude creates
> it in your Stripe account and can drop the ID straight into `products.js`.

## Step 3 — Put the products in the store

Open `assets/js/products.js` and, for each product, fill in `stripePrice` with the
Price ID from Step 2 (and edit name/price/sizes/photo as needed):

```js
{ id: "wave-hoodie", name: "Wave Hoodie", desc: "…", price: 55,
  category: "apparel", sizes: ["S","M","L","XL","2XL"],
  image: "assets/img/hoodie.jpg", stripePrice: "price_123ABC" }
```

Add a product by copying a block; remove one by deleting its block. (Or just ask
Claude to do it.)

## Step 4 — Deploy the site free (hosting + checkout function)

The checkout needs to run somewhere. Both **Vercel** and **Netlify** have free
tiers that host the site *and* the serverless function together at no cost. The
project is set up for either. **You only need the `STRIPE_SECRET_KEY` step below
for live payments — to just preview the site's look, skip it and deploy as-is.**

### Option A — Vercel (recommended, fastest to preview)

1. From this folder, run:
   ```bash
   npx vercel
   ```
   It opens your browser to log in / create a free Vercel account *(you do this)*
   and then gives you a live URL in under a minute. Run `npx vercel --prod` for the
   production URL. (You can also use the Vercel dashboard ▸ **Add New ▸ Project**
   and import the folder from GitHub.)
2. **For live payments only:** Vercel ▸ Project ▸ **Settings ▸ Environment
   Variables** → add `STRIPE_SECRET_KEY = sk_live_…` *(you do this)*, then redeploy.
3. Your checkout function is live at `/api/create-checkout`. Set it in
   `assets/js/shop-config.js`:
   ```js
   window.WVTR_SHOP = { checkoutEndpoint: "/api/create-checkout", currency: "$" };
   ```

### Option B — Netlify

1. Create a free account at [netlify.com](https://www.netlify.com) *(you do this)*.
2. Push this folder to a GitHub repo and “Import from Git” (drag-and-drop alone
   won't include the function).
3. Netlify ▸ **Site settings ▸ Environment variables** → add
   `STRIPE_SECRET_KEY = sk_live_…` *(you do this)*.
4. Function lives at `/.netlify/functions/create-checkout`; set that as the
   `checkoutEndpoint` in `assets/js/shop-config.js`.

Once deployed with the key set and the endpoint filled in, the “Preview” note
disappears and **Checkout** sends shoppers to a real, secure Stripe payment page.

> Just want to see the design first? Deploy with either option and skip the
> `STRIPE_SECRET_KEY` — the store shows in Preview mode. Add Stripe when ready.

## Step 5 — Apply for the nonprofit rate  *(you do this)*

Email **nonprofit@stripe.com** from your Stripe account with your **EIN** or IRS
501(c)(3) letter and a note that you're a registered nonprofit. Approved accounts
get **2.2% + 30¢** instead of 2.9% + 30¢. It's not retroactive, so apply early.
(Note: this discount is aimed at donation-heavy volume; merch sales may stay at
the standard rate — Stripe decides on review.)

## Step 6 — Test before launch

1. Use your **test** secret key (`sk_test_…`) and Stripe's test card `4242 4242
   4242 4242`, any future date, any CVC.
2. Add to cart → Checkout → complete the test payment.
3. Confirm the order shows in Stripe ▸ **Payments**. Then switch to the live key.

---

## Donations (your "match the store" choice)

Donations run through the **same Stripe checkout**. The "Give Clean Water" card in
the store adds a donation to any order; the amount is created securely at checkout
(no product needed). Prefer separate donation amounts or a recurring option? Ask
Claude — Stripe supports both. The existing DonorBox embed on the home page can
stay or be removed; your call.

---

## What lives where

| Thing | Where |
|-------|-------|
| Store design / layout | `shop.html` + `assets/css/styles.css` |
| Product catalog (edit here) | `assets/js/products.js` |
| Go-live setting (checkout URL) | `assets/js/shop-config.js` |
| Cart + checkout behavior | `assets/js/shop.js` |
| Secure checkout function | `netlify/functions/create-checkout.js` |
| Hosting + function config | `netlify.toml`, `package.json` |
| Secret key | Netlify env var only — never in files |
| Payments, payouts, refunds, orders | your Stripe dashboard |

Stuck anywhere? Tell Claude where you are and it'll walk you through it or make
the change for you.
