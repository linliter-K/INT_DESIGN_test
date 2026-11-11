import LoginForm from "./LoginForm";

export const metadata = {
  title: "登入 | AMB",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline gap-2 mb-10 justify-center">
          <span className="font-serif text-2xl tracking-[0.3em]">AMB</span>
          <span className="text-[10px] tracking-[0.4em] text-muted">艾柏設計</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
