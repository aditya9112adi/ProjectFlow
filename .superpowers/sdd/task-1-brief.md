### Task 1: Update Login Page

**Files:**
- Modify: `frontend/src/pages/auth/Login.jsx:145-165`

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Modify email and password inputs**

Edit `frontend/src/pages/auth/Login.jsx` to add `autoComplete="off"` to the email input and `autoComplete="new-password"` to the password input.

```jsx
              <input
                id="login-email"
                type="email"
                autoComplete="off"
                className={`input ${errors.email ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                placeholder="you@university.edu"
                {...register('email')}
              />
```

```jsx
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password')}
                />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/auth/Login.jsx
git commit -m "fix(auth): disable browser autofill for login form"
```
