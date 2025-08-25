import Section from "./components/Section";
import HeroMetricsClient from "./components/HeroMetricsClient";
import Link from "next/link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolIcon from "@mui/icons-material/School";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Omkar Patil - Control Systems & AI Research",
	description: "Postdoctoral Research Associate at University of Florida specializing in adaptive control, robotics, and deep learning. Expert in Lyapunov-based techniques, control barrier functions, and neural network adaptation for nonlinear systems.",
	keywords: ["control systems", "adaptive control", "robotics", "deep learning", "neural networks", "Lyapunov control", "control barrier functions", "research", "AI", "machine learning"],
	authors: [{ name: "Omkar Sudhir Patil" }],
	creator: "Omkar Sudhir Patil",
	openGraph: {
		title: "Omkar Patil - Control Systems & AI Research",
		description: "Innovative control strategies for robotics and automation. Interactive demos, research publications, and cutting-edge solutions in adaptive control and machine learning.",
		url: "https://omkarsudhirpatil.com",
		siteName: "Omkar Patil Research",
		images: [
			{
				url: "/research-overview-thumbnail.svg",
				width: 1200,
				height: 630,
				alt: "Omkar Patil - Control Systems & AI Research Overview",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Omkar Patil - Control Systems & AI Research",
		description: "Innovative control strategies for robotics and automation. Interactive demos and cutting-edge research.",
		images: ["/research-overview-thumbnail.svg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

// Data URI thumbnails (SVG) so no extra asset files are needed
const demos = [
	{
		name: "Lyapunov-based Deep Neural Network",
		href: "/LbDNN Quadrotor.html",
		color: "from-emerald-500/20 to-emerald-700/30",
		thumb: "/LbDNN Quadrotor Pic.png",
	},
	{
		name: "Neural ODE",
		href: "/neural_ODE.html",
		color: "from-indigo-500/20 to-indigo-700/30",
		thumb: "/Neural ODEs.png",
	},
	{
		name: "Control Barrier Functions Lab",
		href: "/CBF Lab.html",
		color: "from-amber-500/20 to-amber-700/30",
		thumb: "/CBF Lab Pic.png",
	},
	{
		name: "Neural Alpha Beta Chess",
		href: "/neural_alpha_beta_chess_interactive.html",
		color: "from-fuchsia-500/20 to-fuchsia-700/30",
		thumb: "/chess.jpg",
	},
];

export default function Page() {
	return (
		<div className="space-y-10">
			<Section title="About Me">
				<div className="flex flex-col sm:flex-row items-center gap-8">
					<div className="flex flex-col items-center">
						<div className="w-48 h-48 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 border-4 border-white/10 shadow-md overflow-hidden">
							<img src="/Profile Pic.jpg" alt="Omkar Patil" className="w-full h-full object-cover" />
						</div>
						<div className="mt-3 flex items-center gap-4 text-[var(--muted)]">
							<a
								href="https://www.linkedin.com/in/omkar-patil-024"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="LinkedIn"
								className="hover:text-[var(--accent)] transition-colors"
							>
								<LinkedInIcon fontSize="small" />
							</a>
							<a
								href="https://github.com/patilomkarsudhir"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHub"
								className="hover:text-[var(--accent)] transition-colors"
							>
								<GitHubIcon fontSize="small" />
							</a>
							<a
								href="https://scholar.google.com/citations?hl=en&user=EtkfNQMAAAAJ"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Google Scholar"
								className="hover:text-[var(--accent)] transition-colors"
							>
								<SchoolIcon fontSize="small" />
							</a>
						</div>
					</div>
					<p className="text-[var(--muted)]">
						I’m a Postdoctoral Research Associate at the University of Florida with a PhD specializing in cutting-edge control systems, robotics, and deep learning-based methods. My work bridges advanced control theory, adaptive algorithms, and machine learning to design robust, real-time solutions for uncertain nonlinear systems and multi-agent environments. My research has led to breakthroughs in solving longstanding open problems in adaptive control and stability analysis, notably extending Lyapunov-based techniques to deep neural networks. I’ve developed innovative methods, ranging from Lyapunov-derived adaptive laws and safety-focused control barrier functions to physics-informed online learning algorithms, that have been implemented in real-world robotic platforms and validated through extensive experimentation. I’m always eager to connect with fellow researchers, industry professionals, and anyone interested in the intersection of control theory, robotics, AI, and machine learning. Let’s explore how innovative control strategies can transform robotics, automation, and beyond.
					</p>
				</div>
			</Section>
			<Section title="At a glance" subtitle="Live metrics from Google Scholar">
				<HeroMetricsClient />
			</Section>
			<Section title="Interactive Demos">
				<div className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
					{demos.map((demo) => (
						<Link href={demo.href} key={demo.href} className="group" passHref>
							{demo.name === "Neural ODE" ? (
								<div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${demo.color} transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 max-w-[210px] mx-auto h-48`}>
									{/* Full-image background for Neural ODE */}
									<img
										src={demo.thumb}
										alt={demo.name + ' thumbnail'}
										className="absolute inset-0 h-full w-full object-contain object-center scale-[1.01] transition-transform duration-500 group-hover:scale-[1.05]"
										loading="lazy"
									/>
									{/* Transparent text overlay */}
									<div className="pointer-events-none absolute inset-0 flex items-end">
										<div className="p-3">
											<h3 className="text-base font-semibold tracking-tight">{demo.name}</h3>
											{/* removed subtitle per request */}
										</div>
									</div>
									<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
									<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
								</div>
							) : (
								<div className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${demo.color} transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 max-w-[210px] mx-auto h-48`}>
									<div className="h-28 sm:h-32 w-full overflow-hidden">
										<img
											src={demo.thumb}
											alt={demo.name + ' thumbnail'}
											className="h-full w-full object-cover object-center scale-[1.01] transition-transform duration-500 group-hover:scale-[1.05]"
											loading="lazy"
										/>
									</div>
									<div className="p-3 flex items-start gap-3">
										<div className="flex-1">
											<h3 className="text-base font-semibold tracking-tight">{demo.name}</h3>
											{/* removed subtitle per request */}
										</div>
									</div>
									<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
									<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
								</div>
							)}
						</Link>
					))}
				</div>
			</Section>
		</div>
	);
}
