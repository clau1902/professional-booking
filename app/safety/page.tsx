import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Safety — Handpicked" };

export default function SafetyPage() {
  return (
    <StaticPage
      label="Trust & Safety"
      title="Your safety is our priority"
      subtitle="We take extensive measures to ensure every interaction on Handpicked is safe, secure, and trustworthy."
      sections={[
        {
          heading: "Background checks",
          body: "All verified professionals on Handpicked undergo a comprehensive background check before receiving their Verified badge. This includes identity verification, criminal record screening, and reference checks.",
        },
        {
          heading: "Identity verification",
          body: "Every professional must provide a government-issued ID and proof of relevant qualifications or licences before listing their services.",
        },
        {
          heading: "Secure payments",
          body: "All payments are processed through Stripe, a PCI-DSS Level 1 certified payment processor. Your card details are never stored on our servers.",
        },
        {
          heading: "Reviews & ratings",
          body: "Only customers who have completed a booking can leave a review. This ensures all ratings are genuine and verified.",
        },
        {
          heading: "Reporting a concern",
          body: "If you ever feel unsafe or have a concern about a professional or customer, please contact us immediately at safety@handpicked.com. We investigate all reports within 24 hours.",
        },
        {
          heading: "Insurance",
          body: "We strongly encourage all professionals to maintain their own public liability insurance. Details of a professional's insurance status are visible on their profile.",
        },
      ]}
    />
  );
}
