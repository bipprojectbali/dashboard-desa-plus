import {
	ActionIcon,
	Avatar,
	Box,
	Button,
	Card,
	Container,
	Grid,
	Group,
	Image,
	Paper,
	rem,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
	Transition,
	useMantineColorScheme,
} from "@mantine/core";
import {
	IconApi,
	IconBolt,
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandTwitter,
	IconChevronRight,
	IconLock,
	IconMoon,
	IconRocket,
	IconShield,
	IconStack2,
	IconSun,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

// Navigation items
const NAV_ITEMS = [
	{ label: "Home", link: "/" },
	{ label: "Features", link: "#features" },
	{ label: "Testimonials", link: "#testimonials" },
	{ label: "Pricing", link: "/pricing" },
	{ label: "Contact", link: "/contact" },
];

// Features data
const FEATURES = [
	{
		icon: IconBolt,
		title: "Lightning Fast",
		description: "Built on Bun runtime for exceptional performance and speed.",
	},
	{
		icon: IconShield,
		title: "Secure by Design",
		description:
			"Enterprise-grade authentication with Better Auth integration.",
	},
	{
		icon: IconApi,
		title: "RESTful API",
		description:
			"Full-featured API with Elysia.js for seamless backend operations.",
	},
	{
		icon: IconStack2,
		title: "Modern Stack",
		description: "React 19, TanStack Router, and Mantine UI for the best DX.",
	},
	{
		icon: IconLock,
		title: "API Key Auth",
		description: "Secure API key management for external integrations.",
	},
	{
		icon: IconRocket,
		title: "Production Ready",
		description: "Type-safe, tested, and optimized for production deployment.",
	},
];

// Testimonials data
const TESTIMONIALS = [
	{
		id: "testimonial-1",
		name: "Alex Johnson",
		role: "Lead Developer",
		content:
			"This template saved us weeks of setup time. The architecture is clean and well-thought-out.",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "testimonial-2",
		name: "Sarah Williams",
		role: "CTO",
		content:
			"The performance improvements we saw after switching to this stack were remarkable. Highly recommended!",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
	},
	{
		id: "testimonial-3",
		name: "Michael Chen",
		role: "Product Manager",
		content:
			"The developer experience is top-notch. Everything is well-documented and easy to extend.",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
	},
];

function NavigationBar() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<Box
			h={70}
			px="md"
			style={{
				borderBottom: "1px solid var(--mantine-color-gray-2)",
				transition: "all 0.3s ease",
				boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Group h="100%" justify="space-between">
				<Group>
					<Link to="/" style={{ textDecoration: "none" }}>
						<Title order={3} c="blue">
							BunStack
						</Title>
					</Link>
					<Group ml={50} visibleFrom="sm" gap="lg">
						{NAV_ITEMS.map((item) => {
							const isActive = window.location.pathname === item.link;
							return (
								<Box
									key={item.label}
									component={Link}
									to={item.link}
									style={{
										textDecoration: "none",
										fontSize: rem(16),
										padding: `${rem(8)} ${rem(12)}`,
										borderRadius: rem(6),
										transition: "all 0.2s ease",
										color: isActive
											? "var(--mantine-color-blue-6)"
											: "var(--mantine-color-dimmed)",
										fontWeight: 500,
										cursor: "pointer",
										display: "block",
									}}
									className="nav-item"
								>
									{item.label}
								</Box>
							);
						})}
					</Group>
				</Group>

				<Group>
					<ActionIcon
						variant="default"
						onClick={() => toggleColorScheme()}
						size="lg"
					>
						{colorScheme === "dark" ? (
							<IconSun size={18} />
						) : (
							<IconMoon size={18} />
						)}
					</ActionIcon>
					<Button component={Link} to="/signin" variant="light" size="sm">
						Sign In
					</Button>
					<Button component={Link} to="/signup" size="sm">
						Get Started
					</Button>
				</Group>
			</Group>
		</Box>
	);
}

function HeroSection() {
	const [loaded, setLoaded] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	// Simulate delay for image transition
	useEffect(() => {
		const timer = setTimeout(() => {
			setImageLoaded(true);
		}, 200);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Box
			pt={rem(140)} // Adjusted padding for simpler header
			pb={rem(60)}
		>
			<Container size="lg">
				<Grid gutter={{ base: rem(40), md: rem(80) }} align="center">
					<Grid.Col span={{ base: 12, md: 6 }}>
						<Transition
							mounted={loaded}
							transition="slide-up"
							duration={600}
							timingFunction="ease"
						>
							{(styles) => (
								<Stack gap="xl" style={styles}>
									<Title
										order={1}
										style={{
											fontSize: rem(48),
											fontWeight: 900,
											lineHeight: 1.2,
										}}
									>
										Build Faster with{" "}
										<Text span c="blue" inherit>
											Bun Stack
										</Text>
									</Title>
									<Text size="xl" c="dimmed">
										A modern, full-stack React template powered by Bun,
										Elysia.js, and TanStack Router. Ship your ideas faster than
										ever.
									</Text>
									<Group gap="md">
										<Button
											component={Link}
											to="/admin"
											size="lg"
											variant="filled"
											rightSection={<IconRocket size="1.25rem" />}
										>
											Get Started
										</Button>
										<Button
											component={Link}
											to="/docs"
											size="lg"
											variant="outline"
										>
											Learn More
										</Button>
									</Group>
								</Stack>
							)}
						</Transition>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<Transition
							mounted={imageLoaded}
							transition="slide-left"
							duration={800}
							timingFunction="ease"
						>
							{(styles) => (
								<Paper shadow="xl" radius="lg" p="md" withBorder style={styles}>
									<Image
										src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
										alt="Code editor showing Bun Stack code"
										radius="md"
									/>
								</Paper>
							)}
						</Transition>
					</Grid.Col>
				</Grid>
			</Container>
		</Box>
	);
}

function AnimatedFeatureCard({
	feature,
	index,
	isVisible,
}: {
	feature: (typeof FEATURES)[number];
	index: number;
	isVisible: boolean;
}) {
	const [isDelayedVisible, setIsDelayedVisible] = useState(isVisible);

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				setIsDelayedVisible(true);
			}, index * 100);
			return () => clearTimeout(timer);
		}
	}, [isVisible, index]);

	return (
		<Transition
			mounted={isDelayedVisible}
			transition="slide-up"
			duration={500}
			timingFunction="ease"
		>
			{(styles) => (
				<Card
					className="feature-card"
					padding="lg"
					radius="md"
					withBorder
					shadow="sm"
					style={styles}
				>
					<ThemeIcon variant="light" color="blue" size={60} radius="md">
						<feature.icon size="1.75rem" />
					</ThemeIcon>
					<Stack gap={8} mt="md">
						<Title order={4}>{feature.title}</Title>
						<Text size="sm" c="dimmed" lh={1.5}>
							{feature.description}
						</Text>
					</Stack>
				</Card>
			)}
		</Transition>
	);
}

function FeaturesSection() {
	const [visibleFeatures, setVisibleFeatures] = useState(
		Array(FEATURES.length).fill(false),
	);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry, index) => {
					if (entry.isIntersecting) {
						setVisibleFeatures((prev) => {
							const newVisible = [...prev];
							newVisible[index] = true;
							return newVisible;
						});
					}
				});
			},
			{ threshold: 0.1 },
		);

		const elements = document.querySelectorAll(".feature-card");
		elements.forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<Container size="lg" py={rem(80)}>
			<Stack gap="xl" align="center" mb={rem(50)}>
				<Transition
					mounted={true}
					transition="fade"
					duration={600}
					timingFunction="ease"
				>
					{(styles) => (
						<div style={styles}>
							<Title order={2} ta="center">
								Everything You Need
							</Title>
							<Text c="dimmed" size="lg" ta="center" maw={600}>
								A complete toolkit for building modern web applications with
								best practices built-in.
							</Text>
						</div>
					)}
				</Transition>
			</Stack>
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
				{FEATURES.map((feature, index) => (
					<AnimatedFeatureCard
						key={feature.title}
						feature={feature}
						index={index}
						isVisible={visibleFeatures[index]}
					/>
				))}
			</SimpleGrid>
		</Container>
	);
}

function AnimatedTestimonialCard({
	testimonial,
	index,
	isVisible,
}: {
	testimonial: (typeof TESTIMONIALS)[number];
	index: number;
	isVisible: boolean;
}) {
	const [isDelayedVisible, setIsDelayedVisible] = useState(isVisible);

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => {
				setIsDelayedVisible(true);
			}, index * 150);
			return () => clearTimeout(timer);
		}
	}, [isVisible, index]);

	return (
		<Transition
			mounted={isDelayedVisible}
			transition="slide-up"
			duration={500}
			timingFunction="ease"
		>
			{(styles) => (
				<Card
					padding="lg"
					radius="md"
					withBorder
					shadow="sm"
					className="testimonial-card"
					style={styles}
				>
					<Text c="dimmed" mb="md">
						"{testimonial.content}"
					</Text>
					<Group>
						<Avatar src={testimonial.avatar} size="md" radius="xl" />
						<Stack gap={0}>
							<Text fw={600}>{testimonial.name}</Text>
							<Text size="sm" c="dimmed">
								{testimonial.role}
							</Text>
						</Stack>
					</Group>
				</Card>
			)}
		</Transition>
	);
}

function TestimonialsSection() {
	const [visibleTestimonials, setVisibleTestimonials] = useState(
		Array(TESTIMONIALS.length).fill(false),
	);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry, index) => {
					if (entry.isIntersecting) {
						setVisibleTestimonials((prev) => {
							const newVisible = [...prev];
							newVisible[index] = true;
							return newVisible;
						});
					}
				});
			},
			{ threshold: 0.1 },
		);

		const elements = document.querySelectorAll(".testimonial-card");
		elements.forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<Box py={rem(80)}>
			<Container size="lg">
				<Stack gap="xl" align="center" mb={rem(50)}>
					<Transition
						mounted={true}
						transition="fade"
						duration={600}
						timingFunction="ease"
					>
						{(styles) => (
							<div style={styles}>
								<Title order={2} ta="center">
									Loved by Developers
								</Title>
								<Text c="dimmed" size="lg" ta="center" maw={600}>
									Join thousands of satisfied developers who have accelerated
									their projects with Bun Stack.
								</Text>
							</div>
						)}
					</Transition>
				</Stack>

				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
					{TESTIMONIALS.map((testimonial, index) => (
						<AnimatedTestimonialCard
							key={testimonial.id}
							testimonial={testimonial}
							index={index}
							isVisible={visibleTestimonials[index]}
						/>
					))}
				</SimpleGrid>
			</Container>
		</Box>
	);
}

function CtaSection() {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<Container size="lg" py={rem(80)}>
			<Transition
				mounted={loaded}
				transition="slide-up"
				duration={600}
				timingFunction="ease"
			>
				{(styles) => (
					<Paper
						radius="lg"
						p={rem(60)}
						bg="blue"
						style={{
							...styles,
							background:
								"linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-indigo-6))",
						}}
					>
						<Stack align="center" gap="xl" ta="center">
							<Title c="white" order={2}>
								Ready to get started?
							</Title>
							<Text c="white" size="lg" maw={600}>
								Join thousands of developers who are building faster and more
								reliable applications with Bun Stack.
							</Text>
							<Group>
								<Button
									component={Link}
									to="/signup"
									size="lg"
									variant="white"
									color="dark"
									rightSection={<IconChevronRight size="1.125rem" />}
								>
									Create Account
								</Button>
								<Button
									component={Link}
									to="/docs"
									size="lg"
									variant="outline"
									color="white"
								>
									View Documentation
								</Button>
							</Group>
						</Stack>
					</Paper>
				)}
			</Transition>
		</Container>
	);
}

function Footer() {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoaded(true);
		}, 300);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Transition
			mounted={loaded}
			transition="slide-up"
			duration={600}
			timingFunction="ease"
		>
			{(styles) => (
				<Box
					py={rem(40)}
					style={{
						...styles,
						borderTop: "1px solid var(--mantine-color-gray-2)",
					}}
				>
					<Container size="lg">
						<Grid gutter={{ base: rem(40), md: rem(80) }}>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Stack gap="md">
									<Title order={3}>BunStack</Title>
									<Text size="sm" c="dimmed">
										The ultimate full-stack solution for modern web
										applications.
									</Text>
									<Group>
										<ActionIcon size="lg" variant="subtle" color="gray">
											<IconBrandGithub size="1.25rem" />
										</ActionIcon>
										<ActionIcon size="lg" variant="subtle" color="gray">
											<IconBrandTwitter size="1.25rem" />
										</ActionIcon>
										<ActionIcon size="lg" variant="subtle" color="gray">
											<IconBrandLinkedin size="1.25rem" />
										</ActionIcon>
									</Group>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, md: 2 }}>
								<Stack gap="xs">
									<Title order={4}>Product</Title>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/features"
										td="none"
									>
										Features
									</Text>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/pricing"
										td="none"
									>
										Pricing
									</Text>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/docs"
										td="none"
									>
										Documentation
									</Text>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, md: 2 }}>
								<Stack gap="xs">
									<Title order={4}>Company</Title>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/about"
										td="none"
									>
										About
									</Text>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/blog"
										td="none"
									>
										Blog
									</Text>
									<Text
										size="sm"
										c="dimmed"
										component={Link}
										to="/careers"
										td="none"
									>
										Careers
									</Text>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, md: 4 }}>
								<Stack gap="xs">
									<Title order={4}>Subscribe to our newsletter</Title>
									<Text size="sm" c="dimmed">
										Get the latest news and updates
									</Text>
									<Group>
										<input
											type="email"
											placeholder="Your email"
											style={{
												padding: "8px 12px",
												borderRadius: "4px",
												border: "1px solid var(--mantine-color-gray-3)",
												flex: 1,
											}}
										/>
										<Button>Subscribe</Button>
									</Group>
								</Stack>
							</Grid.Col>
						</Grid>

						<Box
							pt={rem(40)}
							style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
						>
							<Group justify="space-between" align="center">
								<Text size="sm" c="dimmed">
									© 2024 Bun Stack. Built with Bun, Elysia, and React.
								</Text>
								<Group gap="lg">
									<Text
										component={Link}
										to="/privacy"
										size="sm"
										c="dimmed"
										style={{ textDecoration: "none" }}
									>
										Privacy Policy
									</Text>
									<Text
										component={Link}
										to="/terms"
										size="sm"
										c="dimmed"
										style={{ textDecoration: "none" }}
									>
										Terms of Service
									</Text>
								</Group>
							</Group>
						</Box>
					</Container>
				</Box>
			)}
		</Transition>
	);
}

function HomePage() {
	return (
		<Box>
			<NavigationBar />
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
			<CtaSection />
			<Footer />
		</Box>
	);
}
