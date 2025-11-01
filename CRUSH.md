# Canvas Learning - Development Guide

## Build/Test/Lint Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build
- `npx prettier --write .` - Format all files with Prettier

## Code Style Guidelines

### Imports & Formatting
- Use Prettier with organize-imports plugin (no semicolons, auto-organize imports)
- Import React types with `type` keyword: `import { useRef, type RefObject } from "react"`
- Relative imports for local components: `"./components/full-screen-canvas"`

### TypeScript & Types
- Strict TypeScript configuration with composite project structure
- Use explicit return types for functions when helpful
- Prefer `type` over `interface` for props: `{ ref: RefObject<HTMLCanvasElement> }`
- Custom error classes extend Error with proper name assignment

### React Patterns
- Use `forwardRef` pattern for canvas components
- Functional components with arrow functions for simple components
- Custom hooks for canvas logic (useCanvas pattern)
- Proper cleanup in useEffect hooks (event listeners, animation frames)

### Naming Conventions
- PascalCase for components: `FullscreenCanvas`, `Square`
- camelCase for hooks, variables, functions: `useCanvas`, `canvasRef`
- Custom error classes: `CanvasError`

### Styling
- Tailwind CSS for styling with utility classes
- Fixed positioning for fullscreen elements: `"fixed top-0 left-0 w-full h-full"`