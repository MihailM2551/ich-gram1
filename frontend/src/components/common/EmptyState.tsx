import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white/70 p-10 text-center shadow-sm">
    <h3 className="text-xl font-semibold text-neutral-950">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-neutral-500">{description}</p>
    {actionLabel && onAction ? (
      <Button onClick={onAction} className="mt-6">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
