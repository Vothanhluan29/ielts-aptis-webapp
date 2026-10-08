# Common UI

Reusable, presentation-only building blocks for teacher and admin screens live here.

- Keep API calls, permissions, and feature-specific state in the owning feature.
- Add a component here when multiple pages can use it without importing feature code.
- Prefer props for labels, actions, icons, and style variants; avoid reading the current route inside common UI.
- Put shared visual tokens in `tokens.css` and import them once from `main.jsx`.

Current primitives: `PageContainer`, `PageHeader`, `StatCard`, `SurfaceCard`, `EmptyState`, `LoadingState`, and `WorkspaceShell`.
