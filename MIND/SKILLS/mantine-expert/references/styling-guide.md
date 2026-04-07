# Mantine v7 Styling Guide

Mantine v7 has removed the `sx` prop in favor of standard `style` props and CSS variables.

## Using the `style` Prop
For simple, static styles or those that depend on component state:
```tsx
<Box
	style={{
		backgroundColor: dark ? "var(--mantine-color-dark-6)" : "white",
		borderRadius: "var(--mantine-radius-md)",
		padding: 20
	}}
>
	Content
</Box>
```

## CSS Variables (`vars`)
Mantine v7 provides a `vars` prop for complex, theme-aware styling:
```tsx
<Button
	vars={(theme, props) => ({
		root: {
			"--button-bg": "#1E3A5F",
			"--button-hover": "#2A4A7F",
		},
	})}
>
	Click Me
</Button>
```

## Responsive Styles with Props
Instead of manual media queries, use Mantine's object notation for props like `span`, `w`, `p`, `m`:
```tsx
<Box w={{ base: "100%", md: "50%", lg: "33.3%" }} p="md">
	Responsive Box
</Box>
```

## Common Project Colors
- **Brand Blue**: `#1E3A5F`
- **Slate (Dark Mode BG)**: `#1E293B`
- **Slate Border (Dark Mode)**: `#334155`
- **Mantine Default Gray (Subtle)**: `gray.2` (Light), `dark.6` (Dark)
