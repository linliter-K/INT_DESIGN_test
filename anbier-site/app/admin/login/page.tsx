import LoginForm from "./LoginForm";

export const metadata = {
  title: "登入 | TDZ",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline gap-2 mb-10 justify-center">
          <span className="font-serif text-2xl tracking-[0.3em]">TDZ</span>
          <span className="text-[10px] tracking-[0.4em] text-muted">桑德斯設計</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
