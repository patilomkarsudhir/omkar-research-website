import Section from "../components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "CV - Omkar Patil",
	description: "Curriculum Vitae of Omkar Sudhir Patil - Education, Experience, Awards, Teaching, and Service",
};

export default function CVPage() {
	return (
		<div className="pt-8 space-y-10">
			{/* Download CV Card */}
			<div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm">
				<div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex-1 text-center sm:text-left">
						<h2 className="text-xl font-semibold mb-2">Download Full CV</h2>
						<p className="text-[var(--muted)] text-sm">
							Get the complete PDF version with all publications, detailed experience, and references
						</p>
					</div>
					<a
						href="/CV Files/academic_cv.pdf"
						download="Omkar_Patil_CV.pdf"
						className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
					>
						<svg
							className="w-5 h-5 transition-transform group-hover:translate-y-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span>Download PDF</span>
						<div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</a>
				</div>
				{/* Decorative elements */}
				<div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-xl" />
				<div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-purple-500/10 blur-xl" />
			</div>

			<Section title="Education">
				<div className="space-y-6">
					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">University of Florida</h3>
							<p className="text-[var(--muted)] font-medium">PhD in Mechanical Engineering</p>
							<div className="mt-2 text-[var(--muted)]">
								<p><strong>Advisor:</strong> Dr. Warren Dixon</p>
								<p><strong>Dissertation:</strong> <a 
									href="/Dissertation.pdf" 
									target="_blank" 
									rel="noopener noreferrer"
									className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
								>
									Implicit and Deep Learning-Based Control Methods for Uncertain Nonlinear Systems
								</a></p>
							</div>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							Aug 2019 - May 2023
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">University of Florida</h3>
							<p className="text-[var(--muted)] font-medium">MS in Mechanical Engineering</p>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							Aug 2019 - Aug 2022
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">Indian Institute of Technology Delhi</h3>
							<p className="text-[var(--muted)] font-medium">B.Tech in Production and Industrial Engineering</p>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							Jul 2014 - Aug 2018
						</div>
					</div>
				</div>
			</Section>

			<Section title="Experience">
				<div className="space-y-6">
					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">Postdoctoral Research Associate</h3>
							<p className="text-[var(--muted)] font-medium">University of Florida</p>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							May 2023 - Present
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">Graduate Research Assistant</h3>
							<p className="text-[var(--muted)] font-medium">University of Florida</p>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							Aug 2019 - May 2023
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
						<div className="flex-1">
							<h3 className="text-lg font-semibold">Project Associate</h3>
							<p className="text-[var(--muted)] font-medium">Indian Institute of Technology Delhi</p>
						</div>
						<div className="text-[var(--muted)] text-sm md:text-base md:text-right whitespace-nowrap">
							May 2018 - Apr 2019
						</div>
					</div>
				</div>
			</Section>

			<Section title="Awards">
				<div className="space-y-4">
					<div className="border-l-2 border-[var(--accent)] pl-4">
						<h3 className="text-lg font-semibold">Graduate Student Research Award</h3>
						<p className="text-[var(--muted)] text-sm">2023</p>
						<p className="text-[var(--muted)] mt-1">
							For outstanding research as a graduate student in the Department of Mechanical and Aerospace Engineering, University of Florida
						</p>
					</div>

					<div className="border-l-2 border-[var(--accent)] pl-4">
						<h3 className="text-lg font-semibold">BOSS Award</h3>
						<p className="text-[var(--muted)] text-sm">2018</p>
						<p className="text-[var(--muted)] mt-1">
							For the best hardcore experimental project in Mechanical Engineering discipline, IIT Delhi
						</p>
					</div>
				</div>
			</Section>

			<Section title="Invited Talks">
				<div className="space-y-4">
					<div className="border-l-2 border-blue-500/30 pl-4">
						<h3 className="text-base font-semibold">"Composite Adaptive Lyapunov-based Deep Neural Network Control"</h3>
						<p className="text-[var(--muted)] text-sm italic">AFOSR COE Program Review, Duke University</p>
						<p className="text-[var(--muted)] text-sm">December 2023</p>
					</div>

					<div className="border-l-2 border-blue-500/30 pl-4">
						<h3 className="text-base font-semibold">"Deep Residual Neural Network (ResNet)-based Adaptive Control: A Lyapunov-based Approach"</h3>
						<p className="text-[var(--muted)] text-sm italic">AFOSR COE Program Review, University of Florida</p>
						<p className="text-[var(--muted)] text-sm">April 2023</p>
					</div>

					<div className="border-l-2 border-blue-500/30 pl-4">
						<h3 className="text-base font-semibold">"Lyapunov-derived control and adaptive update laws for inner and outer layer weights of a deep neural network"</h3>
						<p className="text-[var(--muted)] text-sm italic">Resilient and Autonomous Systems Lab (RASLab), Florida State University</p>
						<p className="text-[var(--muted)] text-sm">December 2021</p>
					</div>

					<div className="border-l-2 border-blue-500/30 pl-4">
						<h3 className="text-base font-semibold">"Lyapunov-derived control and adaptive update laws for inner and outer layer weights of a deep neural network"</h3>
						<p className="text-[var(--muted)] text-sm italic">Air Force Office of Scientific Research (AFOSR) Center of Excellence Program Review, Duke University</p>
						<p className="text-[var(--muted)] text-sm">October 2021</p>
					</div>
				</div>
			</Section>

			<Section title="Teaching Experience">
				<div className="border-l-2 border-green-500/30 pl-4">
					<h3 className="text-lg font-semibold">Teaching Assistant - Vibrations (EML4220)</h3>
					<p className="text-[var(--muted)] text-sm">University of Florida</p>
					<p className="text-[var(--muted)] text-sm">Spring 2020</p>
				</div>
			</Section>

			<Section title="Peer Review Service">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h3 className="text-base font-semibold mb-3 text-[var(--accent)]">Journals</h3>
						<ul className="space-y-2 text-[var(--muted)] text-sm">
							<li>• IEEE Transactions on Automatic Control</li>
							<li>• Automatica</li>
							<li>• IEEE Control Systems Letters</li>
							<li>• IEEE Transactions on Control Systems Technology</li>
							<li>• IEEE/ASME Transactions on Mechatronics</li>
							<li>• IEEE Transactions on Neural Networks and Learning Systems</li>
							<li>• International Journal of Adaptive Control and Signal Processing</li>
						</ul>
					</div>
					<div>
						<h3 className="text-base font-semibold mb-3 text-[var(--accent)]">Conferences</h3>
						<ul className="space-y-2 text-[var(--muted)] text-sm">
							<li>• Advances on Neural Information Processing Systems (NeurIPS)</li>
							<li>• International Conference on Learning and Representations (ICLR)</li>
							<li>• IEEE Conference on Decision and Control</li>
							<li>• American Control Conference</li>
							<li>• IFAC World Congress</li>
						</ul>
					</div>
				</div>
			</Section>
		</div>
	);
}
