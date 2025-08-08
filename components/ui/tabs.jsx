"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = "",
  children,
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : uncontrolled;
  const setValue = (v) => {
    if (onValueChange) onValueChange(v);
    if (controlledValue === undefined) setUncontrolled(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-md border p-1 bg-background",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-foreground/80 hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <div
      role="tabpanel"
      hidden={!active}
      className={cn(!active && "hidden", className)}
    >
      {children}
    </div>
  );
}
