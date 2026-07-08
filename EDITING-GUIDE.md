# Editing Guide — "How do I change…?"

This guide is written for anyone managing the WVTR site, whether you edit the
files yourself or (recommended) just ask Claude to do it. Each entry says where
the thing lives and how to change it.

> **Tip:** The fastest way is to tell Claude what you want in plain English.
> This guide exists so you know what's *possible* and can point to the right spot.

---

## The words on the page (headlines, paragraphs)

**Where:** `index.html`

The whole site is one file, split into clearly-commented sections that match the
menu — for example:

```html
<!-- ===== WATER CRISIS (nav: Water Crisis) ===== -->
```

Find the section by its name, then change the text between the tags. For
example, to change the main headline, look for the `HERO` section and edit the
text inside `<h1>…</h1>`.

---

## The menu items (top navigation)

**Where:** `index.html`, in the `HEADER / NAVIGATION` section.

Each menu link looks like `<a href="#work">Our Work</a>`.
- Change the visible text ("Our Work") to rename it.
- The `href="#work"` must match a section's `id="work"` further down the page.

---

## Brand colors

**Where:** `assets/css/styles.css`, at the very top under `1. DESIGN TOKENS`.

The site uses only three brand ideas — **black, brand blue (#18aaff), and white**.
Change these values and the entire site re-themes itself:

```css
--blue:      #18aaff;   /* THE brand blue — buttons, accents, big type */
--blue-deep: #0a63a8;   /* darker blue for gradients/depth */
--blue-text: #0a63a8;   /* accessible blue for small text/links on white */
--black:     #05080d;   /* near-black — dark sections & headings */
--white:     #ffffff;
```

> **Note on the blue:** `#18aaff` is bright, so for *small text* on a white
> background we use the slightly darker `--blue-text` to stay easy to read
> (accessibility). Big headings, buttons, and decoration use the full `--blue`.

---

## Fonts & the artistic (tattoo-flash) style

**Where:** `index.html` (`<head>`, the Google Fonts line) and `assets/css/styles.css`.

The look uses three fonts, set near the top of the CSS under `--font-*`:
- **Anton** — the bold poster/display type used for all big headings.
- **Yellowtail** — the hand-drawn *script* used for accent words.
- **Inter** — the clean body text.

**Script accent words:** wrap any word in `<span class="script">word</span>` to render
it in the blue hand-script (e.g. `Give Water. <span class="script">give life</span>`).

**Banner ribbons:** the little notched labels above each heading are
`<span class="banner">Label</span>`. Change the text inside.

**Art files** live in `assets/img/`: `wave.svg` (the traditional wave divider),
`sunburst.svg` (hero rays), and `favicon.svg` (the linework drop). These are
drawn in code — ask Claude to adjust the wave shape, colors, or add new motifs
(dotwork, banners, etc.). The whole page also has a subtle ink-grain texture,
set in CSS under `body::after`.

---

## The Donate button and donation form

**Where:** `index.html`, the `DONATE` section.

The donation form is a DonorBox embed:

```html
<iframe src="https://donorbox.org/embed/wvtr-projects?show_content=true" …>
```

To point it at a different DonorBox campaign, change `wvtr-projects` to the new
campaign name.

---

## Adding or editing a project (Our Work)

**Where:** `index.html`, the `OUR WORK` section.

Each project is an `<article class="project">…</article>` block. To add one,
copy an existing block and edit the tag, title, and description. The colored tag
comes from its class:
- `project__tag--done` → green "Completed"
- `project__tag--soon` → gold "Coming Soon"

---

## Replacing a placeholder with a real photo

**Where:** anywhere you see a block like this:

```html
<div class="placeholder"><span>… Photo: Ethiopia field work</span></div>
```

Replace that whole `<div class="placeholder">…</div>` with:

```html
<img src="assets/img/ethiopia.jpg" alt="Volunteers handing out water filters in Ethiopia" />
```

Put the photo file in `assets/img/`. Always write a short, descriptive `alt`
text — it's read aloud by screen readers and shown if the image fails to load.

---

## The team section

**Where:** `index.html`, the `TEAM` section.

Each person is an `<article class="member">` block with a photo, name, role, and
bio. Replace the placeholder text/photos, and copy a block to add more people.

---

## Contact details & form delivery

**Where:** `index.html`, the `CONTACT` section.

1. Update the email (`info@wvtr.org`), phone, and location.
2. To make the form actually send mail, create a free form at
   [formspree.io](https://formspree.io), then replace `your-form-id` in
   `action="https://formspree.io/f/your-form-id"` with your real ID.

---

## Logo / favicon

**Where:** `assets/img/favicon.svg` (the browser-tab icon) and the inline
`<svg class="brand__logo">` in `index.html` (the header/footer logo).

If WVTR has an official logo file, send it to Claude and it can swap the
drop mark for the real logo.

---

## SEO & how the site looks when shared

**Where:** `index.html`, the `SEO & SOCIAL PREVIEW` block in the `<head>`.

Edit the `<title>`, the `description`, and the `og:image` (the picture that
shows when someone shares a wvtr.org link on social media or in a text).

---

## Still not sure?

Describe what you want changed and Claude will find the right place and do it.
No need to touch code yourself unless you want to.
