import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Settings, HelpCircle, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocation } from "wouter";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const getTitleFromRoute = (path: string) => {
    if (path === "/") return "Dashboard";
    if (path === "/otb") return "OTB Planning";
    if (path === "/commercial-planning") return "Commercial Planning";
    if (path.startsWith("/closing-stock")) return "Closing Stock";
    if (path === "/availability") return "Availability";
    if (path === "/products") return "Products";
    if (path === "/stores") return "Stores";
    return "Dashboard";
  };

  const pageTitle = getTitleFromRoute(location);

  return (
    <header className="h-16 glass-header px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-foreground">
          {pageTitle}
        </h1>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-muted-foreground text-sm">
          <Search size={16} />
          <span>Search...</span>
          <kbd className="ml-8 px-2 py-0.5 rounded bg-background/80 text-[10px] font-mono">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
        >
          <HelpCircle size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl relative transition-all duration-200"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <div className="w-px h-8 bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-3 px-2 rounded-xl hover:bg-primary/10 transition-all duration-200">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold">JD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">John Doe</p>
                <p className="text-[10px] text-muted-foreground">Admin</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john.doe@whsmith.co.uk
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem className="hover:bg-primary/10 rounded-lg cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary/10 rounded-lg cursor-pointer text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
