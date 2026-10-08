import React from "react";
import { useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

export function DrillBar() {
  const [location] = useLocation();

  const getBreadcrumbs = () => {
    const parts = location.split("/").filter(Boolean);
    const crumbs = [];

    // Root/Home
    crumbs.push({ label: "Tools & Reports", href: "/", isLast: parts.length === 0 });

    let currentPath = "";
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 1;
      
      // Map path segments to readable labels
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === "sip") label = "SIP";
      if (part === "rap") label = "RAP";
      if (part === "allocation") label = "Allocation";
      if (part === "event-uplift") label = "Event Uplift";
      if (part === "forecast") label = "Forecast";
      if (part === "vendor") label = "Vendor";
      if (part === "grading-size") label = "Grading & Size";
      if (part === "grade-store") label = "Grade Store";
      if (part === "range-style") label = "Range & Style";
      if (part === "facings-presentation") label = "Facings & Presentation";

      crumbs.push({ label, href: currentPath, isLast });
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="px-6 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-semibold text-primary">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={crumb.href} 
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    {index === 0 && <Home size={14} />}
                    <span>{crumb.label}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
