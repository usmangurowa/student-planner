"use client";

import { AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AuthErrorContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorType, setErrorType] = useState<string>("unknown");

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      setErrorType(error);
    }
  }, [searchParams]);

  const getErrorContent = () => {
    switch (errorType) {
      case "access_denied":
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          suggestion:
            "Please contact your administrator if you believe this is an error.",
        };
      case "invalid_request":
        return {
          title: "Invalid Request",
          description: "The authentication request was invalid or malformed.",
          suggestion:
            "Please try again or contact support if the problem persists.",
        };
      case "server_error":
        return {
          title: "Server Error",
          description:
            "An internal server error occurred during authentication.",
          suggestion:
            "Please try again in a few moments. If the problem continues, contact support.",
        };
      case "temporarily_unavailable":
        return {
          title: "Service Temporarily Unavailable",
          description: "The authentication service is temporarily unavailable.",
          suggestion:
            "Please try again later. We're working to resolve this issue.",
        };
      case "expired_token":
      case "Token has expired":
        return {
          title: "Link Expired",
          description: "This authentication link has expired.",
          suggestion: "Please request a new authentication link.",
        };
      case "invalid_token":
      case "Invalid token":
        return {
          title: "Invalid Link",
          description:
            "This authentication link is invalid or has already been used.",
          suggestion: "Please request a new authentication link.",
        };
      case "verification_failed":
        return {
          title: "Verification Failed",
          description: "We couldn't verify your authentication token.",
          suggestion: "Please try again or request a new authentication link.",
        };
      case "Email not confirmed":
        return {
          title: "Email Not Confirmed",
          description:
            "Please check your email and click the confirmation link.",
          suggestion:
            "If you didn't receive an email, please request a new confirmation link.",
        };
      case "Invalid login credentials":
        return {
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect.",
          suggestion: "Please check your credentials and try again.",
        };
      case "User not found":
        return {
          title: "Account Not Found",
          description: "No account was found with this email address.",
          suggestion:
            "Please check your email address or create a new account.",
        };
      case "Email rate limit exceeded":
        return {
          title: "Too Many Requests",
          description:
            "You've requested too many emails. Please wait before trying again.",
          suggestion:
            "Please wait a few minutes before requesting another email.",
        };
      default:
        return {
          title: "Authentication Error",
          description: "An error occurred during the authentication process.",
          suggestion:
            "Please try again or contact support if the problem persists.",
        };
    }
  };

  const errorContent = getErrorContent();

  const handleRetry = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRequestNewLink = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {errorContent.title}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {errorContent.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {errorContent.suggestion}
              </p>
            </div>

            <div className="space-y-3">
              {errorType === "expired_token" ||
              errorType === "invalid_token" ||
              errorType === "Token has expired" ||
              errorType === "Invalid token" ||
              errorType === "verification_failed" ||
              errorType === "Email not confirmed" ? (
                <Button
                  onClick={handleRequestNewLink}
                  className="w-full"
                  size="lg"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request New Link
                </Button>
              ) : (
                <Button onClick={handleRetry} className="w-full" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Need help?{" "}
                <Link
                  href="#"
                  className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AuthErrorPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-6">
          Loading...
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
};

export default AuthErrorPage;
