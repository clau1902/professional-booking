import { StaticPage } from "@/components/StaticPage";

export const metadata = { title: "Help Center — Handpicked" };

export default function HelpPage() {
  return (
    <StaticPage
      label="Support"
      title="Help Center"
      subtitle="Find answers to the most common questions about booking, payments, and managing your account."
      sections={[
        {
          heading: "Getting started",
          body: "Creating an account is free and takes less than a minute. Browse professionals by category or location, view their profiles and reviews, and book directly through the platform.",
        },
        {
          heading: "Making a booking",
          body: "Select a professional, choose a service, pick a date and time, and confirm your booking. You'll receive an email confirmation once the professional accepts.\n\nBookings are typically confirmed within 2 hours.",
        },
        {
          heading: "Payments",
          body: "Payment is processed securely through Stripe. You are not charged until the professional confirms your booking. We accept all major credit and debit cards.",
        },
        {
          heading: "Cancellations & refunds",
          body: "You may cancel a booking free of charge up to 24 hours before the scheduled time. Cancellations made less than 24 hours in advance may incur a cancellation fee of up to 50% of the service cost.",
        },
        {
          heading: "Leaving a review",
          body: "After a completed booking you will be prompted to leave a rating and review. Reviews help other customers make informed decisions and help professionals grow their business.",
        },
        {
          heading: "Contact support",
          body: "If you can't find the answer here, visit our Contact Us page or email support@handpicked.com. Our team is available Monday–Friday, 9 am–6 pm.",
        },
      ]}
    />
  );
}
