import { useEffect, useRef, useState } from "react";
import { releasedTabs } from "../features/releaseTabs";

const sections = [
  { label: "Overview", items: [
    { id: "general", label: "Dashboard", icon: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" },
    { id: "customers", label: "Customers", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
    { id: "map", label: "Customer map", icon: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0" },
  ] },
  { label: "Sales & insights", items: [
    { id: "monthObroty", label: "Monthly revenue", icon: "M3 3v18h18 M7 15v-4 M12 15V7 M17 15V5" },
    { id: "dayObroty", label: "Daily revenue", icon: "M3 17l6-6 4 4 8-10 M15 5h6v6" },
    { id: "groupObroty", label: "Revenue by category", icon: "M12 3v9h9 M21 16a9 9 0 1 1-13-13" },
    { id: "spadki", label: "Revenue decline", icon: "M3 7l6 6 4-4 8 10 M15 19h6v-6" },
    { id: "zwroty", label: "Returns", icon: "M9 4L4 9l5 5 M4 9h10a6 6 0 0 1 0 12" },
    { id: "ksoplat", label: "Payments", icon: "M3 5h18v14H3z M3 10h18 M7 15h3" },
    { id: "ustalenia", label: "Sales targets", icon: "M21 12a9 9 0 1 1-9-9 M17 12a5 5 0 1 1-5-5 M12 12l9-9 M16 3h5v5" },
    { id: "umowy", label: "Contracts", admin: true, icon: "M14 2H6v20h12V6z M14 2v5h5 M9 12h6 M9 16h6" },
  ] },
  { label: "Workspace", items: [
    { id: "tasks", label: "My tasks", icon: "M9 5H4v16h16V5h-5 M9 3h6v4H9z M8 14l3 3 5-6" },
    { id: "adminTasks", label: "Team tasks", admin: true, icon: "M3 5h18 M3 12h18 M3 19h18 M7 3v4 M17 10v4 M10 17v4" },
    { id: "adminLogs", label: "Activity log", admin: true, icon: "M3 12h4l3-8 4 16 3-8h4" },
  ] },
] as const;

export type NavigationTab = typeof sections[number]["items"][number]["id"];
export const navigationLabel = (tab: NavigationTab) => sections.flatMap(section => [...section.items]).find(item => item.id === tab)?.label ?? "Dashboard";

function Icon({ path }: { path: string }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>;
}

interface Props {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  mobile: boolean;
  hidden: boolean;
  onClose: () => void;
  user: string | null;
  admin: boolean;
  impersonated: boolean;
  onSwitchUser: () => void;
  onExitPreview: () => void;
  onLogout: () => void;
}

export function SideNavigation(props: Props) {
  const [query, setQuery] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!props.mobile || props.hidden) return;
    previousFocus.current = document.activeElement as HTMLElement;
    closeButton.current?.focus();
    return () => previousFocus.current?.focus();
  }, [props.mobile, props.hidden]);
  const filteredSections = sections.map(section => ({ ...section, items: section.items.filter(item => releasedTabs.includes(item.id) && (!('admin' in item) || props.admin) && item.label.toLowerCase().includes(query.trim().toLowerCase())) })).filter(section => section.items.length);
  const initials = (props.user || "Guest").split(/\s+/).slice(0, 2).map(part => part[0]).join("");

  return <aside
    ref={sidebar}
    id="workspace-navigation"
    className={`workspace-navigation ${props.hidden ? "navigation-hidden" : ""} ${props.mobile ? "navigation-mobile" : ""}`}
    aria-label="Workspace navigation"
    aria-hidden={props.hidden}
    inert={props.hidden}
    role={props.mobile ? "dialog" : undefined}
    aria-modal={props.mobile && !props.hidden ? true : undefined}
    onKeyDown={event => {
      if (!props.mobile || props.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); props.onClose(); }
      if (event.key === "Tab") {
        const controls = sidebar.current?.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}
  >
    <div className="navigation-brand">
      <button className="navigation-home" onClick={() => props.onNavigate("general")} aria-label="PartsFlow dashboard">
        <span className="navigation-monogram">p<span>•</span></span>
        <span><strong>partsflow<span className="navigation-crm">CRM</span></strong><small>Your sales workspace</small></span>
      </button>
      {props.mobile && <button ref={closeButton} className="navigation-icon-button" aria-label="Close navigation" onClick={props.onClose}><Icon path="M6 6l12 12 M18 6L6 18" /></button>}
    </div>

    <div className="navigation-search">
      <Icon path="M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0 M15 15l6 6" />
      <input type="search" aria-label="Find a section" placeholder="Find a section…" value={query} onChange={event => setQuery(event.target.value)} />
    </div>

    <nav className="navigation-sections" aria-label="Main navigation">
      {filteredSections.map(section => <section className="navigation-group" key={section.label} aria-label={section.label}>
        <h2>{section.label}</h2>
        {section.items.map(item => <button key={item.id} className={`navigation-item ${props.activeTab === item.id ? "is-current" : ""}`} aria-current={props.activeTab === item.id ? "page" : undefined} onClick={() => { props.onNavigate(item.id); setQuery(""); }}>
          <Icon path={item.icon} /><span>{item.label}</span>{props.activeTab === item.id && <span className="navigation-current-dot" aria-hidden="true" />}
        </button>)}
      </section>)}
      {!filteredSections.length && <p className="navigation-empty">No sections found.<button onClick={() => setQuery("")}>Clear search</button></p>}
    </nav>

    <footer className="navigation-footer">
      {props.admin && !props.impersonated && <button className="navigation-switch" onClick={props.onSwitchUser}><Icon path="M16 3l4 4-4 4 M20 7H4 M8 21l-4-4 4-4 M4 17h16" /><span>Switch account</span></button>}
      {props.impersonated && <button className="navigation-switch" onClick={props.onExitPreview}><Icon path="M9 5l-7 7 7 7 M2 12h18" /><span>Exit employee preview</span></button>}
      <div className="navigation-profile"><span className="navigation-avatar" aria-hidden="true">{initials}</span><div><strong title={props.user || "Guest"}>{props.user || "Guest"}</strong><small>{props.impersonated ? "Employee preview" : props.admin ? "Administrator" : "Sales representative"}</small></div><button className="navigation-icon-button navigation-signout" onClick={props.onLogout} aria-label="Sign out" title="Sign out"><Icon path="M9 3H4v18h5 M10 12h11 M17 8l4 4-4 4" /></button></div>
    </footer>
  </aside>;
}
