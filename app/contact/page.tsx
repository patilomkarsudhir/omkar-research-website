"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Section from "../components/Section";

export default function Page() {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if user was redirected back with success parameter
  useEffect(() => {
    if (searchParams.get("sent") === "1") {
      setShowSuccess(true);
      // Clean up the URL by removing the query parameter
      router.replace("/contact", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="space-y-8">
      <Section title="Contact">
        <p className="text-[var(--muted)]">
          You can reach me via email, connect with me on LinkedIn, or use the form
          below.
        </p>
        <div className="mt-4 space-y-2 text-[var(--muted)]">
          <p>
            <strong>Email:</strong> omkarpatil64328 [at] gmail.com
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

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-md max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Message sent successfully! I'll get back to you soon.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex text-green-400 hover:text-green-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

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
          <input type="hidden" name="_next" value={typeof window !== 'undefined' ? `${window.location.origin}/contact?sent=1` : "/contact?sent=1"} />

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
