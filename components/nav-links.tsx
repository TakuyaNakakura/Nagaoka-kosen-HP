"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
  className?: string;
  pill?: boolean;
};

export function NavLinks({ items, className = "", pill = false }: Props) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" &&
            item.href !== "/admin" &&
            item.href !== "/member" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "is-active" : ""}
            data-pill={pill ? "true" : "false"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
