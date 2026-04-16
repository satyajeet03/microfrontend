import { Link, useLocation } from 'react-router-dom';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}

type SidebarItem = {
  id: string;
  label: string;
  path: string;
};

type SidebarProps = {
  title: string;
  homePath?: string;
  items: SidebarItem[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
};

export function Sidebar({
  title,
  homePath = '/',
  items,
  className,
  itemClassName,
  activeItemClassName,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={className}>
      <h2>{title}</h2>
      <Link
        to={homePath}
        className={
          location.pathname === homePath
            ? `${itemClassName ?? ''} ${activeItemClassName ?? ''}`.trim()
            : itemClassName
        }
      >
        Home
      </Link>
      {items.map((item) => {
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`);
        const classes = isActive
          ? `${itemClassName ?? ''} ${activeItemClassName ?? ''}`.trim()
          : itemClassName;
        return (
          <Link key={item.id} to={item.path} className={classes}>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
