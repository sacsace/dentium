import { Button } from "@/components/ui/Button";
import {
  AuthShell,
  AuthFooterLink,
  AuthLink,
  authInputClass,
  authButtonClass,
} from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot Password" subtitle="Enter your email to receive reset instructions">
      <p className="text-brand-silver text-sm mb-5 leading-relaxed">
        Enter your email ID and we will send reset instructions.
      </p>
      <form className="space-y-5">
        <input type="email" placeholder="Email ID" className={authInputClass} />
        <Button type="submit" className={authButtonClass}>
          Submit
        </Button>
      </form>
      <AuthFooterLink>
        Don&apos;t have an account? <AuthLink href="/auth/register">Create Account</AuthLink>
      </AuthFooterLink>
    </AuthShell>
  );
}
