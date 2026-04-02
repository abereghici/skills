# ARIA Reference

## What ARIA Is (and Isn't)

ARIA (Accessible Rich Internet Applications) is a set of HTML attributes that modify the accessibility tree — the non-visual representation of the page that assistive technologies consume. ARIA:
- Changes what screen readers announce
- Does NOT add visual styling
- Does NOT add keyboard behavior or interactivity
- Must be paired with JavaScript for interactive components

The accessibility tree and the DOM are separate. CSS affects visual presentation but not the accessibility tree. ARIA affects the accessibility tree but not the DOM.

## The Five Rules of ARIA

**Rule 1 — Use native HTML when possible**

Ask: "Is there an HTML element for this?" If yes, use it. Only reach for ARIA when:
- The native element exists but its accessibility is incomplete in your specific context
- Visual design constraints prevent using the native element
- No native HTML element exists for the pattern

**Rule 2 — Don't override meaningful native semantics**

Wrong:
```html
<h2 role="tab">Section Title</h2>
```

Right — wrap, don't override:
```html
<div role="tab"><h2>Section Title</h2></div>
```

Or use nesting:
```html
<h2><button>Section Title</button></h2>
```

**Rule 3 — All interactive ARIA controls must be keyboard accessible**

WCAG SC 2.1.1 (Level A) is non-negotiable. If you add `role="button"`, `role="tab"`, `role="menuitem"`, etc., you must implement the expected keyboard interaction in JavaScript.

| Role | Expected Keyboard Behavior |
|------|---------------------------|
| `button` | Enter and Space activate |
| `checkbox` | Space toggles; arrow keys between items in group |
| `tab` | Arrow keys navigate between tabs |
| `menuitem` | Arrow keys navigate; Escape closes menu |
| `combobox` | Arrow keys, Enter, Escape per ARIA APG pattern |
| `dialog` | Focus trapped inside; Escape closes |

**Rule 4 — Never hide focusable elements**

Never apply `aria-hidden="true"` or `role="presentation"` to an element that can receive keyboard focus. Users would Tab to an element that "doesn't exist" from the AT perspective.

```html
<!-- Wrong: button is still focusable but aria-hidden removes it from AT -->
<button aria-hidden="true">Submit</button>

<!-- Wrong: link has role="presentation", still focusable -->
<a href="/home" role="presentation">Home</a>
```

**Rule 5 — All interactive elements must have an accessible name**

Every `role="button"`, `role="link"`, `<input>`, `<select>`, etc. needs a name. Empty buttons and unlabeled inputs are WCAG violations (SC 4.1.2).

---

## ARIA Attribute Categories

### Roles

Override or supply semantics. Use sparingly — prefer native elements.

**Landmark roles** (prefer native HTML equivalents):
- `banner` → `<header>`
- `navigation` → `<nav>`
- `main` → `<main>`
- `contentinfo` → `<footer>`
- `complementary` → `<aside>`
- `region` → `<section aria-label="...">`
- `search` → `<search>` or `<form role="search">`

**Widget roles** (used with JavaScript for custom interactive components):
- `button`, `checkbox`, `radio`, `switch`, `slider`
- `tab`, `tablist`, `tabpanel`
- `menu`, `menuitem`, `menuitemcheckbox`, `menuitemradio`
- `combobox`, `listbox`, `option`
- `dialog`, `alertdialog`
- `tooltip`

**Document structure roles**:
- `img` — for non-`<img>` elements serving as images (e.g., SVG containers)
- `list`, `listitem`
- `heading` — avoid; use `<h1>`–`<h6>` instead
- `presentation` / `none` — removes element from accessibility tree (use carefully)

**Live region roles**:
- `alert` — assertive by default; use for time-sensitive, important messages
- `status` — polite by default; use for status updates
- `log` — polite; for chat logs, activity feeds

### States

Change as the user interacts with the page. Keep these in sync with your UI state.

| Attribute | Values | Use When |
|-----------|--------|----------|
| `aria-expanded` | `true` / `false` | Accordion, dropdown, disclosure widget is open/closed |
| `aria-checked` | `true` / `false` / `mixed` | Checkbox, toggle, radio is checked |
| `aria-selected` | `true` / `false` | Tab, option, listitem is selected |
| `aria-pressed` | `true` / `false` / `mixed` | Toggle button is pressed |
| `aria-disabled` | `true` / `false` | Element is disabled (prefer native `disabled` on form controls) |
| `aria-invalid` | `true` / `false` / `grammar` / `spelling` | Form field has validation error |
| `aria-busy` | `true` / `false` | Region is loading / updating |
| `aria-hidden` | `true` | Removes from accessibility tree (never on focusable elements) |

### Properties

Describe relationships and characteristics. Generally set once, not during interaction.

| Attribute | Purpose |
|-----------|---------|
| `aria-label` | Provides an accessible name (overrides text content) |
| `aria-labelledby` | Points to element(s) whose text becomes the name |
| `aria-describedby` | Points to element(s) whose text becomes the description |
| `aria-required` | Marks field as required (prefer native `required` attribute) |
| `aria-haspopup` | Indicates element opens a popup (`menu`, `listbox`, `tree`, `grid`, `dialog`, `true`) |
| `aria-controls` | References the element(s) this control affects |
| `aria-owns` | Declares an ownership relationship outside the DOM hierarchy |
| `aria-live` | `polite` / `assertive` / `off` — marks a live region |
| `aria-atomic` | `true` / `false` — whether the whole region or just changed nodes are announced |
| `aria-relevant` | `additions` / `removals` / `text` / `all` — which changes trigger announcements |

---

## ARIA Live Regions

Use live regions to announce dynamic content changes to screen reader users without requiring navigation.

### Setup

Add the live region to the DOM at page load with the role/attribute already present. Don't inject it dynamically — some screen readers miss it.

```html
<!-- Status message container - polite (waits for user pause) -->
<div role="status" aria-live="polite" aria-atomic="true" id="status-msg"></div>

<!-- Alert container - assertive (interrupts immediately) -->
<div role="alert" aria-live="assertive" aria-atomic="true" id="alert-msg"></div>
```

### Triggering Announcements

Update the text content inside the live region:
```js
// Polite announcement
document.getElementById('status-msg').textContent = 'Changes saved.';

// Clear it after some time if needed
setTimeout(() => { document.getElementById('status-msg').textContent = ''; }, 3000);
```

### When to Use Which

| Situation | Live Region |
|-----------|------------|
| Form saved/submitted | `role="status"` (polite) |
| Item added to cart | `role="status"` (polite) |
| Loading complete | `role="status"` (polite) |
| Critical error | `role="alert"` (assertive) |
| Session timeout warning | `role="alert"` (assertive) |
| Chat/activity feed | `role="log"` (polite, additive) |

Use `assertive` sparingly — it interrupts everything and is disruptive if overused.

---

## Custom Component Patterns

### Custom Button (from non-semantic element)

When you truly can't use `<button>`:
```html
<div class="btn" role="button" tabindex="0">Do something</div>
```

```js
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // trigger the action
  }
});
```

Prefer using actual `<button>` with `all: unset` to strip default styles:
```css
button.custom {
  all: unset;
  cursor: pointer;
  /* your styles */
}
```

### Disclosure Widget (expand/collapse)

```html
<button type="button" aria-expanded="false" aria-controls="panel-1">
  Section Title
</button>
<div id="panel-1" hidden>
  Panel content
</div>
```

```js
button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  panel.hidden = expanded;
});
```

### Tab Interface

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected="true" aria-controls="panel-profile" id="tab-profile">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security" tabindex="-1">Security</button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">...</div>
<div role="tabpanel" id="panel-security" aria-labelledby="tab-security" hidden>...</div>
```

Key behaviors: Arrow Left/Right to navigate tabs; Tab to move to panel; Home/End for first/last tab.
