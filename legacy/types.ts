import type { ReactNode } from "react";

export type DynamicPageProps<P = Record<string, string>> = {
  params: Promise<P>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type DynamicLayoutProps = { children: ReactNode };