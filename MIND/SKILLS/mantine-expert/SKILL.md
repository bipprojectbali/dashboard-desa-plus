---
name: mantine-expert
description: Specialized skill for building and maintaining UI components with Mantine UI v7. Use when creating new dashboard widgets, layout components, or handling Mantine-specific styling and state (like dark mode) in the darmasaba-dashboard project.
---

# Mantine Expert

## Overview
This skill provides procedural knowledge and best practices for developing UI components with Mantine UI v7, ensuring consistency with the project's "darmasaba-dashboard-noc" aesthetic and technical standards.

## Core Guidelines

### 1. Visual Standards
- **Primary Color**: `#1E3A5F` (Brand Blue)
- **Dark Mode Background**: `#1E293B` (Slate 800)
- **Border Color (Dark)**: `#334155` (Slate 700)
- **Radius**: Always use `"xl"` or `"md"` for cards and buttons to maintain a modern, rounded look.
- **Shadow**: Use subtle shadows (e.g., `0 1px 3px 0 rgb(0 0 0 / 0.1)`).

### 2. Code Standards (Biome)
- **Indentation**: Use **tabs**.
- **Quotes**: Use **double quotes** for strings.
- **Imports**: Prefer named imports from `@mantine/core`.

### 3. Mantine v7 Specifics
- Use `useMantineColorScheme()` for dark mode detection.
- Use the `style` prop or CSS variables (`vars`) for custom styling; avoid the deprecated `sx` prop.
- Leverage `Group`, `Stack`, and `Grid` for layouts instead of raw CSS Flexbox/Grid where possible.

## Common Tasks

### Creating a Stat Card
Use the `StatCard` pattern from `src/components/dashboard/stat-card.tsx`:
- Props: `title`, `value`, `detail`, `trend`, `icon`.
- Responsiveness: Wrap in `Grid.Col` with breakpoints (e.g., `span={{ base: 12, md: 6, lg: 3 }}`).

### Handling Dark Mode
```tsx
const { colorScheme } = useMantineColorScheme();
const dark = colorScheme === "dark";

return (
	<Card bg={dark ? "#1E293B" : "white"}>
		{/* content */}
	</Card>
);
```

### Responsive Layouts
Always use Mantine's object-based `span` and `gutter` props:
```tsx
<Grid gutter="md">
	<Grid.Col span={{ base: 12, md: 6 }}>
		{/* content */}
	</Grid.Col>
</Grid>
```

## Resources
- **Styling Guide**: See [references/styling-guide.md](references/styling-guide.md) for advanced styling techniques.
- **Common Patterns**: See [references/common-patterns.md](references/common-patterns.md) for boilerplate of modals, tables, and forms.
