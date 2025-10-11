import { OnboardingWizard } from "@/components/onboarding-wizard";

const OnboardingPage = () => {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold">Onboarding</h1>
        <OnboardingWizard />
      </div>
    </div>
  );
};

export default OnboardingPage;
