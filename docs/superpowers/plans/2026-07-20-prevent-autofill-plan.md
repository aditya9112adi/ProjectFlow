# Prevent Form Autofill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add autocomplete attributes to the auth forms to prevent the browser from automatically filling credentials.

**Architecture:** We will modify the HTML attributes of the form inputs directly within the React components.

**Tech Stack:** React 19, Tailwind CSS

## Global Constraints

- No external dependencies can be added for this task.

---

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

### Task 2: Update Register Page

**Files:**
- Modify: `frontend/src/pages/auth/Register.jsx:82-95`

**Interfaces:**
- Consumes: N/A
- Produces: N/A

- [ ] **Step 1: Modify email and password inputs**

Edit `frontend/src/pages/auth/Register.jsx` to add `autoComplete="off"` to the email input and `autoComplete="new-password"` to the password input.

```jsx
              <input type="email" autoComplete="off" className={`input ${errors.email ? 'border-red-500/50' : ''}`} placeholder="alice@university.edu" {...register('email')} />
```

```jsx
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pr-12 ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="Min 8 chars, uppercase, number"
                  {...register('password')}
                />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/auth/Register.jsx
git commit -m "fix(auth): disable browser autofill for register form"
```
