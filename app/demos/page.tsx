import Section from "../components/Section";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Demos - Omkar Patil",
  description: "Interactive demonstrations of Neural ODEs, Lyapunov-based Deep Neural Networks, Control Barrier Functions, Physics-Informed Neural Networks, and more machine learning concepts.",
  alternates: {
    canonical: "/demos",
  },
  openGraph: {
    title: "Interactive Demos - Omkar Patil",
    description: "Interactive demonstrations of Neural ODEs, LbDNNs, CBFs, PINNs, and machine learning concepts.",
    url: "https://omkarsudhirpatil.com/demos",
    type: "website",
  },
};

export default function DemosPage() {
  const demos = [
    {
      name: "Neural ODE",
      href: "/neural_ODE.html",
    },
    {
      name: "Lyapunov-based Deep Neural Network",
      href: "/LbDNN Quadrotor.html",
    },
    {
	  name: "Control Barrier Functions Lab",
      href: "/CBF Lab.html",
    },
    {
      name: "Neural Alpha Beta Chess",
      href: "/neural_alpha_beta_chess_interactive.html",
    },
	{
	  name: "Multi-Agent Systems Lab",
	  href: "/Multi-Agent Systems Lab.html",
	},
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full">
        <Section title="Interactive Demos">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {demos.map((demo) => (
              <Link href={demo.href} key={demo.href} passHref>
                <div className="block rounded-lg border p-4 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <h3 className="text-lg font-semibold">{demo.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
