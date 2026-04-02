# Forms Accessibility Reference

## Labeling Form Controls

Every form control must have a programmatically associated label. A visible label alone is not enough — it must be connected to the input in the accessibility tree.

### Method 1: `<label>` with `for`/`id` (preferred)

```html
<label for="full-name">Full name</label>
<input type="text" id="full-name" name="fullName" autocomplete="name">
```

### Method 2: Wrapping `<label>`

```html
<label>
  Full name
  <input type="text" name="fullName" autocomplete="name">
</label>
```

### Method 3: `aria-label` (for controls without visible labels)

Use only when a visible label is truly not possible (e.g., search input in a `<nav>`):
```html
<input type="search" aria-label="Search the site" name="q">
```

### Method 4: `aria-labelledby`

Reference visible text on the page as the label:
```html
<h2 id="billing-heading">Billing address</h2>
<input type="text" aria-labelledby="billing-heading" name="address">
```

### Anti-patterns to avoid

```html
<!-- Wrong: placeholder is not a label -->
<input type="email" placeholder="Email address">

<!-- Wrong: title is not a reliable label -->
<input type="text" title="First name">

<!-- Wrong: visual proximity does not imply association -->
<p>Email address</p>
<input type="email" name="email">
```

---

## Grouping Related Controls

### Radio Buttons and Checkboxes

Group related controls with `<fieldset>` and `<legend>`. Screen readers announce the legend before each control's label.

```html
<fieldset>
  <legend>Preferred contact method</legend>

  <input type="radio" id="contact-email" name="contact" value="email">
  <label for="contact-email">Email</label>

  <input type="radio" id="contact-phone" name="contact" value="phone">
  <label for="contact-phone">Phone</label>

  <input type="radio" id="contact-mail" name="contact" value="mail">
  <label for="contact-mail">Post</label>
</fieldset>
```

### Grouped Address Fields

When individual labels + a group heading provide enough context, `<fieldset>` is optional. But when the group context is needed to understand each field, use it:

```html
<fieldset>
  <legend>Shipping address</legend>

  <label for="ship-street">Street</label>
  <input type="text" id="ship-street" name="shipStreet" autocomplete="shipping street-address">

  <label for="ship-city">City</label>
  <input type="text" id="ship-city" name="shipCity" autocomplete="shipping address-level2">

  <label for="ship-postcode">Postcode</label>
  <input type="text" id="ship-postcode" name="shipPostcode" autocomplete="shipping postal-code">
</fieldset>
```

---

## Required Fields

Communicate required fields visually and programmatically. Don't rely on color alone.

```html
<!-- Prefer native required attribute (form won't submit if empty) -->
<label for="email">
  Email address
  <span aria-hidden="true">*</span>
</label>
<input type="email" id="email" name="email" required autocomplete="email">

<!-- Explain what * means near the form -->
<p><span aria-hidden="true">*</span> Required field</p>
```

For custom UIs where native `required` doesn't fit, use `aria-required="true"`.

---

## Form Validation and Errors

### Inline Error Messages

Associate error messages with the input using `aria-describedby`. Set `aria-invalid="true"` when there's an error.

```html
<label for="password">Password</label>
<input
  type="password"
  id="password"
  name="password"
  aria-invalid="true"
  aria-describedby="password-error password-hint"
>
<span id="password-error" role="alert">Password must be at least 8 characters</span>
<span id="password-hint">Use a mix of letters, numbers, and symbols</span>
```

Multiple IDs in `aria-describedby` are read in order. Put the error before the hint.

### Summary Error List (for multi-field forms)

When validating on submit, display a summary with links to each invalid field:

```html
<div role="alert" tabindex="-1" id="error-summary">
  <h2>There are 2 errors in this form</h2>
  <ul>
    <li><a href="#email">Email address is required</a></li>
    <li><a href="#phone">Phone number must be 10 digits</a></li>
  </ul>
</div>
```

Move focus to the error summary after submission:
```js
document.getElementById('error-summary').focus();
```

### Inline Validation Timing

- Validate on blur (when user leaves a field) rather than on every keystroke — constant announcements are disruptive
- On submit: validate all fields, show summary, move focus to summary

### Clearing Errors

Remove `aria-invalid` and the error message when the user corrects the field. Using `aria-live="polite"` on the error container helps announce the correction:

```html
<div id="email-error" aria-live="polite">
  <!-- dynamically insert/remove error text here -->
</div>
```

---

## Select and Combobox

### Native `<select>`

```html
<label for="country">Country</label>
<select id="country" name="country" autocomplete="country-name">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="gb">United Kingdom</option>
</select>
```

### Option Groups

```html
<label for="timezone">Timezone</label>
<select id="timezone" name="timezone">
  <optgroup label="Americas">
    <option value="America/New_York">Eastern Time</option>
    <option value="America/Chicago">Central Time</option>
  </optgroup>
  <optgroup label="Europe">
    <option value="Europe/London">London</option>
    <option value="Europe/Paris">Paris</option>
  </optgroup>
</select>
```

---

## Autocomplete

Use the `autocomplete` attribute on personal data fields. It helps users with motor impairments, cognitive disabilities, and memory issues fill forms faster.

Common values: `name`, `email`, `tel`, `new-password`, `current-password`, `street-address`, `postal-code`, `country-name`, `cc-number`, `cc-exp`, `cc-csc`.

```html
<input type="text" id="name" name="name" autocomplete="name">
<input type="email" id="email" name="email" autocomplete="email">
<input type="tel" id="phone" name="phone" autocomplete="tel">
```

---

## Accessible Search Forms

```html
<form role="search" action="/search">
  <label for="search-input">Search</label>
  <input type="search" id="search-input" name="q">
  <button type="submit">Search</button>
</form>
```

If you hide the label visually, use the visually-hidden class — not `display: none`.

---

## ARIA Live Regions in Forms

Use live regions to announce dynamic form feedback (character counts, password strength, async validation):

```html
<!-- Character count feedback -->
<label for="bio">Bio (max 200 characters)</label>
<textarea id="bio" name="bio" maxlength="200"></textarea>
<span role="status" aria-live="polite" id="char-count">200 characters remaining</span>
```

```js
textarea.addEventListener('input', () => {
  const remaining = 200 - textarea.value.length;
  document.getElementById('char-count').textContent = `${remaining} characters remaining`;
});
```
