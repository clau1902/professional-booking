import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Privacy Policy — Handpicked" };

export default function PrivacyPage() {
  return (
    <StaticPage
      label="Legal"
      title="Privacy Policy"
      subtitle="We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights."
      lastUpdated="January 1, 2025"
      sections={[
        {
          heading: "What data we collect",
          body: "We collect information you provide when creating an account (name, email, phone number), booking services (address, notes), and payment details processed via Stripe. We also collect usage data such as pages visited and search queries.",
        },
        {
          heading: "How we use your data",
          body: "We use your data to operate the platform, process bookings and payments, send booking confirmations and reminders, improve our services, and comply with legal obligations. We do not sell your personal data to third parties.",
        },
        {
          heading: "Cookies",
          body: "We use essential cookies to keep you signed in and remember your preferences. We use analytics cookies (with your consent) to understand how people use the platform and improve it.",
        },
        {
          heading: "Data sharing",
          body: "Your name and contact details are shared with the professional you book so they can fulfill your appointment. Payment data is handled entirely by Stripe and never stored on our servers.",
        },
        {
          heading: "Data retention",
          body: "We retain your account data for as long as your account is active. Booking records are kept for 7 years for legal and tax purposes. You can request deletion of your personal data at any time.",
        },
        {
          heading: "Your rights",
          body: "You have the right to access, correct, or delete your personal data at any time. You can also object to processing or request a copy of your data in a portable format. To exercise these rights, contact privacy@handpicked.com.",
        },
        {
          heading: "Contact",
          body: "If you have any questions about this policy, contact our Data Protection Officer at privacy@handpicked.com.",
        },
      ]}
    />
  );
}
