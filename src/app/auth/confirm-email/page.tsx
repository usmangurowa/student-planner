"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const ConfirmEmailContent = () => {
  const supabase = createClient();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const resendMutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification email sent. Please check your inbox.");
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to send verification email";
      toast.error(message);
    },
  });

  const handleResend = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    resendMutation.mutate(email);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Confirm your email</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            We sent a confirmation link to your email. Click the link to
            continue.
          </p>
        </div>
        {resendMutation.isSuccess ? (
          <div className="bg-card text-card-foreground rounded-lg border p-4">
            <p className="text-sm">A verification link has been sent to</p>
            <p className="mt-1 font-medium">{email}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              Please check your inbox and follow the instructions to confirm
              your email.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={resendMutation.isPending}
            />
            <Button
              className="w-full"
              onClick={handleResend}
              disabled={resendMutation.isPending}
              loading={resendMutation.isPending}
            >
              {resendMutation.isPending
                ? "Sending..."
                : "Resend verification email"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ConfirmEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-6">
          Loading...
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
};

export default ConfirmEmailPage;
