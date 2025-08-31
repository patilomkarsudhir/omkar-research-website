import Section from "../../components/Section";
import Image from "next/image";
import dynamic from "next/dynamic";

const ResearchPublications = dynamic(() => import("../../components/ResearchPublications"), { ssr: false });

export default function Page() {
  return (
    <div className="space-y-12">
      <Section title="Lyapunov-based Deep Neural Networks (LbDNNs)">
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
          <div className="md:col-span-8">
            <p className="text-[var(--muted)]">
              Developing deep neural network-based controllers that adapt in real-time with stability guarantees is a challenging task. In <a href="https://ieeexplore.ieee.org/abstract/document/9650517" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-700">my 2022 result</a>, I developed the first DNN-based controller with Lyapunov-based adaptation techniques, solving a 25 year old open problem, enabling it to maintain stability while learning from its environment. From that work has emerged a new class of adaptive control strategies, termed Lyapunov-based neural networks (LbDNNs), that leverage the strengths of deep learning while ensuring robust performance in the face of uncertainties. More recently, I have been exploring the integration of LbDNNs with other machine learning techniques to further enhance their adaptability and performance. The result has been extended to solve various problems such as robot herding, model-based reinforcement learning, multiagent target tracking, adaptive safety, stochastic control, physics-informed learning, output feedback control.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Related Publications">
        <ResearchPublications category="lbdnn" title="LbDNN Publications" />
      </Section>
    </div>
  );
}
