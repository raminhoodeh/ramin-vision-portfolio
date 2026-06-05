export function WorkflowDiagram({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step} className="rounded-[1.1rem] bg-white/35 p-3">
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            {String(index + 1).padStart(2, '0')}
          </p>
          <p className="mt-2 text-sm font-medium leading-5 text-text-primary">{step}</p>
        </li>
      ))}
    </ol>
  );
}
