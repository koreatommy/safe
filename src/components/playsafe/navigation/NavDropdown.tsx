import Link from "next/link";
import type { NavLinkItem } from "@/data/playsafe/navigation";

type NavDropdownProps = {
  item: NavLinkItem;
  pathname: string;
  onNavigate: () => void;
};

export function NavDropdown({ item, pathname, onNavigate }: NavDropdownProps) {
  const prefix = item.matchPrefix ?? item.href;
  const sectionActive = pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <div className="nav-dropdown">
      <Link
        href={item.href}
        className={sectionActive ? "active" : undefined}
        aria-haspopup="true"
        onClick={onNavigate}
      >
        {item.label}
      </Link>
      <ul className="nav-submenu">
        {item.children?.map((child) => {
          const active = child.href === pathname;
          return (
            <li key={child.href}>
              <Link
                href={child.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                {child.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
