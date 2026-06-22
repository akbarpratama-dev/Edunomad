import Link from "next/link";

// Centered card shell for all auth/registration pages (docs/08 Auth Pages:
// "Centered card on light background").
export function AuthCard({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-light px-4 py-10">
      <Link href="/" className="mb-6 text-h2 font-bold text-primary">
        EduNomad
      </Link>
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-lg bg-card p-8 shadow-md`}
      >
        <h1 className="text-h2 font-bold text-neutral-dark">{title}</h1>
        {subtitle && <p className="mt-2 text-body text-neutral-gray">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
