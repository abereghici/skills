# Keyboard Accessibility Reference

## Why Keyboard Access Matters

Keyboard navigation is required by WCAG 2.1.1 (Level A) — it's non-negotiable. Users who depend on it include:
- People with motor impairments who can't use a mouse
- Switch access users (head switches, sip-and-puff, eye tracking)
- Power users who prefer keyboard efficiency
- Screen reader users (who navigate via keyboard by default)

Barriers like missing focus styles, keyboard traps, or non-focusable custom widgets cause real physical difficulty for these users.

---

## Focus Indicators

Never remove the default focus indicator without providing a visible replacement. `outline: none` without a replacement is a WCAG violation (SC 2.4.7 Focus Visible).

### Recommended Pattern

```css
/* Remove default only for mouse users; keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}

/* Strong, visible focus style for keyboard users */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Requirements

- Contrast ratio of at least 3:1 between the focus indicator and its adjacent colors (WCAG 2.4.11, Level AA)
- Must be visible against both light and dark backgrounds where applicable
- Use `outline` (not `border`) — outline doesn't affect layout

### Custom Focus Styles for Components

Override per component as needed:
```css
button:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}

a:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 1px;
  text-decoration: none; /* replace underline with outline */
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 0;
  box-shadow: 0 0 0 4px rgba(0, 95, 204, 0.2);
}
```

---

## tabindex

The `tabindex` attribute controls whether elements appear in the keyboard tab order.

| Value | Behavior | When to Use |
|-------|----------|-------------|
| `tabindex="0"` | Adds to natural tab order (by source position) | Making non-interactive custom widgets focusable |
| `tabindex="-1"` | Focusable via JS (`element.focus()`), excluded from Tab key | Programmatic focus management in custom widgets |
| `tabindex="1+"` | **Never use** | — (breaks natural tab order, causes confusing navigation) |

### Natural Tab Order

The default tab order follows the DOM source order. Don't use CSS to visually reorder elements without also reordering the DOM — this creates a mismatch between visual and keyboard order (WCAG SC 2.4.3 Focus Order).

```html
<!-- Keyboard order matches visual order -->
<button>First</button>
<button>Second</button>
<button>Third</button>
```

### When to Use tabindex="-1"

1. Programmatic focus after user action (e.g., open modal → focus modal container):
```js
modal.setAttribute('tabindex', '-1');
modal.focus();
```

2. Managing focus within composite widgets (tabs, menus, radio groups) — see Roving tabindex pattern below.

3. Skip link target:
```html
<main id="main" tabindex="-1">...</main>
```
```js
// In browsers that don't scroll/focus on anchor click without tabindex
document.getElementById('skip-link').addEventListener('click', () => {
  document.getElementById('main').focus();
});
```

---

## Skip Links

Required by WCAG 2.4.1 Bypass Blocks (Level A). Allows keyboard users to skip repeated navigation and jump directly to main content.

### Implementation

```html
<body>
  <!-- First element in <body> -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <nav><!-- potentially many nav links --></nav>
  </header>

  <main id="main-content" tabindex="-1">
    <h1>Page title</h1>
    <!-- ... -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  transform: translateY(-100%);
  top: 0;
  left: 0;
  padding: 0.5rem 1rem;
  background: #005fcc;
  color: white;
  font-weight: bold;
  z-index: 9999;
  transition: transform 0.2s;
}

.skip-link:focus {
  transform: translateY(0);
}
```

This keeps the skip link visually hidden until focused, then reveals it.

**Important**: The target (`#main-content`) needs `tabindex="-1"` so focus can be placed on it. Without it, some browsers focus but don't scroll.

---

## Roving tabindex Pattern

For composite widgets (tabs, radio groups, toolbars, menus), treat the entire group as a single tab stop. Only one item in the group is in the tab order at a time.

### Concept

- Active/selected item: `tabindex="0"`
- All other items: `tabindex="-1"`
- Arrow keys move focus within the group
- Updating `tabindex` values as focus moves

### Example: Tab List

```html
<div role="tablist">
  <button role="tab" aria-selected="true" tabindex="0" id="tab-1">Tab 1</button>
  <button role="tab" aria-selected="false" tabindex="-1" id="tab-2">Tab 2</button>
  <button role="tab" aria-selected="false" tabindex="-1" id="tab-3">Tab 3</button>
</div>
```

```js
const tabs = [...tablist.querySelectorAll('[role="tab"]')];

tablist.addEventListener('keydown', (e) => {
  const current = tabs.indexOf(document.activeElement);
  let next;

  if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
  if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = tabs.length - 1;

  if (next !== undefined) {
    e.preventDefault();
    // Update tabindex
    tabs[current].tabIndex = -1;
    tabs[next].tabIndex = 0;
    tabs[next].focus();
  }
});
```

---

## Focus Management in Dynamic UIs

### Dialogs / Modals

When a dialog opens:
1. Move focus to the dialog (first focusable element or the dialog container)
2. Trap focus inside while open (Tab cycles within dialog only)
3. When dialog closes, return focus to the element that triggered it

```js
function openModal(trigger, modal) {
  modal.removeAttribute('hidden');
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  focusable[0].focus();

  // Trap focus
  modal.addEventListener('keydown', trapFocus);

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.removeEventListener('keydown', trapFocus);
    trigger.focus(); // return focus
  }

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
```

### Inline Page Transitions (SPAs)

When navigating to a new "page" in a SPA:
1. Update `<title>` to reflect the new page
2. Move focus to the main heading (`<h1>`) or the top of the main content region

```js
router.on('navigate', () => {
  document.title = newPageTitle;
  const h1 = document.querySelector('main h1');
  if (h1) {
    h1.setAttribute('tabindex', '-1');
    h1.focus();
  }
});
```

### Loading States

When an action triggers a loading state, announce it:
```html
<div role="status" aria-live="polite" id="loading-status"></div>
```
```js
document.getElementById('loading-status').textContent = 'Loading results...';
// On complete:
document.getElementById('loading-status').textContent = '12 results loaded.';
```

---

## Keyboard Interaction Patterns Reference

| Widget | Key | Action |
|--------|-----|--------|
| Button | Enter, Space | Activate |
| Link | Enter | Follow link |
| Checkbox | Space | Toggle checked state |
| Radio group | Arrow keys | Move between options; Tab to leave group |
| Select | Arrow keys | Navigate options |
| Tab list | Arrow keys | Move focus between tabs |
| Menu | Arrow keys | Navigate items; Escape close; Enter/Space activate |
| Dialog | Escape | Close; focus returns to trigger |
| Accordion | Enter/Space | Toggle panel |
| Slider | Arrow keys | Increment/decrement value |
| Tree | Arrow keys | Expand/collapse/navigate nodes |

---

## Common Keyboard Accessibility Mistakes

1. **`outline: none` without replacement** — WCAG violation. Always provide a visible focus style.
2. **Positive `tabindex` values** — breaks natural tab order. Only use `0` or `-1`.
3. **Mouse-only event handlers** — `onclick` works for keyboard too, but `onmousedown`, `onmouseover` do not. Pair with keyboard equivalents.
4. **CSS-only hover effects** that reveal interactive content — keyboard users can't hover. Use `:focus-within` alongside `:hover`.
5. **Hidden content receiving focus** — if content is `display: none` or `visibility: hidden`, it should not be focusable.
6. **Missing skip link** — required for sites with repeated navigation.
7. **Focus not returned after closing modals** — user loses their place in the page.
8. **Infinite scroll / dynamic content** that shifts focus unexpectedly.
