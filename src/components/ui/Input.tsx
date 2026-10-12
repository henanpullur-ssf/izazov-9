import React, {
  forwardRef,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none transition duration-150 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[var(--border-strong)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, helperText, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none transition duration-150 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[var(--border-strong)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      error,
      helperText,
      id,
      children,
      options,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-xl border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition duration-150 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[var(--border-strong)]"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[var(--surface)] text-[var(--foreground)]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
