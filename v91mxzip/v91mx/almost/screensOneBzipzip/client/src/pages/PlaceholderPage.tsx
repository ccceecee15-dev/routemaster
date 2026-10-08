import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
            <p className="text-sm text-slate-500">This screen will be available in a later phase.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
