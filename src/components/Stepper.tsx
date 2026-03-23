interface StepperProps {
  step: number;
  total?: number;
}

export default function Stepper({ step, total = 3 }: StepperProps) {
  return (
    <div className="flex gap-1.5 mt-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i + 1 <= step ? "bg-app-primary" : "bg-slate-200 dark:bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
}
