import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { forgetPassword, type ForgetPasswordInput, forgetPasswordInputSchema } from "~/lib/auth";
import { getErrorMessage } from "~/lib/error";

interface Props {
  onSuccess: () => void;
}

export const ForgetPasswordForm = ({ onSuccess }: Props) => {
  const [sent, setSent] = useState(false);

  const form = useForm<ForgetPasswordInput>({
    resolver: zodResolver(forgetPasswordInputSchema),
    defaultValues: {
      nim: "",
    },
  });

  const onSubmit = async (data: ForgetPasswordInput) => {
    const toastId = toast.loading("Sending link to your email...");
    try {
      const res = await forgetPassword({ data });
      toast.success(res.message, { id: toastId });
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error), {
        id: toastId,
      });
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4 items-center text-center">
        <p className="text-xl font-bold">Check Your Email</p>
        <p className="text-sm text-muted-foreground">
          We've sent a password reset link to your email. Please check your inbox and click the link to reset your password.
        </p>
        <a className="text-sm text-blue-600 underline" href="/career-link/">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <p className="text-xl mb-2 font-bold text-center">Forget Password</p>
          <FormField
            control={form.control}
            name="nim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIM</FormLabel>
                <FormControl>
                  <Input placeholder="NIM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={
              form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }
          >
            {form.formState.isSubmitting ? "Sending email..." : "Send to Email"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
