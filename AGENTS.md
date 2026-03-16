# AGENTS.md - Developer Guidelines for pokemon-app

## Project Overview

This is a Vite + React 19 application. The project uses modern JavaScript with React hooks, functional components, librerias como aceternityUI o materialUI and ESLint for code quality.

---

## Build / Lint / Test Commands

### Development
```bash
npm run dev         # Start Vite dev server with HMR
```

### Building
```bash
npm run build       # Build for production (outputs to dist/)
npm run preview     # Preview production build locally
```

### Linting
```bash
npm run lint        # Run ESLint on all files
```

### Testing
**Note:** No test framework is currently configured. To add tests:
```bash
# Install Vitest (recommended for Vite projects)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Add to package.json scripts:
"test": "vitest",
"test:run": "vitest run"

# Run a single test file
npm test -- filename.test.jsx
# or with Vitest:
npx vitest run src/components/ComponentName.test.jsx
```

---

## Code Style Guidelines

### General Principles
- Use React functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Naming Conventions
- **Components**: `PascalCase` (e.g., `PokemonCard.jsx`, `Header.jsx`)
- **Utilities/Hooks**: `camelCase` (e.g., `usePokemonData.js`, `api.js`)
- **CSS Modules**: `ComponentName.module.css`
- **Constants**: `UPPER_SNAKE_CASE` for truly global constants

### Import Order
Organize imports in the following order (separate with blank lines):
1. React imports (`import { useState, useEffect } from 'react'`)
2. Third-party library imports
3. Relative imports from project (`./` or `../`)
4. CSS/asset imports

```jsx
// Good import order example
import { useState, useEffect } from 'react'
import axios from 'axios'
import PokemonCard from './components/PokemonCard'
import { API_BASE_URL } from '../constants'
import './App.css'
```

### JSX and Component Patterns
- Use self-closing tags for elements without children: `<Component />`
- Always include `alt` text for images for accessibility
- Use semantic HTML elements (`<section>`, `<article>`, `<nav>`, etc.)
- Destructure props when using multiple properties

```jsx
// Good component example
function PokemonCard({ name, image, types, onSelect }) {
  return (
    <article className="pokemon-card" onClick={() => onSelect(name)}>
      <img src={image} alt={`${name} sprite`} />
      <h3>{name}</h3>
      <span>{types.join(', ')}</span>
    </article>
  )
}
```

### State Management
- Use `useState` for component-local state
- Extract complex state logic into custom hooks
- Consider `useReducer` for complex state transitions

### Error Handling
- Use try-catch for async operations
- Display user-friendly error messages
- Log errors appropriately for debugging

```jsx
// Good async handling
async function fetchPokemon(id) {
  try {
    const response = await axios.get(`/api/pokemon/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch pokemon:', error)
    throw new Error('Unable to load Pokemon data')
  }
}
```

### ESLint Configuration
The project uses ESLint with these rules:
- Extends: ESLint recommended, React Hooks recommended, React Refresh
- `no-unused-vars`: Error except for constants starting with uppercase (varsIgnorePattern: `^[A-Z_]`)

Run `npm run lint` before committing to catch issues.

---

## Project Structure

```
pokemon-app/
├── src/
│   ├── assets/          # Static assets (images, SVGs)
│   ├── components/      # React components (create this directory)
│   ├── hooks/           # Custom hooks (create this directory)
│   ├── services/        # API calls, utilities (create this directory)
│   ├── App.jsx          # Main app component
│   ├── App.css          # App-specific styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static files served as-is
├── index.html          # HTML entry point
├── package.json
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
└── AGENTS.md           # This file
```

---

## Accessibility Requirements
- Always provide `alt` attributes for images
- Use semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`)
- Include `role` and `aria-label` attributes for icon-only buttons
- Ensure sufficient color contrast
- Make interactive elements keyboard accessible

---

## Performance Considerations
- Use React.memo for components that render frequently with same props
- Lazy load routes and heavy components with `React.lazy()`
- Optimize images (use appropriate formats and sizes)
- Avoid inline functions in render-intensive child components when possible

---

## Git Conventions
- Use clear, descriptive commit messages
- Create feature branches for new features
- Run `npm run lint` and `npm run build` before pushing

---

## Additional Notes
- This is a React 19 project using Vite 8
- No TypeScript is currently configured (plain JavaScript)
- CSS modules or CSS-in-JS solutions can be added as needed
