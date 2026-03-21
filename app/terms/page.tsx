import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Terms of Service — Handpicked" };

export default function TermsPage() {
  return (
    <StaticPage
      label="Legal"
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Handpicked. By creating an account you agree to be bound by them."
      lastUpdated="January 1, 2025"
      sections={[
        {
          heading: "1. Acceptance of terms",
          body: "By accessing or using the Handpicked platform you agree to these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform.",
        },
        {
          heading: "2. Use of the platform",
          body: "Handpicked is a marketplace that connects customers with independent service professionals. We are not a party to the service agreement between customers and professionals and are not responsible for the quality, safety, or legality of services provided.",
        },
        {
          heading: "3. Account responsibilities",
          body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at least 18 years old to use Handpicked.",
        },
        {
          heading: "4. Payments & fees",
          body: "Payments are processed securely through Stripe. Handpicked charges a platform service fee on each completed booking. Professionals receive payouts according to the payout schedule set out in the Professional Agreement.",
        },
        {
          heading: "5. Cancellations",
          body: "Cancellation policies are set at the platform level. Customers may cancel free of charge up to 24 hours before a booking. Late cancellations may incur a fee.",
        },
        {
          heading: "6. Prohibited conduct",
          body: "You may not use the platform to engage in fraud, harassment, or any unlawful activity. Professionals may not solicit customers to pay outside the platform.",
        },
        {
          heading: "7. Limitation of liability",
          body: "To the fullest extent permitted by law, Handpicked is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
        },
        {
          heading: "8. Changes to these terms",
          body: "We may update these terms from time to time. We will notify you of material changes by email. Continued use of the platform after changes constitutes acceptance of the updated terms.",
        },
      ]}
    />
  );
}
