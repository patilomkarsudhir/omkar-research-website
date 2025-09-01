import VisitorAnalytics from "../components/VisitorAnalytics";
import VercelAnalyticsCard from "../components/VercelAnalyticsCard";
import Section from "../components/Section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics - Omkar Patil",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <Section title="Site Analytics" subtitle="Detailed visitor analytics and insights">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <VisitorAnalytics />
          <VercelAnalyticsCard />
        </div>
        </div>
      
      <Section title="Analytics Overview">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Understanding Your Analytics</h3>
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <p><strong className="text-white">Online Now:</strong> Current active visitors on your site (sessions active within the last 5 minutes)</p>
            <p><strong className="text-white">Total Visits:</strong> Cumulative count of all visitor sessions since tracking began</p>
            <p><strong className="text-white">Unique Visitors:</strong> Number of distinct IP addresses that have visited your site</p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">How It Works</h4>
            <ul className="text-xs text-[var(--muted)] space-y-1">
              <li>• Sessions are tracked using browser localStorage with unique IDs</li>
              <li>• Visitor presence updates every 30 seconds while browsing</li>
              <li>• Sessions expire after 5 minutes of inactivity</li>
              <li>• Unique visitors are identified by IP address</li>
              <li>• Data is stored locally in JSON format</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Bot Protection</h4>
            <ul className="text-xs text-[var(--muted)] space-y-1">
              <li>• Filters out search engine crawlers (Google, Bing, etc.)</li>
              <li>• Blocks social media bots and scrapers</li>
              <li>• Detects headless browsers and automated tools</li>
              <li>• Validates user agents and browser features</li>
              <li>• Only counts real human visitors with JavaScript enabled</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
