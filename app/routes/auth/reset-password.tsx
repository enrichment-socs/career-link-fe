import { useNavigate, useSearchParams } from "react-router";
import EmptyMessage from "~/components/ui/empty-message";
import { useAuth } from "~/lib/auth";
import { ResetPasswordForm } from "~/features/auth/components/reset-password-form";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { user } = useAuth();

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <EmptyMessage text="You are already login to this app" title="Unauthorized" />
        <a href="/career-link/home">Click here</a>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <EmptyMessage text="Invalid or missing reset link. Please request a new one." title="Invalid Link" />
        <a className="text-sm text-blue-600 underline" href="/career-link/forget-password">Request new reset link</a>
      </div>
    );
  }

  return (
    <ResetPasswordForm
      token={token}
      email={email}
      onSuccess={() => navigate("/", { replace: true })}
    />
  );
};

export default ResetPassword;
