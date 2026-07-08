# WVTR Website

A fast, accessible, mobile-first website for WVTR — a registered 501(c)(3)
nonprofit bringing clean drinking water to underserved communities.

This site is built with plain **HTML, CSS, and JavaScript** — no frameworks,
no build step, no database. That makes it cheap to host, fast to load, secure,
and easy to update through Claude.

---

## Files at a glance

```
wvtr-site/
├── index.html                       ← Home page (one scrolling page)
├── shop.html                        ← The storefront (products + cart)
├── assets/
│   ├── css/styles.css               ← All design & layout
│   ├── js/main.js                   ← Menu, animations, interactions
│   ├── js/products.js               ← The product catalog (edit here)
│   ├── js/shop.js                   ← Store cart + Stripe checkout
│   ├── js/shop-config.js            ← One setting to go live (checkout URL)
│   └── img/                         ← Logo, wave art, sunburst (drawn in code)
├── api/create-checkout.js           ← Secure Stripe checkout (Vercel serverless)
├── netlify/functions/create-checkout.js  ← Same, for Netlify (either host works)
├── vercel.json, netlify.toml, package.json  ← Free hosting + function config
├── README.md                        ← You are here
├── EDITING-GUIDE.md                 ← "How do I change X?" guide
└── SHOP-SETUP.md                    ← Turn the store live (Stripe, no monthly fee)
```

### The store

There's a full storefront at `shop.html` — product grid, categories, a real cart,
and a donation option. It runs on **Stripe with no monthly fee** (you only pay
per-transaction; 501(c)(3)s can apply for Stripe's lower nonprofit rate). It ships
in **Preview mode** (sample products, working cart, no charges) so you can see it.

Products live in one file, `assets/js/products.js` — edit it or ask Claude ("add
a product…"). Checkout uses Stripe's secure hosted payment page via a small
serverless function that runs **free** on Netlify, so card data never touches the
site. Full walkthrough in **SHOP-SETUP.md**. Donations run through the same Stripe
checkout; the DonorBox embed on the home page can stay or go.

Everything a person would want to change — the words on the page, the menu
items, the colors, the donate button — is clearly labeled with comments inside
these files. See **EDITING-GUIDE.md** for step-by-step instructions.

---

## How to make changes (the easy way)

Just ask Claude. For example:

- "Change the hero headline to '…'."
- "Add a new completed project in Kenya to the Our Work section."
- "Update the team section with these three people and their bios."
- "Make the donate button green instead of gold."
- "Swap in the real Ethiopia photo — here's the file."

Claude edits the files and gives you back the updated site.

---

## How to preview it locally

Open `index.html` in any web browser (double-click it). That's it — no server
required. For a closer-to-production preview you can run a tiny local server:

```bash
cd wvtr-site
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## How to publish it (hosting)

Because it's a static site, hosting is simple and usually free. Good options:

| Host             | Cost        | How |
|------------------|-------------|-----|
| **Netlify**      | Free tier   | Drag-and-drop the `wvtr-site` folder onto app.netlify.com/drop |
| **Cloudflare Pages** | Free    | Connect a GitHub repo or upload the folder |
| **GitHub Pages** | Free        | Push to a repo, enable Pages in settings |
| **Existing host**| —           | Upload the folder's contents via FTP to the web root |

To keep the current domain (**wvtr.org**), point the domain's DNS at whichever
host you choose. Ask Claude to walk you through the specific steps for your host.

---

## A few things to finish before going live

These are marked with `(update…)` notes right in the code:

1. **Contact details** — real email, phone, and location in the Contact section.
2. **Contact form** — add a free [Formspree](https://formspree.io) form ID (or
   similar) so messages actually get delivered.
3. **Team** — real names, roles, bios, and photos.
4. **Photos** — replace the labeled placeholders with real project photos.
5. **Social preview image** — add an `og-image.jpg` so link shares look good.
6. **Donation embed** — confirm the DonorBox campaign (`wvtr-projects`) is correct.

Ask Claude to help with any of these — just provide the details or files.

---

## Accessibility & quality notes

This site was built to modern standards:

- Semantic HTML landmarks (`header`, `nav`, `main`, `footer`) and headings.
- Keyboard-navigable, with a visible focus ring and a "skip to content" link.
- Color contrast meets WCAG AA for text.
- Respects "reduce motion" settings (animations turn off automatically).
- Mobile-first responsive layout with a real hamburger menu.
- Lazy-loaded donation iframe so the page loads fast.
