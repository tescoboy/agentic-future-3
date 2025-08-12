# Project Rules - Always Evaluated

## Core Principles
- **Keep it simple. Prefer tiny, focused files.**
- **Two repos: frontend and backend. Do not mix.**
- **Keep each file under about 150 lines when possible.**

## Frontend Rules (Next.js 14 App Router)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Bootstrap 5 via CDN
- **Layout**: Use Bootstrap grid and spacing utilities for layout and padding
- **CSS**: Avoid custom CSS except a tiny override file
- **UX Requirements**:
  - Form validation
  - Loading spinner
  - Empty states
  - Bootstrap cards
- **Deployment**: Vercel

## Backend Rules (Python FastAPI)
- **Language**: Python 3.11
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: SQLite via SQLAlchemy Core
- **Jobs**: No background jobs
- **Deployment**: Render Web Service

## API Endpoints
- `POST /api/discover` → matched signals from SQLite with deterministic scoring
- `POST /api/propose` → proposed segments. Use Gemini if GEMINI_API_KEY is present, otherwise deterministic fallback
- `GET /health` → `{"status":"ok"}`
- `GET /api/debug/ping` → returns `ai_enabled` and `db_seeded` flags

## Database Rules
- Database is created and fully seeded on startup from `sampledata.json`
- Never hardcode sample rows
- Use SQLAlchemy Core for database operations

## CORS Configuration
- Allow `http://localhost:3000`
- Allow production Vercel origin from env `FRONTEND_ORIGIN`

## Logging Requirements
- One concise line per request with method, path, status, latency, ai=on|off

## Server Rules
- Servers must only start when explicitly run
- Do not auto-start in postinstall

## File Structure Best Practices
- Keep files structured logically
- Separate concerns (data fetching, UI rendering, event handlers)
- Use modular, reusable functions
- Each function should do only one thing and be named clearly

## Code Quality Rules
- Functions must be small, modular, and reusable
- Break down large files into smaller modules
- Use proper error handling for API calls
- Console logging for debugging API calls and errors
- No duplicate code—reuse functions and utility methods
- Use addEventListener() instead of inline event handlers
- Lazy load images using loading="lazy" attribute
- Debounce expensive functions (e.g., search, API calls)

## Mobile Responsiveness
- Always make sure the app will work in portrait mode on a mobile phone
- Use Bootstrap's responsive grid system

## Bootstrap Usage Rules
- Use Bootstrap for all styling instead of custom CSS
- No inline CSS allowed
- Use Bootstrap's grid system for layouts
- Use Bootstrap components instead of custom-styled elements
- Use Bootstrap utility classes for spacing and colors
- If Bootstrap styles need customization, changes must be in override file

## Environment Variables
- `GEMINI_API_KEY` - for AI functionality
- `FRONTEND_ORIGIN` - for CORS configuration

## Development Workflow
- Follow these rules strictly in all code generation
- If any code violates these rules, automatically correct it
- These rules are always evaluated and must be followed
