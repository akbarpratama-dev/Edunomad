// Centered card shell for all auth/registration pages. Matches Figma node
// 11-3463/11-3478: warm page bg, white card with a warm hairline border, soft
// layered shadow, 20px radius, and a large 32px heading.
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-[20px] border border-[#e7e3d8] bg-card p-8 shadow-[0_4px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.08)]`}
      >
        <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
