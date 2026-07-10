import Section from "../components/Section";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research - Omkar Patil",
  description: "Research in machine learning and control theory with certifiable guarantees for autonomous systems. Specializing in Lyapunov-based Deep Neural Networks, multi-agent systems, RISE controllers, and safe control methods using Control Barrier Functions.",
  alternates: {
    canonical: "/research",
  },
  openGraph: {
    title: "Research - Omkar Patil",
    description: "Research in machine learning and control theory with certifiable guarantees for autonomous systems.",
    url: "https://omkarsudhirpatil.com/research",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="space-y-12">
      <Section title="Research">
        <p className="text-[var(--muted)] prose-measure">
          My research focuses on the intersection of machine learning and control theory, with an emphasis on developing certifiable guarantees for autonomous systems. My work spans several key areas, each contributing to the overarching goal of creating intelligent systems that are safe, reliable, and efficient.
        </p>
      </Section>
      <div className="space-y-8">
        <Section title="Lyapunov-based Deep Neural Networks (LbDNNs)" href="/research/lbdnns">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
    <div className="md:col-span-4">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
                <Image
                  src="/LbDNN Quadrotor Pic.png"
                  alt="LbDNN-controlled quadrotor illustration"
                  fill
      sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
    <div className="md:col-span-8 space-y-5">
              <p className="text-[var(--muted)] prose-measure">
                Developing deep neural network-based controllers that adapt in real-time with stability guarantees is a challenging task. In <a href="https://ieeexplore.ieee.org/abstract/document/9650517" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-2 hover:text-[var(--accent-strong)]">my 2022 result</a>, I developed the first DNN-based controller with Lyapunov-based adaptation techniques.
              </p>
              <p className="result-statement prose-measure">
                The first deep neural network controller with Lyapunov-based adaptation — <span className="accent">solving a 25-year-old open problem</span> in adaptive control.
              </p>
              <p className="text-[var(--muted)] prose-measure">
                From that work has emerged a new class of adaptive control strategies, termed Lyapunov-based neural networks (LbDNNs), that leverage the strengths of deep learning while ensuring robust performance in the face of uncertainties. More recently, I have been exploring the integration of LbDNNs with other machine learning techniques to further enhance their adaptability and performance. The result has been extended to solve various problems such as robot herding, model-based reinforcement learning, multiagent target tracking, adaptive safety, stochastic control, physics-informed learning, output feedback control.
              </p>
            </div>
          </div>
        </Section>
        <Section title="Multi-Agent Systems" href="/research/multi-agent-systems">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8">
              <p className="text-[var(--muted)] prose-measure">
                I investigate the coordination and control of multiple autonomous agents to achieve collective goals. My work in this domain includes developing decentralized control strategies, communication protocols, and decision-making algorithms that enable teams of robots or other autonomous entities to collaborate effectively and robustly in dynamic environments. These systems are designed to solve problems like target tracking, formation control, and cooperative task execution, ensuring that agents can work together seamlessly even in the presence of uncertainties and disturbances. These results involve sophisticated use of graph theory and tools such graph neural networks to model and analyze the interactions between agents.
              </p>
            </div>
            <div className="md:col-span-4 md:order-last">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
                <Image
                  src="/Multi Agent Pic.png"
                  alt="Illustration of a multi-agent system"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </Section>
        <Section title="RISE Controllers" href="/research/rise-controllers">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
                <Image
                  src="/phase_trajectory.gif"
                  alt="Phase trajectory illustrating system dynamics"
                  fill
                  sizes="(min-width: 768px) 25vw, 100vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            </div>
            <div className="md:col-span-9 space-y-5">
              <p className="text-[var(--muted)] prose-measure">
                The Robust Integral of the Sign of the Error controllers or RISE controllers constitute a class of continuous robust control algorithms developed for nonlinear, control‐affine systems subject to uncertainties and disturbances. Distinguished by their capability to guarantee asymptotic tracking of reference trajectories even in the presence of bounded modeling errors, RISE controllers can be used where the exact system dynamics are unknown.
              </p>
              <p className="result-statement prose-measure">
                RISE controllers were long believed to be only asymptotic — I proved the convergence is in fact <span className="accent">exponential</span>.
              </p>
            </div>
          </div>
        </Section>
        <Section title="Safe Control Methods" href="/research/safe-control-methods">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-9">
              <p className="text-[var(--muted)] prose-measure">
                My research on safe control methods aims to ensure that autonomous systems operate within predefined safety constraints. I utilize techniques such as Control Barrier Functions (CBFs) and Signal Temporal Logic (STL) to design controllers that can formally guarantee safety, preventing the system from entering unsafe states while pursuing its objectives. Furthermore, these safe control methods also enable performance guarantees on complex tasks provided using temporal logic specifications.
              </p>
            </div>
            <div className="md:col-span-3 md:order-last">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
                <Image
                  src="/CBF Lab Pic.png"
                  alt="CBF Lab photo"
                  fill
                  sizes="(min-width: 768px) 25vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
