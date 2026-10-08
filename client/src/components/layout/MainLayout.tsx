import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DrillBar } from "../planning/DrillBar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <DrillBar />
        <ScrollArea className="flex-1">
          <main className="p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
