'use client';

import type { ComponentProps } from 'react';

interface ConfirmFormProps extends Omit<ComponentProps<'form'>, 'action' | 'onSubmit'> {
  action: (form: FormData) => void | Promise<void>;
  /** Question shown before a destructive action; the form only submits on OK. */
  confirm: string;
}

export function ConfirmForm({ action, confirm, children, ...props }: ConfirmFormProps) {
  return (
    <form
      {...props}
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
