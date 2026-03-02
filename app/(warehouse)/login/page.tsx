"use client";

import LoginForm from "@/components/layout/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    //   <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <LoginForm
          isOpen={true}
          onClose={() => router.push("/")}
          authMode="signin"
          onAuthModeChange={() => {}}
          onGoogleSignIn={() => {}}
          onMicrosoftSignIn={() => {}}
          onEmailSignIn={async() => {}}
          onEmailSignUp={async() => {}}
        />
    //   </div>
    // </div>
  );
}