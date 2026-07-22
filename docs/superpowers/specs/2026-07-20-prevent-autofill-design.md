# Prevent Form Autofill Design Spec

## Problem
The user's web browser or password manager is auto-filling the email and password credentials on the auth pages (Login and Register) when the pages initially load. The user prefers these fields to be blank by default.

## Solution
We will add HTML autocomplete attributes to the form inputs on the auth pages to discourage browsers from auto-filling these fields.

## Scope
1. **Login Page (`frontend/src/pages/auth/Login.jsx`)**: 
   - Add `autoComplete="off"` to the email input field.
   - Add `autoComplete="new-password"` to the password input field.
2. **Register Page (`frontend/src/pages/auth/Register.jsx`)**:
   - Add `autoComplete="off"` to the email input field.
   - Add `autoComplete="new-password"` to the password input field.

*Note: While `autoComplete="off"` tells standard browsers not to autofill, many modern password managers ignore this for password fields. Using `autoComplete="new-password"` on password fields is the W3C recommended way to prevent password auto-filling for existing accounts.*
