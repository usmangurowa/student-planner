"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  type,
  ...props
}: React.ComponentProps<"div"> & { type: "login" | "register" }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      let result;

      if (type === "login") {
        result = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
      } else {
        result = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
          },
        });
      }

      if (result.error) {
        if (
          type === "login" &&
          (result.error.message === "Email not confirmed" ||
            result.error.message?.toLowerCase().includes("confirm"))
        ) {
          toast.message("Please confirm your email to continue.");
          const confirmUrl = `/auth/confirm-email?email=${encodeURIComponent(
            data.email
          )}` as `/auth/confirm-email?email=${string}`;
          router.push(confirmUrl as Route);
          return;
        }
        toast.error(result.error.message);
      } else {
        toast.success(
          type === "login"
            ? "Successfully logged in!"
            : "Account created successfully!"
        );

        if (type === "login") {
          // We will rely on middleware to route to onboarding if needed
          router.push("/dashboard");
        } else {
          const confirmUrl = `/auth/confirm-email?email=${encodeURIComponent(
            data.email
          )}` as `/auth/confirm-email?email=${string}`;
          router.push(confirmUrl as Route);
        }
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error("Failed to login with GitHub");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {type === "login" ? "Login to your account" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {type === "login"
            ? "Enter your email below to login to your account"
            : "Enter your email below to create your account"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel>Password</FieldLabel>
              {type === "login" && (
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              )}
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? type === "login"
                ? "Logging in..."
                : "Creating account..."
              : type === "login"
                ? "Login"
                : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGithubLogin}
        disabled={isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="mr-2 h-4 w-4"
        >
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            fill="currentColor"
          />
        </svg>
        {type === "login" ? "Login with GitHub" : "Sign up with GitHub"}
      </Button>

      <div className="text-center text-sm">
        {type === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
