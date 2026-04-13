export const Loader = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex items-center justify-center gap-3 py-10 text-sm text-neutral-500">
    <span className="h-3 w-3 animate-pulse rounded-full bg-neutral-950" />
    <span>{label}</span>
  </div>
);
