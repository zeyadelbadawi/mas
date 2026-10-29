import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-control border border-line bg-surface px-3.5 text-base text-fg placeholder:text-muted transition-colors duration-150 hover:border-fg/40 focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 aria-invalid:border-danger aria-invalid:ring-danger/30 disabled:opacity-60";

export function Label({ className, ...props }: ComponentProps<"label">) {
  // eslint-disable-next-line jsx-a11y/label-has-associated-control -- htmlFor is passed by Field
  return <label className={cn("text-fg text-sm font-medium", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-12 appearance-none pe-10", className)} {...props} />;
}

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "border-line mt-0.5 size-5 shrink-0 rounded-sm accent-[var(--color-accent)]",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | undefined;
  required?: boolean;
  optionalLabel?: string;
  className?: string;
  children: (a11y: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
    required?: boolean;
  }) => ReactNode;
};

/** Label + control + hint + error, wired with ids so screen readers announce hint and error. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {!required && optionalLabel ? (
          <span className="text-muted ms-1.5 font-normal">({optionalLabel})</span>
        ) : null}
      </Label>
      {children({
        id,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(required ? { required: true } : {}),
      })}
      {hint ? (
        <p id={hintId} className="text-muted text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ChoiceCardProps = Omit<ComponentProps<"input">, "type"> & {
  type?: "radio" | "checkbox";
  title: ReactNode;
  description?: ReactNode;
};

/** A large tappable radio/checkbox card. Keeps the native input for keyboard and screen readers. */
export function ChoiceCard({
  type = "radio",
  title,
  description,
  className,
  id,
  ...props
}: ChoiceCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group rounded-card border-line bg-surface hover:border-fg/50 has-[:checked]:border-accent has-[:checked]:bg-surface-2 has-[:focus-visible]:outline-focus relative flex cursor-pointer flex-col gap-1 border p-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
        className,
      )}
    >
      <input id={id} type={type} className="peer sr-only" {...props} />
      <span className="text-fg font-medium">{title}</span>
      {description ? <span className="text-muted text-sm">{description}</span> : null}
    </label>
  );
}
