"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "time";
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({
    className,
    type = "text",
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    variant = "default",
    size = "md",
    fullWidth = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      
      if (type === "number") {
        // Allow empty string, numbers, and decimal point
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          if (props.onChange) {
            props.onChange(e);
          }
        } else {
          e.preventDefault();
        }
      } else if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
          return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
        }
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    const baseClasses = cn(
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-primary/20",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "placeholder:text-muted-foreground",
      fullWidth && "w-full"
    );

    const variantClasses = {
      default: cn(
        "border border-input bg-background",
        "hover:border-primary/50",
        isFocused && "border-primary ring-2 ring-primary/20",
        error && "border-destructive ring-2 ring-destructive/20"
      ),
      filled: cn(
        "border-0 bg-muted",
        "hover:bg-muted/80",
        isFocused && "bg-background ring-2 ring-primary/20",
        error && "bg-destructive/10 ring-2 ring-destructive/20"
      ),
      outlined: cn(
        "border-2 border-input bg-transparent",
        "hover:border-primary/50",
        isFocused && "border-primary ring-2 ring-primary/20",
        error && "border-destructive ring-2 ring-destructive/20"
      ),
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-4 text-lg",
    };

    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      startIcon && "pl-10",
      endIcon && "pr-10",
      className
    );

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2",
              error && "text-destructive",
              isFocused && "text-primary"
            )}
            animate={{
              color: error ? "#ef4444" : isFocused ? "hsl(var(--primary))" : "hsl(var(--foreground))",
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1"
          >
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";

export { MobileInput };
