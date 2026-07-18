import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { BusinessRegistrationWizard } from "../components/BusinessRegistration/BusinessRegistrationWizard";

export default function PartnerRegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-2xl px-4 mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Register Your Business</h1>
          <p className="mt-2 font-body text-muted-foreground">
            Complete the steps below to submit your business for review. You can save your progress and come back
            anytime.
          </p>
        </div>
        <div className="container mx-auto px-4">
          <BusinessRegistrationWizard />
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
