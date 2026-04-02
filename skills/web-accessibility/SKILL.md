---
name: web-accessibility
description: Practical web accessibility guidance for HTML, ARIA, keyboard navigation, forms, images, and WCAG compliance. Use this skill whenever writing or reviewing HTML, building UI components, handling forms, adding images, managing focus, or any time accessibility, a11y, WCAG, ARIA, screen readers, or inclusive design is mentioned. Apply proactively when creating any interactive elements, navigation, custom widgets, or when someone asks about assistive technology support.
metadata:
  version: "2026.04.02"
---

# Web Accessibility

Practical guidance for building inclusive web experiences. The goal is to make interfaces work for everyone — including users of screen readers, keyboard-only users, and people with motor, visual, or cognitive disabilities.

**Core principle**: Prefer semantic HTML first. ARIA is a fallback, not a first choice.

## Reference Files

- `references/aria.md` — ARIA roles, states, properties, and rules of use
- `references/forms.md` — Form labeling, grouping, validation, and live regions
- `references/keyboard.md` — Focus management, tabindex, skip links, and focus indicators

---

## 1. Semantic HTML

Use elements for their intended purpose. Semantic HTML automatically provides roles, states, keyboard behavior, and accessibility tree entries — no extra work needed.

**Always prefer**:

- `<button>` for actions (not `<div>` or `<span>`)
- `<a href>` for navigation (not `<div onclick>`)
- `<label>` for form field labels (not `<div>` or `<p>`)
- `<h1>`–`<h6>` for headings (not styled `<div>`)
- `<ul>`/`<ol>` for lists
- `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>` for page regions

**Buttons vs. Links — get this right**:

- `<button>` = triggers an action on the current page (save, delete, toggle, submit)
- `<a href>` = navigates to a different location (URL, anchor, route)
- Never swap them. A button styled as a link is still semantically a button. Choose the element that matches the user's expectation.

```html
<!-- Action → button -->
<button type="button" onclick="deleteItem()">Delete</button>

<!-- Navigation → link -->
<a href="/settings">Go to settings</a>
```

---

## 2. Heading Structure

Headings are the primary navigation mechanism for screen reader users. Structure them like a document outline.

- One `<h1>` per page (the main page title)
- Don't skip levels (`<h1>` → `<h3>` without `<h2>` in between)
- Use headings for structure, not for visual styling

```html
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
<h2>Another Section</h2>
```

---

## 3. Landmarks

Landmarks let screen reader users jump to key regions of the page. Use the native HTML elements — they map automatically.

| HTML Element                  | Landmark Role   | Purpose                             |
| ----------------------------- | --------------- | ----------------------------------- |
| `<header>`                    | `banner`        | Site header/branding (one per page) |
| `<nav>`                       | `navigation`    | Navigation links                    |
| `<main>`                      | `main`          | Primary page content (one per page) |
| `<footer>`                    | `contentinfo`   | Footer (one per page)               |
| `<aside>`                     | `complementary` | Supplementary content               |
| `<form>` with `aria-label`    | `form`          | Named form                          |
| `<section>` with `aria-label` | `region`        | Named content region                |

If you have multiple `<nav>` or `<section>` elements, give each a unique `aria-label`:

```html
<nav aria-label="Primary">...</nav>
<nav aria-label="Breadcrumb">...</nav>
```

---

## 4. Accessible Names

Every interactive element needs a programmatically determinable name — this is what screen readers announce.

**Priority order** (first wins):

1. `aria-labelledby` → points to another element's text
2. `aria-label` → inline string
3. Native label (`<label>`, `alt`, element text content)
4. `title` → last resort, avoid

**Form inputs**: Use `<label for="id">` + `<input id="id">` — the most reliable method.

**Icon-only buttons/links**: The icon provides no text for AT. Add visually-hidden text:

```html
<button>
  <span class="visually-hidden">Close dialog</span>
  <svg aria-hidden="true">...</svg>
</button>
```

**Images**: Use the `alt` attribute on `<img>`:

- Informational image: describe what it conveys (`alt="Bar chart showing Q3 revenue of $2.4M"`)
- Decorative image: `alt=""` (empty, not omitted — omitting leaves the filename)
- Image in a link: alt describes the destination, not the image
- Never write "image of" or "photo of" — screen readers already say "image"

---

## 5. Hiding Content

Choose the right method based on what you want to hide and from whom.

| Method               | Visual     | Keyboard   | Screen Reader  | Use For                                      |
| -------------------- | ---------- | ---------- | -------------- | -------------------------------------------- |
| `display: none`      | Hidden     | Excluded   | Hidden         | Content no one should access                 |
| `visibility: hidden` | Hidden     | Excluded   | Hidden         | Same as above, preserves layout space        |
| `aria-hidden="true"` | Visible    | Accessible | **Hidden**     | Decorative icons, duplicated text            |
| Visually-hidden CSS  | **Hidden** | Accessible | **Accessible** | Skip links, SR-only labels, icon button text |

**Visually-hidden utility class** (the standard pattern):

```css
.visually-hidden:not(:focus):not(:active) {
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  position: absolute;
  white-space: nowrap;
}
```

**Critical rule**: Never use `aria-hidden="true"` or `display: none` on an element that can receive keyboard focus. Users would focus on "nothing."

---

## 6. ARIA

Read `references/aria.md` for complete ARIA guidance. Summary:

**The five rules of ARIA use:**

1. Use native HTML instead of ARIA when possible
2. Don't override meaningful semantics (`<h2 role="tab">` → wrong; `<div role="tab"><h2>...</h2></div>` → right)
3. All interactive ARIA controls must be keyboard accessible
4. Never hide focusable elements with `aria-hidden="true"` or `role="presentation"`
5. All interactive elements must have an accessible name

**Common ARIA attributes**:

- `aria-label` — provides a name (overrides visible text)
- `aria-labelledby` — references another element as the name
- `aria-describedby` — references additional descriptive text
- `aria-expanded` — state for expandable elements (`true`/`false`)
- `aria-hidden="true"` — removes from accessibility tree (never on focusable elements)
- `aria-live` — marks a region for dynamic announcements

---

## 7. Forms

Read `references/forms.md` for complete form guidance. Summary:

```html
<!-- Labeled input -->
<label for="email">Email address</label>
<input type="email" id="email" autocomplete="email" />

<!-- Grouped controls -->
<fieldset>
  <legend>Shipping method</legend>
  <input type="radio" id="standard" name="shipping" />
  <label for="standard">Standard (5–7 days)</label>
  <input type="radio" id="express" name="shipping" />
  <label for="express">Express (1–2 days)</label>
</fieldset>

<!-- Error state -->
<label for="phone">Phone number</label>
<input
  type="tel"
  id="phone"
  aria-invalid="true"
  aria-describedby="phone-error"
/>
<span id="phone-error" role="alert">Enter a valid 10-digit phone number</span>
```

---

## 8. Keyboard Accessibility

Read `references/keyboard.md` for complete keyboard guidance. Summary:

**Focus indicators** — never remove without a visible replacement:

```css
/* Good: custom, high-contrast focus style */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
/* Bad: removes focus indicator entirely */
:focus {
  outline: none;
}
```

**tabindex rules**:

- `tabindex="0"` — adds element to natural tab order (use for custom interactive widgets)
- `tabindex="-1"` — focusable by JS only, not by Tab key (use for programmatic focus management)
- `tabindex="1"` or higher — **never use** (breaks tab order)

**Skip links** — required by WCAG 2.4.1:

```html
<body>
  <a href="#main" class="visually-hidden">Skip to main content</a>
  <header>...</header>
  <main id="main">...</main>
</body>
```

---

## 9. WCAG Quick Reference

| Criterion                    | Level | What It Requires                                  |
| ---------------------------- | ----- | ------------------------------------------------- |
| 1.1.1 Non-text Content       | A     | Images, icons, controls have text alternatives    |
| 1.3.1 Info and Relationships | A     | Visual structure conveyed programmatically        |
| 2.1.1 Keyboard               | A     | All functionality operable by keyboard            |
| 2.4.1 Bypass Blocks          | A     | Skip links or equivalent mechanism                |
| 2.4.3 Focus Order            | A     | Focus order preserves meaning and operability     |
| 2.4.7 Focus Visible          | AA    | Keyboard focus indicator is visible               |
| 2.5.3 Label in Name          | A     | Accessible name contains the visible label text   |
| 3.3.1 Error Identification   | A     | Errors are identified and described in text       |
| 3.3.2 Labels or Instructions | A     | Labels provided for all user inputs               |
| 4.1.2 Name, Role, Value      | A     | All UI components have determinable name and role |

---

## 10. Testing

Manual checks to run before shipping:

1. **Keyboard-only navigation**: Tab through the entire page. Every interactive element should be reachable, operable, and visible (focus indicator present).
2. **Screen reader**: Announce the page with VoiceOver (macOS) or NVDA (Windows). Verify headings, landmarks, buttons, and form labels are correct.
3. **Zoom to 200%**: Content should remain readable and functional without horizontal scroll.
4. **Disable CSS**: Page structure should still make sense (heading hierarchy, list structure).
5. **DevTools accessibility panel**: Inspect accessible names, roles, and the accessibility tree for key elements.
