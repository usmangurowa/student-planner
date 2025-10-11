import { CheckCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const ConfirmPage = () => {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email and
            click the link to verify your account.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Didn&apos;t receive the email? Check your spam folder or try signing
            up again.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPage;
