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

const sectionLinks = [
  ["Overview", "#overview"],
  ["Research", "#research"],
  ["People", "#people"],
  ["Join", "#join"],
];

const principalInvestigator = {
  name: "Omkar Sudhir Patil",
  role: "Principal Investigator and Lab Director",
  photo: "/Profile Pic.jpg",
  bio: "Dr. Omkar Sudhir Patil is an Assistant Professor in the Department of Electrical and Computer Engineering at Louisiana State University and the founder and director of the Adaptive Control and Robotics (ARC) Lab. He received his Ph.D. in Mechanical Engineering from the University of Florida, where he later served as a Postdoctoral Research Associate and Research Scientist. His research develops mathematically certified learning and control methods for uncertain nonlinear and robotic systems, with emphasis on Lyapunov-based deep learning, adaptive control, safe autonomy, and multi-agent systems. He received the University of Florida Graduate Student Research Award in 2023 for outstanding research in mechanical and aerospace engineering.",
};

const doctoralResearchers = [
  {
    name: "Hossein Papi",
    role: "Ph.D. Student",
    photo: "/Student Photos/Hossein.jpg",
    bio: "Hossein Papi is a Ph.D. student in the Department of Electrical and Computer Engineering at Louisiana State University, conducting research in the Adaptive Control and Robotics (ARC) Lab under the supervision of Dr. Omkar Sudhir Patil. He received his B.S. in Iran and his M.S. degree in Mechanical and Aerospace Engineering from the University of Florida, building a strong foundation in nonlinear control systems, multi-agent frameworks, and autonomous networks through previous research experiences. His current doctoral research focuses on Lyapunov-based deep neural network control and structure-constrained learning architectures for robotic systems, bridging rigorous theoretical stability guarantees with practical implementations.",
  },
];

const mastersResearchers = [
  {
    name: "Nasser Mohammed",
    role: "Master's Thesis Student",
    photo: "/Student Photos/Nasser.jpg",
    bio: "Nasser Mohammed received his Bachelor of Science degree in Mathematics and Computer Science from Louisiana State University. His research experience spans controls, dynamical systems, state estimation, and computer vision. He is currently pursuing master's degrees in electrical engineering and mathematics under the guidance of Dr. Michael Malisoff, Dr. Yen-Fang Su, and Dr. Omkar Patil. His research interests are primarily in controls, dynamical systems, and their applications to robotics and aerospace. He is currently working on system modeling, latent state estimation, and feedback control in the context of automated manufacturing. His expected graduation date is May 2027.",
  },
];

interface MemberCardProps {
  member: {
    name: string;
    role: string;
    photo: string;
    bio: string;
  };
  isPrincipalInvestigator?: boolean;
}

function MemberCard({ member, isPrincipalInvestigator = false }: MemberCardProps) {
  return (
    <article className="grid overflow-hidden rounded-lg border border-white/10 bg-[var(--panel)] sm:grid-cols-[14rem_1fr]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-weak)] sm:aspect-auto sm:min-h-72">
        <Image
          src={member.photo}
          alt={`${member.name}, ${member.role} ${isPrincipalInvestigator ? "of" : "in"} the ARC Lab`}
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className={isPrincipalInvestigator ? "object-cover" : "object-cover object-top"}
          style={isPrincipalInvestigator ? { transform: "scale(1.5)", transformOrigin: "50% 25%" } : undefined}
        />
      </div>
      <div className="flex flex-col justify-center p-5 sm:p-7">
        <h3 className="text-card-title text-xl">{member.name}</h3>
        <p className="mt-1 text-sm font-medium text-[var(--accent)]">{member.role}</p>
        <p className="mt-4 text-[var(--muted)]">{member.bio}</p>
        {isPrincipalInvestigator && (
          <a href="/cv" className="mt-4 w-fit text-sm font-medium text-[var(--accent)] hover:underline">
            View full CV
          </a>
        )}
      </div>
    </article>
  );
}

export default function ARCLabPage() {
  return (
    <div>
      <nav
        aria-label="ARC Lab page sections"
        className="mb-8 rounded-lg border border-[var(--border-soft)] bg-[var(--panel)] p-1 lg:hidden"
      >
        <div className="grid grid-cols-4 gap-1">
          {sectionLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-2 py-2 text-center text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-weak)] hover:text-[var(--accent)]"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[11rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="ARC Lab page sections" className="sticky top-6 border-l border-[var(--border-soft)] pl-4">
            <p className="mb-3 text-xs font-semibold uppercase text-[var(--muted)]">On this page</p>
            <div className="space-y-1">
              {sectionLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="block rounded-r-md border-l-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-weak)] hover:text-[var(--accent)]"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 space-y-8">
      <div id="overview" className="scroll-mt-6">
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
            </div>
          </div>
        </div>
        </Section>
      </div>

      <div id="research" className="scroll-mt-24">
        <Section title="Research" subtitle="Certified learning and control for real-world autonomy">
          <p className="max-w-4xl text-[var(--muted)]">
            The next frontier of autonomy is embodied AI operating safely in the real world. ARC Lab
            focuses on the gap between high-capacity learning and rigorous control guarantees. We
            pursue frameworks where adaptation laws are paired with analyzable certificates so that
            stability and convergence can be verified, not just observed in simulation.
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="border-l-2 border-[var(--accent)] pl-5">
              <h3 className="text-card-title text-lg">Research Thrusts</h3>
              <ul className="mt-3 space-y-3 text-[var(--muted)]">
                {thrusts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="border-l-2 border-[var(--gold)] pl-5">
              <h3 className="text-card-title text-lg">Application Frontiers</h3>
              <ul className="mt-3 space-y-3 text-[var(--muted)]">
                {applications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <div id="people" className="scroll-mt-24">
        <Section title="People" subtitle="Researchers in the Adaptive Control and Robotics Lab">
        <div className="space-y-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[var(--accent)]">
              Principal Investigator
            </p>
            <MemberCard member={principalInvestigator} isPrincipalInvestigator />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[var(--accent)]">
              Doctoral Researchers
            </p>
            <div className="grid gap-5">
              {doctoralResearchers.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase text-[var(--accent)]">
              Master&apos;s Researchers
            </p>
            <div className="grid gap-5">
              {mastersResearchers.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </div>
        </Section>
      </div>

      <div id="join" className="scroll-mt-24">
        <Section title="Join the Lab" subtitle="Funded Ph.D. positions for Spring 2027 and Fall 2027">
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
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:opatil1@lsu.edu?subject=[ARC%20Lab%20PhD]"
              className="inline-flex items-center rounded-md border border-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              Contact the Lab
            </a>
            <a
              href="/ARC_Lab_PhD_Flyer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              View Ph.D. Flyer
            </a>
          </div>
        </div>
        </Section>
      </div>
        </div>
      </div>
    </div>
  );
}
