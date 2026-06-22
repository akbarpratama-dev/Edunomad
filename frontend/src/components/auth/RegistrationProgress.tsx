// Step indicator for the 5-step registration wizard (docs/08 "Progress
// indicator at top (Step X of N)").
const STEPS = ["Akun", "Peran", "Tentang", "Portofolio", "Keahlian"];

export function RegistrationProgress({ current }: { current: number }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-body-sm text-neutral-gray">
        Langkah {current} dari {STEPS.length}
      </p>
      <div className="flex gap-1.5">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step <= current;
          return (
            <div key={label} className="flex flex-1 flex-col gap-1">
              <div
                className={`h-1.5 rounded-full ${done ? "bg-primary" : "bg-neutral-gray-light"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
