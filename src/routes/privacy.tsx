import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_270)] py-20 px-4 md:px-8 text-white flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
          &larr; Back home
        </Link>
        <h1 className="text-4xl font-display tracking-tight">Privacy Policy</h1>
        <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p>
            Memora ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Memora.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>
            <strong>Account Information:</strong> When you create an account, we collect your email address, name, and authentication credentials. If you use Google OAuth, we receive your basic profile information.
          </p>
          <p>
            <strong>Media Data:</strong> We store the media items you track (movies, books, games, etc.), your ratings, journal entries, and activity logs. This data is the core of the service provided to you.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve the Memora application.</li>
            <li>Process transactions and send related information (if you subscribe to a paid tier).</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Generate personalized analytics and "Wrapped" experiences for your account.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8">3. Data Sharing</h2>
          <p>
            <strong>We do not sell your personal data.</strong> Your media history and journal entries are private by default. We may share information with third-party service providers (such as hosting, payment processors like Stripe, and email delivery services like Resend) solely to provide our service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Data Retention and Deletion</h2>
          <p>
            We retain your data as long as your account is active. You can request to delete your account and all associated data at any time through your account settings or by contacting support.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@memora.app.
          </p>
        </div>
      </div>
    </div>
  );
}
