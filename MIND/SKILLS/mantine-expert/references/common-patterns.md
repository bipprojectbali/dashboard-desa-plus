# Mantine v7 Common Patterns

Reusable code patterns for the `darmasaba-dashboard-noc` project.

## 1. Grid Dashboard Layout
For the standard 4-card metric row:
```tsx
<Grid gutter="md">
	<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
		<StatCard ... />
	</Grid.Col>
	<Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
		<StatCard ... />
	</Grid.Col>
	{/* ... and so on */}
</Grid>
```

## 2. Conditional Styling for Dark Mode
Commonly used in Cards and Lists:
```tsx
const { colorScheme } = useMantineColorScheme();
const dark = colorScheme === "dark";

return (
	<Card
		radius="xl"
		withBorder
		bg={dark ? "#1E293B" : "white"}
		style={{
			borderColor: dark ? "#334155" : "transparent",
			boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
		}}
	>
		{/* Card Content */}
	</Card>
);
```

## 3. Modals and Triggers
The project uses `@mantine/modals` for imperative modal management.
```tsx
import { modals } from "@mantine/modals";

const openDeleteModal = () =>
	modals.openConfirmModal({
		title: "Hapus Data",
		children: <Text size="sm">Apakah Anda yakin ingin menghapus data ini?</Text>,
		labels: { confirm: "Hapus", cancel: "Batal" },
		confirmProps: { color: "red", radius: "md" },
		onConfirm: () => console.log("Deleted"),
	});
```

## 4. Forms and Validation
The project uses `@mantine/form`.
```tsx
import { useForm } from "@mantine/form";
import { TextInput, Button } from "@mantine/core";

const form = useForm({
	initialValues: { name: "", email: "" },
	validate: {
		email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
	},
});

return (
	<form onSubmit={form.onSubmit((values) => console.log(values))}>
		<TextInput label="Nama" {...form.getInputProps("name")} radius="md" />
		<Button type="submit" radius="md" mt="md" bg="#1E3A5F">Submit</Button>
	</form>
);
```
