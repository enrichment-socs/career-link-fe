import { zodResolver } from "@hookform/resolvers/zod";
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
import { getErrorMessage } from "~/lib/error";
import { resetPassword, type ResetPasswordInput, resetPasswordInputSchema } from "~/lib/auth";

interface Props {
  token: string;
  email: string;
  onSuccess: () => void;
}

export const ResetPasswordForm = ({ token, email, onSuccess }: Props) => {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: {
      email,
      token,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const toastId = toast.loading("Resetting your password...");
    try {
      const res = await resetPassword({ data });
      toast.success("Password has been reset successfully", { id: toastId });
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <p className="text-xl mb-2 font-bold text-center">Reset Password</p>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="New password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={form.formState.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
          >
            {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
