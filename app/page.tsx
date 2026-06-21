import Section from "./components/Section";
import Link from "next/link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import SchoolIcon from "@mui/icons-material/School";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Omkar Patil - Controls, Robotics, AI Research",
	description: "Incoming Assistant Professor at LSU (Fall 2026) and founder of ARC Lab. Research in adaptive control, robotics, and AI with provable stability and safety guarantees.",
	authors: [{ name: "Omkar Sudhir Patil" }],
	creator: "Omkar Sudhir Patil",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Omkar Patil - Controls, Robotics, AI Research",
		description: "Incoming Assistant Professor at LSU and founder of ARC Lab. Research in adaptive control, robotics, and AI with provable guarantees.",
		url: "https://omkarsudhirpatil.com",
		siteName: "Omkar Patil Research",
		images: [
			{
				url: "/research-overview-thumbnail.svg",
				width: 1200,
				height: 630,
				alt: "Omkar Patil - Controls, Robotics, AI Research Overview",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Omkar Patil - Controls, Robotics, AI Research",
		description: "Incoming Assistant Professor at LSU and founder of ARC Lab. Adaptive control, robotics, and AI with provable guarantees.",
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
		name: "Multi-Agent Systems Lab",
		href: "/Multi-Agent Systems Lab.html",
		color: "from-sky-500/20 to-sky-700/30",
		thumb: "/Multi Agent Pic.png",
	},
	{
		name: "Control Barrier Functions Lab",
		href: "/CBF Lab.html",
		color: "from-amber-500/20 to-amber-700/30",
		thumb: "/CBF Lab Pic.png",
	},
	{
		name: "Neural ODE",
		href: "/neural_ODE.html",
		color: "from-indigo-500/20 to-indigo-700/30",
		thumb: "/Neural ODEs.png",
	},
	{
		name: "Neural Alpha Beta Chess",
		href: "/neural_alpha_beta_chess_interactive.html",
		color: "from-fuchsia-500/20 to-fuchsia-700/30",
		thumb: "/chess.jpg",
	},
	{
		name: "Physics-Informed Neural Networks",
		href: "/PINN.html",
		color: "from-purple-500/20 to-purple-700/30",
		thumb: "/PINNs.png",
	},
	{
		name: "Simultaneous Localization and Mapping",
		href: "/SLAM.html",
		color: "from-cyan-500/20 to-cyan-700/30",
		thumb: "/SLAM.png",
	},
];

export default function Page() {
	return (
		<div className="space-y-10">
			<h1 className="sr-only">Omkar Sudhir Patil</h1>
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
					<div className="space-y-4">
						<p className="text-[var(--muted)]">
							I am joining Louisiana State University as a tenure-track Assistant Professor in the Department of Electrical and Computer Engineering in Fall 2026, where I am founding the Adaptive Control and Robotics (ARC) Lab. My research integrates control theory, adaptive methods, and deep learning to build autonomous systems with mathematically certifiable stability and safety guarantees.
						</p>
						<p className="text-[var(--muted)]">
							My work has focused on Lyapunov-based learning and control for uncertain nonlinear systems, including deep neural network adaptation, safe control with barrier methods, and online physics-aware learning. I aim to develop methods that can move reliably from proof to platform, with validation on real robotic systems.
						</p>
					</div>
				</div>
			</Section>
			<Section title="ARC Lab at LSU" subtitle="Adaptive Control and Robotics Lab (launching Fall 2026)">
				<div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--panel)] to-white/[0.02] p-6 md:p-7">
					<div className="grid gap-6 md:grid-cols-12 md:items-center">
						<div className="md:col-span-4 flex justify-center md:justify-start">
							<img
								src="/ARC Lab Best.png"
								alt="ARC Lab logo"
								className="max-h-32 w-auto object-contain"
							/>
						</div>
						<div className="md:col-span-8 space-y-4">
							<p className="text-[var(--muted)]">
								ARC Lab works on the frontier between modern AI and nonlinear control: systems that can learn online in uncertain, real-world environments while preserving provable stability and safety through Lyapunov-based certification.
							</p>
							<p className="text-[var(--muted)]">
								Funded PhD positions are open for Fall 2026. I am especially excited to connect with students interested in adaptive control, safe autonomy, multi-agent systems, physics-aware learning, and learning-enabled robotics.
							</p>
							<div className="flex flex-wrap gap-3">
								<Link href="/arc-lab" className="inline-flex items-center rounded-md border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
									Explore ARC Lab
								</Link>
								<a href="/ARC_Lab_PhD_Flyer.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">
									View PhD Flyer
								</a>
							</div>
						</div>
					</div>
				</div>
			</Section>
			<Section title="Interactive Demos">
				<div className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
					{demos.map((demo) => (
						<a href={demo.href} key={demo.href} className="group">
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
						</a>
					))}
				</div>
			</Section>
			<Section title="Quick Tools and Accessories">
				<p className="text-[var(--muted)] mb-6">Tools I made for my personal use but do not mind sharing with everyone.</p>
				<div className="flex gap-4 flex-wrap">
					<a href="/bulletcad.html" className="group">
						<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-red-500/20 to-red-700/30 transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 w-[210px] h-48">
							<div className="h-28 sm:h-32 w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20">
								<img
									src="/BulletCAD.png"
									alt="BulletCAD"
									className="h-full w-full object-cover object-center scale-[1.01] transition-transform duration-500 group-hover:scale-[1.05]"
									loading="lazy"
								/>
							</div>
							<div className="p-3 flex items-start gap-3">
								<div className="flex-1">
									<h3 className="text-base font-semibold tracking-tight">BulletCAD</h3>
								</div>
							</div>
							<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
							<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
						</div>
					</a>
					<a href="/convert-images.html" className="group">
						<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-orange-700/30 transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 w-[210px] h-48">
							<div className="h-28 sm:h-32 w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20">
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-600 dark:text-orange-400">
									<path d="M14 2H6C5.45 2 4.95 2.2 4.59 2.59C4.2 2.95 4 3.45 4 4V20C4 20.55 4.2 21.05 4.59 21.41C4.95 21.8 5.45 22 6 22H18C18.55 22 19.05 21.8 19.41 21.41C19.8 21.05 20 20.55 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div className="p-3 flex items-start gap-3">
								<div className="flex-1">
									<h3 className="text-base font-semibold tracking-tight">Image Format Converter</h3>
								</div>
							</div>
							<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
							<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
						</div>
					</a>
					<a href="/pdf-tools.html" className="group">
						<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-red-500/20 to-red-700/30 transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 w-[210px] h-48">
							<div className="h-28 sm:h-32 w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20">
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600 dark:text-red-400">
									<path d="M14 2H6C5.45 2 4.95 2.2 4.59 2.59C4.2 2.95 4 3.45 4 4V20C4 20.55 4.2 21.05 4.59 21.41C4.95 21.8 5.45 22 6 22H18C18.55 22 19.05 21.8 19.41 21.41C19.8 21.05 20 20.55 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div className="p-3 flex items-start gap-3">
								<div className="flex-1">
									<h3 className="text-base font-semibold tracking-tight">PDF Tools</h3>
								</div>
							</div>
							<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
							<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
						</div>
					</a>
					<a href="/latex_scratchpad.html" className="group">
						<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-sky-700/30 transition shadow-sm hover:shadow-md hover:brightness-110 dark:border-white/5 w-[210px] h-48">
							<div className="h-28 sm:h-32 w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/20 dark:to-sky-800/20">
								{/* Simple LaTeX wordmark-style icon */}
								<svg width="92" height="40" viewBox="0 0 184 80" xmlns="http://www.w3.org/2000/svg" className="text-sky-700 dark:text-sky-300" fill="currentColor" aria-hidden="true">
									<text x="0" y="56" fontFamily="Georgia, 'Times New Roman', Times, serif" fontSize="56" fontWeight="700" letterSpacing="1">LaTeX</text>
								</svg>
							</div>
							<div className="p-3 flex items-start gap-3">
								<div className="flex-1">
									<h3 className="text-base font-semibold tracking-tight">LaTeX Scratchpad</h3>
								</div>
							</div>
							<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
							<div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-xl group-hover:scale-125 transition" />
						</div>
					</a>
				</div>
			</Section>
		</div>
	);
}
