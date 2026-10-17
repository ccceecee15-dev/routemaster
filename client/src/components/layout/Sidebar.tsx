import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronDown, Layers, Target, Database, Ruler } from "lucide-react";
import { useState } from "react";

interface NavItem {
  icon: any;
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Master Data",
    items: [
      {
        icon: Database,
        label: "Master Data",
        subItems: [
          { label: "Route Master", href: "/master/route-master" },
          { label: "Route Master V2", href: "/route-master-v2" },
        ],
      },
    ],
  },
  {
    title: "Tools & Reports",
    items: [
      { 
        icon: Layers, 
        label: "SIP",
        subItems: [
          { label: "Manage Event Uplift", href: "/sip/event-uplift" },
          { label: "Generate Forecast", href: "/sip/forecast" },
          { label: "Allocation View", href: "/sip/allocation" },
          { label: "Vendor View", href: "/sip/vendor" },
          { label: "SIP Rules", href: "/sip/rules" }
        ]
      },
      { 
        icon: Target, 
        label: "RAP",
        subItems: [
          { label: "Determine Grading Size", href: "/rap/grading-size" },
          { label: "Grade Store", href: "/rap/grade-store" },
          { label: "Range Style", href: "/rap/range-style" },
          { label: "Determine Facings & Presentation", href: "/rap/facings-presentation" },
          { label: "RAP Rules", href: "/rap/rules" }
        ]
      },
      {
        icon: Ruler,
        label: "Space Planning",
        subItems: [
          { label: "Merchandising Blocks", href: "/space-planning/blocks" },
          { label: "Fixture Master", href: "/space-planning/fixtures" },
          { label: "Block Compatibility & Capacity", href: "/space-planning/compatibility" },
          { label: "Store Grading", href: "/space-planning/grading" },
          { label: "Space Revision", href: "/space-planning/revision" },
          { label: "Facings & Presentations", href: "/space-planning/facings" },
        ],
      }
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["SIP", "RAP", "Space Planning"]));

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const isSubItemActive = (item: NavItem) => {
    return item.subItems?.some(sub => location === sub.href || location.startsWith(sub.href + "/"));
  };

  return (
    <aside 
      className={cn(
        "h-screen sidebar-dark transition-all duration-300 flex flex-col sticky top-0 flex-shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-full.png" alt="MerchX Logo" className="h-6 w-auto" />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="flex items-center justify-center w-full hover:opacity-80 transition-opacity">
            <img src="/logo-icon.png" alt="MerchX" className="h-6 w-auto" />
          </Link>
        )}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-sidebar-muted hover:text-white hover:bg-sidebar-accent transition-all duration-200"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        {collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-5 bg-sidebar-bg border border-sidebar-border shadow-lg p-2 rounded-lg text-sidebar-muted hover:text-white hover:bg-sidebar-accent transition-all duration-200"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6">
            {!collapsed && (
              <h3 className="px-3 mb-3 text-[10px] font-bold text-sidebar-muted uppercase tracking-[0.15em]">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href ? location === item.href : isSubItemActive(item);
                const isExpanded = expandedItems.has(item.label);

                if (item.subItems) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                          isActive 
                            ? "nav-item-active text-white" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                        )}
                      >
                        <item.icon size={20} className={cn(
                          "transition-all duration-200 flex-shrink-0",
                          isActive ? "text-white" : "text-sidebar-muted group-hover:text-white"
                        )} />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{item.label}</span>
                            <ChevronDown size={14} className={cn(
                              "transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )} />
                          </>
                        )}
                      </button>
                      {!collapsed && isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((sub) => {
                            const subActive = location === sub.href || location.startsWith(sub.href + "/");
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                                  subActive
                                    ? "bg-sidebar-accent text-white"
                                    : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-white"
                                )}
                              >
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  subActive ? "bg-white" : "bg-sidebar-muted"
                                )} />
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link 
                    key={item.href} 
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive 
                        ? "nav-item-active text-white" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                    )}
                  >
                    <item.icon size={20} className={cn(
                      "transition-all duration-200 flex-shrink-0",
                      isActive ? "text-white" : "text-sidebar-muted group-hover:text-white"
                    )} />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        {!collapsed ? (
          <div className="rounded-xl p-4 bg-sidebar-accent/50 border border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">System Status</p>
                <p className="text-[10px] text-sidebar-muted">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-sidebar-muted">
              <span>Last sync</span>
              <span className="text-sidebar-foreground">10:42 AM</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" title="Online" />
          </div>
        )}
      </div>
    </aside>
  );
}
