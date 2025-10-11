"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { upsertCurrentUserProfile } from "@/lib/supabase/mutations/profile";
import { cn } from "@/lib/utils";

const baseSchema = z.object({
  first_name: z.string().min(1, "Please enter your first name"),
  last_name: z.string().min(1, "Please enter your last name"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
});

type BaseSchema = z.infer<typeof baseSchema>;

type Step = {
  name: string;
  fields: (keyof BaseSchema)[];
};

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [current, setCurrent] = useState(0);

  const steps: Step[] = useMemo(
    () => [
      { name: "First name", fields: ["first_name"] },
      { name: "Last name", fields: ["last_name"] },
      { name: "Display name", fields: ["display_name"] },
    ],
    []
  );

  const form = useForm<BaseSchema>({
    resolver: zodResolver(baseSchema),
    defaultValues: { first_name: "", last_name: "", display_name: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: BaseSchema) => {
      const { error: upsert_error } = await upsertCurrentUserProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        display_name: values.display_name,
      });
      if (upsert_error) throw new Error(upsert_error);

      const { error: meta_error } = await supabase.auth.updateUser({
        data: { display_name: values.display_name, profile_complete: true },
      });
      if (meta_error) throw meta_error;
    },
    onSuccess: () => {
      toast.success("Welcome! Your profile is ready.");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to complete onboarding";
      toast.error(message);
    },
  });

  const next = async () => {
    const currentFields = steps[current].fields;
    const valid = await form.trigger(
      currentFields as unknown as (keyof BaseSchema)[]
    );
    if (!valid) return;
    const nextIndex = Math.min(current + 1, steps.length - 1);

    if (steps[nextIndex].fields.includes("display_name")) {
      const firstName = (form.getValues("first_name") ?? "").trim();
      const lastName = (form.getValues("last_name") ?? "").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      form.setValue("display_name", fullName);
    }

    setCurrent(nextIndex);
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const onFinish = (values: BaseSchema) => {
    mutation.mutate(values);
  };

  const isLast = current === steps.length - 1;

  return (
    <div className="mx-auto w-full max-w-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFinish)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLast) {
              e.preventDefault();
              void next();
            }
          }}
          className="flex flex-col gap-6"
        >
          <FieldSet>
            <FieldLegend>Let&apos;s set up your profile</FieldLegend>
            <FieldSeparator />
            <FieldGroup>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -24, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  {steps[current].fields.includes("first_name") && (
                    <Field>
                      <FieldLabel>First name</FieldLabel>
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  )}

                  {steps[current].fields.includes("last_name") && (
                    <Field>
                      <FieldLabel>Last name</FieldLabel>
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  )}

                  {steps[current].fields.includes("display_name") && (
                    <Field>
                      <FieldLabel>Display name</FieldLabel>
                      <FormField
                        control={form.control}
                        name="display_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="John D." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  )}
                </motion.div>
              </AnimatePresence>

              <Field orientation="horizontal">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prev}
                  disabled={current === 0 || mutation.isPending}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={next}
                  className={cn(isLast && "hidden")}
                  disabled={mutation.isPending}
                >
                  Next
                </Button>
                <Button
                  type="submit"
                  className={cn(!isLast && "hidden")}
                  loading={mutation.isPending}
                >
                  {mutation.isPending ? "Saving..." : "Finish"}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </Form>
    </div>
  );
}
