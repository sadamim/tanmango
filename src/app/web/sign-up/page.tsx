import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = { title: "Sign Up | TagMango" };

export default function SignUp() {
  return (
    <AuthLayout step={1}>
      <SignUpForm />
    </AuthLayout>
  );
}
