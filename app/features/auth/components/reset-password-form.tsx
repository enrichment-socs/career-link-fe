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
import {resetPassword, type ResetPasswordInput, resetPasswordInputSchema} from "~/lib/auth";

interface Props {
  onSuccess: () => void;
}

export const ResetPasswordForm = ({ onSuccess }: Props) => {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: {
      password: ""
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const toastId = toast.loading("Reset your password...");
    try {
      const res = await resetPassword({ data });

      toast.success(res.message, { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error), {
        id: toastId,
      });
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
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
            {form.formState.isSubmitting ? "Resetting your password..." : "Reset Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
