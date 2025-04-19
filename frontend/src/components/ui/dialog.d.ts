import * as React from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps>;
export const DialogContent: React.FC<DialogContentProps>;
export const DialogHeader: React.FC<DialogHeaderProps>;
export const DialogTitle: React.FC<DialogTitleProps>;
export const DialogDescription: React.FC<DialogDescriptionProps>;
export const DialogFooter: React.FC<DialogFooterProps>; 