import Section from "../components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Omkar Patil",
  description: "Get in touch for ARC Lab PhD applications, research collaborations, and academic inquiries in control systems, robotics, and AI.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Page() {
  return (
    <div className="space-y-8">
      <Section title="Contact">
        <p className="text-[var(--muted)]">
          You can reach me via email, connect with me on LinkedIn, or use the form
          below.
        </p>
        <div className="mt-4 space-y-2 text-[var(--muted)]">
          <p>
            <strong>Email (ARC Lab / LSU):</strong> opatil1 [at] lsu.edu
          </p>
          <p>
            <strong>Email (alternate):</strong> omkarpatil64328 [at] gmail.com
          </p>
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a
              href="https://www.linkedin.com/in/omkar-patil-024"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              linkedin.com/in/omkar-patil-024
            </a>
          </p>
        </div>

        {/* Contact Form */}
        <form
          action="https://formsubmit.co/omkarpatil64328@gmail.com"
          method="POST"
          className="mt-6 space-y-4 max-w-md"
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input
            type="hidden"
            name="_subject"
            value="New contact from research website"
          />
          {/* Honeypot field to trap bots */}
          <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
          {/* Redirect after submit to avoid email exposure in URL */}
          <input type="hidden" name="_next" value="/contact?sent=1" />

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-black"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-black"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-1"
            >
              Message
            </label>
            <textarea
              name="message"
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-black"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Send Message
          </button>
        </form>
      </Section>
    </div>
  );
}
