import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_270)] py-20 px-4 md:px-8 text-white flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">
          &larr; Back home
        </Link>
        <h1 className="text-4xl font-display tracking-tight">Terms of Service</h1>
        <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p>
            Please read these Terms of Service carefully before using Memora (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">2. Subscriptions & Billing</h2>
          <p>
            Some parts of the Service are billed on a subscription basis ("Subscriptions"). You will be billed in advance on a recurring and periodic basis (such as monthly or annually). By purchasing a Subscription, you authorize us to charge the applicable fees to your payment method.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">3. User Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, or graphics ("Content"). You retain all of your ownership rights in your Content. By posting Content, you grant us the right to store and process it solely to provide the Service to you.
          </p>
          <p>
            You may not upload Content that is illegal, infringes on intellectual property rights, or is otherwise harmful or offensive. We reserve the right to remove any Content that violates these terms.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">4. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Memora and its licensors.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">6. Limitation of Liability</h2>
          <p>
            In no event shall Memora, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </div>
      </div>
    </div>
  );
}
