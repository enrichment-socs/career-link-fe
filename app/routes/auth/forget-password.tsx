import { useNavigate } from "react-router";
import EmptyMessage from "~/components/ui/empty-message";
import { useAuth } from "~/lib/auth";
import { ForgetPasswordForm } from "~/features/auth/components/forget-password-form";

export const ForgetPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are already login to this app" title="Unauthorized" />
        <a href="/career-link/home">Click here</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <a className="text-sm" href="/career-link/">Back</a>
      <ForgetPasswordForm
        onSuccess={() => navigate("/")}
      />
    </div>
  );
};

export default ForgetPassword;
