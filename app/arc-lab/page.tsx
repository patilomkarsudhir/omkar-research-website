import Section from "../components/Section";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARC Lab - LSU",
  description:
    "Adaptive Control and Robotics (ARC) Lab at LSU, led by Omkar Sudhir Patil. Research at the interface of control theory, robotics, and AI with provable safety and stability guarantees.",
  alternates: {
    canonical: "/arc-lab",
  },
  openGraph: {
    title: "ARC Lab - LSU",
    description:
      "Adaptive Control and Robotics (ARC) Lab at LSU: mathematically certified learning and control for real-world autonomous systems.",
    url: "https://omkarsudhirpatil.com/arc-lab",
    type: "website",
  },
};

const thrusts = [
  "Physics-aware adaptive system identification with online learning of structured dynamics",
  "AI-assisted Lyapunov and safety-certificate synthesis for learning-enabled control",
  "Autonomy on general metric spaces for transferable guarantees across robotic representations",
  "Lyapunov-based deep learning for PDEs",
];

const applications = [
  "Humanoid robotics with adaptive learning under uncertain contact dynamics",
  "Multi-agent and swarm autonomy with distributed guarantees",
  "Autonomy under intermittent and degraded feedback",
  "Energy, power, and physical infrastructure with decentralized constraints",
];

const groupMembers = [
  {
    name: "Hossein Papi",
    role: "Ph.D. Student",
    photo: "/Student Photos/Hossein.jpg",
    bio: "Hossein Papi is a Ph.D. student in the Department of Electrical and Computer Engineering at Louisiana State University, conducting research in the Adaptive Control and Robotics (ARC) Lab under the supervision of Dr. Omkar Sudhir Patil. He received his B.S. in Iran and his M.S. degree in Mechanical and Aerospace Engineering from the University of Florida, building a strong foundation in nonlinear control systems, multi-agent frameworks, and autonomous networks through previous research experiences. His current doctoral research focuses on Lyapunov-based deep neural network control and structure-constrained learning architectures for robotic systems, bridging rigorous theoretical stability guarantees with practical implementations.",
  },
];

export default function ARCLabPage() {
  return (
    <div className="space-y-10">
      <Section title="ARC Lab at LSU" subtitle="Adaptive Control and Robotics Lab">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--panel)] to-white/[0.02] p-6 md:p-7">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-4 flex justify-center md:justify-start">
              <img src="/ARC Lab Best.png" alt="ARC Lab logo" className="max-h-36 w-auto object-contain" />
            </div>
            <div className="md:col-span-8 space-y-4">
              <p className="text-[var(--muted)]">
                The ARC Lab develops mathematically certified methods that fuse adaptive control,
                robotics, and deep learning. Our core direction is Lyapunov-based learning for
                autonomy: systems that can learn online while maintaining provable closed-loop
                stability and safety.
              </p>
              <p className="text-[var(--muted)]">
                The lab is led by Omkar Sudhir Patil, an Assistant Professor in the Department of
                Electrical and Computer Engineering at Louisiana State University.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/ARC_Lab_PhD_Flyer.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                >
                  Download PhD Flyer
                </a>
                <a
                  href="mailto:opatil1@lsu.edu?subject=[ARC%20Lab%20PhD]"
                  className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Contact: opatil1@lsu.edu
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Group Members" subtitle="Researchers in the Adaptive Control and Robotics Lab">
        <div className="grid gap-5">
          {groupMembers.map((member) => (
            <article
              key={member.name}
              className="grid overflow-hidden rounded-lg border border-white/10 bg-[var(--panel)] sm:grid-cols-[14rem_1fr]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-weak)] sm:aspect-auto sm:min-h-72">
                <Image
                  src={member.photo}
                  alt={`${member.name}, ${member.role} in the ARC Lab`}
                  fill
                  sizes="(min-width: 640px) 224px, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-7">
                <h3 className="text-card-title text-xl">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--accent)]">{member.role}</p>
                <p className="mt-4 text-[var(--muted)]">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="The Frontier and Our Answer">
        <p className="text-[var(--muted)]">
          The next frontier of autonomy is embodied AI operating safely in the real world. ARC Lab
          focuses on the gap between high-capacity learning and rigorous control guarantees. We
          pursue frameworks where adaptation laws are paired with analyzable certificates so that
          stability and convergence can be verified, not just observed in simulation.
        </p>
      </Section>

      <Section title="Open Research Thrusts">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[var(--muted)] list-disc pl-5">
          {thrusts.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Application Frontiers">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[var(--muted)] list-disc pl-5">
          {applications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="PhD Recruiting (Spring 2027 and Fall 2027)">
        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-amber-400/10 to-yellow-500/10 p-5">
          <p className="text-[var(--muted)]">
            Funded PhD positions are open for Spring 2027 and Fall 2027. To apply, email <strong>opatil1@lsu.edu</strong> with
            subject <strong>[ARC Lab PhD]</strong> and include your CV, transcripts, and one
            paragraph describing a research problem you find interesting and why.
          </p>
          <p className="text-[var(--muted)] mt-3">
            Department of Electrical and Computer Engineering, Louisiana State University,
            Baton Rouge, LA.
          </p>
        </div>
      </Section>
    </div>
  );
}
