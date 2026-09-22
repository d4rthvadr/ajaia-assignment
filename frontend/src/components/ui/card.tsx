import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-md border border-[#dadce0] bg-white", className)}
      {...props}
    />
  );
}
import React from "react";

export const card: React.FC = () => {
  return null;
};

card.displayName = "card";
