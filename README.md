# PiggyPulse Web

Web client for **PiggyPulse**, a security-informed SaaS platform for flexible budgeting.

Production:
https://piggy-pulse.com

Storybook (public UI documentation):
https://piggypulse-storybook.pages.dev/

The frontend is a browser client for the versioned PiggyPulse API:

https://api.piggy-pulse.com/api/v1

---

## Overview

PiggyPulse Web provides a mobile-first interface for managing:

- Flexible budgeting periods
- Category goals
- Accounts
- Transactions
- Vendors

The application is designed as a client of a versioned, authenticated backend API and respects strict security
boundaries.

---

## Technology Stack

- React
- Vite
- Mantine (UI framework)
- TypeScript
- Storybook
- Cloudflare Pages (deployment)

---

## Security Model (Frontend)

PiggyPulse Web is built to operate within a secure, cookie-based authentication model.

### Authentication

- Authentication is handled via HttpOnly session cookies set by the backend.
- No JWTs are stored in localStorage.
- No authentication tokens are exposed to JavaScript.
- Every API request is validated server-side.

This ensures credentials remain inaccessible to client-side scripts and reduces XSS attack impact.

### CSRF Protection

- CSRF protection is enforced.
- Cookies are validated and double-checked by the backend on each request.
- The frontend relies on secure, same-site cookie policies.

### API Interaction

- All API calls target the versioned backend (`/api/v1`).
- The frontend does not bypass authentication boundaries.
- Requests are manually implemented (no OpenAPI code generation at this stage).

---

## Architecture

The frontend is structured around:

- Clear separation of UI components and API interaction logic
- Environment-based API configuration
- Stateless UI (session handled server-side)
- Strict dependency on backend contract

The application does not embed business logic that belongs in the backend. Domain invariants are enforced server-side.

---

## Storybook

UI components are documented and isolated via Storybook:

https://piggypulse-storybook.pages.dev/

Storybook serves as:

- Component development environment
- Visual regression reference
- Design system documentation
- Public artifact of UI consistency

---

## Running Locally

### Requirements

- Node.js (LTS recommended)
- npm or pnpm

### Install Dependencies

```bash
    npm install
```

### Start Development Server

```bash
    npm run dev
```

The app will be available at:

```bash
    http://localhost:5173
```

Ensure the backend API is running locally or accessible via environment configuration.

---

## Environment Configuration

The frontend uses environment-based API configuration.

Example:

```bash
    VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Production builds target:

```bash
    https://api.piggy-pulse.com/api/v1
```

---

## Deployment

The frontend is deployed via Cloudflare Pages.

Deployment model:

- Static build output
- No server-side rendering
- Backend communication via secure HTTPS
- Separate deployment pipeline from backend

This separation enforces clean client/server boundaries.

---

## Design Philosophy

PiggyPulse Web is designed to:

- Respect backend security boundaries
- Avoid leaking sensitive data to client storage
- Remain a thin client over a well-defined API
- Prioritize clarity over premature optimization
- Maintain UI consistency through documented components

The frontend complements the backend’s security-first architecture rather than re-implementing business logic.

---

## Roadmap

- Improved onboarding flow
- Enhanced accessibility coverage
- Expanded test coverage
- Potential OpenAPI-based client type generation

## License

PiggyPulse is licensed under the GNU Affero General Public License v3.0 (AGPLv3).

You are free to use, modify, and self-host the software.  
If you run a modified version as a network service, you must make the modified source code available under the same
license.

See the LICENSE file for full details.