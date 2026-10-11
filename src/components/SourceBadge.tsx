interface SourceBadgeProps {
  source: "live" | "recorded";
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 pill border border-signal text-signal text-xs font-body-medium">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal" />
        </span>
        Live agent
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 pill border border-line text-muted text-xs font-body-medium">
      Recorded response
    </span>
  );
}