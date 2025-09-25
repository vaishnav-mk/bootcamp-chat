interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      data-testid="loading-spinner"
      className={`animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500 ${sizeClasses[size]} ${className}`}
    />
  );
}
