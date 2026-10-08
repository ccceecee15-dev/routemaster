import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";

const CATEGORIES = ["Books", "Stationery", "Gifts", "Media"];
const SUB_CATEGORIES = ["Fiction", "Non-Fiction", "Writing", "Office"];
const MERCH_AREAS = ["Main Floor", "Section A", "Section B", "Display"];
const PLANNING_GROUPS = ["Group A", "Group B", "Group C"];
const SUB_PLANNING_GROUPS = ["Sub Group 1", "Sub Group 2", "Sub Group 3"];

export default function StyleMappingOld() {
  const [data, setData] = useState<any[]>([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleApplyFilters = () => {
    if (selectedPlanningGroup !== "all") {
      const largeMockData = Array.from({ length: 45 }, (_, i) => ({
        id: i + 1,
        styleCode: `S${1000 + i}`,
        styleName: `Style Name ${i + 1}`,
        ytdSales: Math.floor(Math.random() * 50000) + 10000,
        closingStock: Math.floor(Math.random() * 5000) + 500,
        changeRequired: i % 3 === 0 ? "Y" : "N",
        currentMapping: {
          category: "Books",
          subCategory: "Fiction",
          merchArea: "Main Floor",
          planningGroup: "Group A",
          subPlanningGroup: "Sub Group 1"
        }
      }));
      setData(largeMockData);
      setHasAppliedFilters(true);
      setCurrentPage(1);
    }
  };

  const filteredData = showChangesOnly ? data.filter(row => row.changeRequired === "Y") : data;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedMerchArea("all");
    setSelectedPlanningGroup("all");
    setSelectedSubPlanningGroup("all");
    setData([]);
    setHasAppliedFilters(false);
  };

  const TableHeader = ({ children, colSpan = 1, className = "" }: { children: React.ReactNode, colSpan?: number, className?: string }) => (
    <th colSpan={colSpan} className={cn("px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-center", className)}>
      <div className="flex items-center justify-center gap-1">{children}</div>
    </th>
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <CompactFilterBar
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          fields={[
            { id: "category", label: "Category", value: selectedCategory, onChange: setSelectedCategory, options: [{ value: "all", label: "All" }, ...CATEGORIES.map(c => ({ value: c.toLowerCase(), label: c }))] },
            { id: "subcategory", label: "Subcat", value: selectedSubcategory, onChange: setSelectedSubcategory, options: [{ value: "all", label: "All" }, ...SUB_CATEGORIES.map(c => ({ value: c.toLowerCase(), label: c }))] },
            { id: "merch-area", label: "Merch Area", value: selectedMerchArea, onChange: setSelectedMerchArea, options: [{ value: "all", label: "All" }, ...MERCH_AREAS.map(c => ({ value: c.toLowerCase(), label: c }))] },
            { id: "planning-group", label: "Group", value: selectedPlanningGroup, onChange: setSelectedPlanningGroup, options: [{ value: "all", label: "All" }, ...PLANNING_GROUPS.map(c => ({ value: c.toLowerCase(), label: c }))] },
            { id: "sub-planning-group", label: "Sub Group", value: selectedSubPlanningGroup, onChange: setSelectedSubPlanningGroup, options: [{ value: "all", label: "All" }, ...SUB_PLANNING_GROUPS.map(c => ({ value: c.toLowerCase(), label: c }))] },
          ]}
        />

        <Card className="relative overflow-hidden rounded-xl glass-card border shadow-lg">
          <CardHeader className="py-3 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Style Mapping (Old)</CardTitle>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Legacy Inline Maintenance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasAppliedFilters && (
                  <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Show only those requiring change</span>
                      <button onClick={() => setShowChangesOnly(!showChangesOnly)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500", showChangesOnly ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600")}>
                        <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200", showChangesOnly ? "translate-x-5" : "translate-x-1")} />
                      </button>
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-2 border-slate-200 dark:border-slate-800">Extract Data</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4 text-slate-500" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!hasAppliedFilters ? (
              <div className="h-[450px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4"><Filter className="h-8 w-8 text-slate-400" /></div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Styles Displayed</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Please apply filters down to the <strong>Planning Group</strong> level to view styles.</p>
                <div className="mt-6 flex items-center gap-3">
                  <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-wider", selectedPlanningGroup === "all" ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600 border-blue-200")}>
                    {selectedPlanningGroup === "all" ? "Group: Select" : `Group: ${selectedPlanningGroup.toUpperCase()}`}
                  </Badge>
                  {selectedPlanningGroup !== "all" && <Button size="sm" onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-bold px-4">Show Styles</Button>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <ScrollArea className="w-full">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50/80 dark:bg-slate-900/80">
                        <th colSpan={5} className="border border-slate-200 dark:border-slate-800"></th>
                        <th colSpan={5} className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">New Mapping</th>
                      </tr>
                      <tr>
                        <TableHeader className="w-[100px]">Style Code</TableHeader>
                        <TableHeader className="w-[150px]">Style Name</TableHeader>
                        <TableHeader className="w-[100px]">YTD Sales</TableHeader>
                        <TableHeader className="w-[100px]">Closing Stock</TableHeader>
                        <TableHeader className="w-[120px]">Change required Y/N</TableHeader>
                        <TableHeader className="text-[9px] text-blue-600 border-blue-100/50">Category</TableHeader>
                        <TableHeader className="text-[9px] text-blue-600 border-blue-100/50">Sub Category</TableHeader>
                        <TableHeader className="text-[9px] text-blue-600 border-blue-100/50">Merchandise Area</TableHeader>
                        <TableHeader className="text-[9px] text-blue-600 border-blue-100/50">Planning Group</TableHeader>
                        <TableHeader className="text-[9px] text-blue-600 border-blue-100/50">Sub Planning Group</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedData.map((row) => (
                        <tr key={row.id} className="h-10 transition-colors hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-[11px] font-medium border border-slate-100 text-center text-slate-700">{row.styleCode}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-left truncate max-w-[150px] text-slate-700">{row.styleName}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">£{row.ytdSales.toLocaleString()}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.closingStock.toLocaleString()}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center font-bold text-orange-600">{row.changeRequired}</td>
                          <td className="px-1 py-1 border border-slate-100 bg-blue-50/5"><Select defaultValue={row.currentMapping.category.toLowerCase()}><SelectTrigger className="h-7 text-[10px] border-none"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(o => <SelectItem key={o} value={o.toLowerCase()}>{o}</SelectItem>)}</SelectContent></Select></td>
                          <td className="px-1 py-1 border border-slate-100 bg-blue-50/5"><Select defaultValue={row.currentMapping.subCategory.toLowerCase()}><SelectTrigger className="h-7 text-[10px] border-none"><SelectValue /></SelectTrigger><SelectContent>{SUB_CATEGORIES.map(o => <SelectItem key={o} value={o.toLowerCase()}>{o}</SelectItem>)}</SelectContent></Select></td>
                          <td className="px-1 py-1 border border-slate-100 bg-blue-50/5"><Select defaultValue={row.currentMapping.merchArea.toLowerCase()}><SelectTrigger className="h-7 text-[10px] border-none"><SelectValue /></SelectTrigger><SelectContent>{MERCH_AREAS.map(o => <SelectItem key={o} value={o.toLowerCase()}>{o}</SelectItem>)}</SelectContent></Select></td>
                          <td className="px-1 py-1 border border-slate-100 bg-blue-50/5"><Select defaultValue={row.currentMapping.planningGroup.toLowerCase()}><SelectTrigger className="h-7 text-[10px] border-none"><SelectValue /></SelectTrigger><SelectContent>{PLANNING_GROUPS.map(o => <SelectItem key={o} value={o.toLowerCase()}>{o}</SelectItem>)}</SelectContent></Select></td>
                          <td className="px-1 py-1 border border-slate-100 bg-blue-50/5"><Select defaultValue={row.currentMapping.subPlanningGroup.toLowerCase()}><SelectTrigger className="h-7 text-[10px] border-none"><SelectValue /></SelectTrigger><SelectContent>{SUB_PLANNING_GROUPS.map(o => <SelectItem key={o} value={o.toLowerCase()}>{o}</SelectItem>)}</SelectContent></Select></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/30">
                    <div className="text-[11px] text-slate-500">Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, filteredData.length)} of {filteredData.length} styles</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="h-8 text-xs">Previous</Button>
                      <Button variant="outline" size="sm" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="h-8 text-xs">Next</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
