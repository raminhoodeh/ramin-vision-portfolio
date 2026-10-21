import { lazy, type ComponentType } from 'react';

export function deferredComponent<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  let pending: Promise<{ default: T }> | undefined;
  const preload = () => {
    if (!pending) pending = load().catch((error) => { pending = undefined; throw error; });
    return pending;
  };
  return { Component: lazy(preload), preload };
}
