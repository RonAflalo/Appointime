import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  className?: string;
}

export const Checkbox: React.ForwardRefExoticComponent<
  CheckboxProps & React.RefAttributes<HTMLButtonElement>
>; 