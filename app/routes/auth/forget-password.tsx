import { useNavigate, useSearchParams } from "react-router";
import EmptyMessage from "~/components/ui/empty-message";
import { useAuth } from "~/lib/auth";
import {ResetPasswordForm} from "~/features/auth/components/reset-password-form";
export const ForgetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const {user} = useAuth();

  if (user) {
    return (
        <div className="flex flex-col items-center justify-center">
          <EmptyMessage text="You are already login to this app" title="Unauthorized"/>
          <a href="/career-link/home">Click here</a>
        </div>
    )
  }

  return (
      <div className="flex flex-col gap-4">
        <a className={"text-sm"} href={"/career-link/login"}>Back</a>
        <ForgetPasswordForm
            onSuccess={() => navigate(`login`)}
        />
      </div>

);
};

import {ForgetPasswordForm} from "~/features/auth/components/forget-password-form";
import {Button} from "~/components/ui/button";

export default ForgetPassword;
