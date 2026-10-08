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
import { Package, Filter, Download, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORIES = ["Books", "Stationery", "Gifts", "Media"];
const SUB_CATEGORIES = ["Fiction", "Non-Fiction", "Writing", "Office"];
const MERCH_AREAS = ["Main Floor", "Section A", "Section B", "Display"];
const PLANNING_GROUPS = ["Group A", "Group B", "Group C"];
const SUB_PLANNING_GROUPS = ["Sub Group 1", "Sub Group 2", "Sub Group 3"];

type ViewState = "list" | "bulk-edit" | "confirm";

export default function StyleMappingManagement() {
  const [viewState, setViewState] = useState<ViewState>("list");
  const [data, setData] = useState<any[]>([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedMerchArea, setSelectedMerchArea] = useState<string>("all");
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>("all");
  const [selectedSubPlanningGroup, setSelectedSubPlanningGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());
  const itemsPerPage = 20;

  // Bulk Edit State
  const [bulkMapping, setBulkMapping] = useState({
    category: "",
    subCategory: "",
    merchArea: "",
    planningGroup: "",
    subPlanningGroup: ""
  });

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
      setSelectedRowIds(new Set());
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
    setSelectedRowIds(new Set());
  };

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRowIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.size === paginatedData.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedData.map(row => row.id)));
    }
  };

  const handleBulkApply = () => {
    setViewState("confirm");
  };

  const handleConfirmMapping = () => {
    // In a real app, update the data here
    setViewState("list");
    setSelectedRowIds(new Set());
    // Show success toast or similar
  };

  const TableHeader = ({ children, colSpan = 1, className = "" }: { children: React.ReactNode, colSpan?: number, className?: string }) => (
    <th colSpan={colSpan} className={cn("px-2 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-center", className)}>
      <div className="flex items-center justify-center gap-1">{children}</div>
    </th>
  );

  if (viewState === "bulk-edit" || viewState === "confirm") {
    const selectedRows = data.filter(row => selectedRowIds.has(row.id));
    return (
      <MainLayout>
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setViewState("list")} className="h-8 w-8 p-0 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {viewState === "bulk-edit" ? "Bulk Style Mapping" : "Confirm Mapping Changes"}
                </h2>
                <p className="text-sm text-slate-500">Mapping {selectedRowIds.size} selected styles</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Selected Styles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                      <tr>
                        <TableHeader className="w-[80px]">Code</TableHeader>
                        <TableHeader className="w-[120px]">Name</TableHeader>
                        <TableHeader className="w-[80px]">Category</TableHeader>
                        <TableHeader className="w-[80px]">Sub Cat</TableHeader>
                        <TableHeader className="w-[80px]">Merch Area</TableHeader>
                        <TableHeader className="w-[80px]">Group</TableHeader>
                        <TableHeader className="w-[80px]">Sub Group</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedRows.map(row => (
                        <tr key={row.id} className="h-10">
                          <td className="px-2 py-2 text-[10px] text-center font-medium">{row.styleCode}</td>
                          <td className="px-2 py-2 text-[10px] truncate max-w-[120px]">{row.styleName}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 text-center">{row.currentMapping.category}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 text-center">{row.currentMapping.subCategory}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 text-center">{row.currentMapping.merchArea}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 text-center">{row.currentMapping.planningGroup}</td>
                          <td className="px-2 py-2 text-[10px] text-slate-500 text-center">{row.currentMapping.subPlanningGroup}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">New Hierarchy Mapping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Category</label>
                  <Select onValueChange={(v) => setBulkMapping({...bulkMapping, category: v})}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Sub Category</label>
                  <Select onValueChange={(v) => setBulkMapping({...bulkMapping, subCategory: v})}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Sub Category" /></SelectTrigger>
                    <SelectContent>{SUB_CATEGORIES.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Merch Area</label>
                  <Select onValueChange={(v) => setBulkMapping({...bulkMapping, merchArea: v})}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Merch Area" /></SelectTrigger>
                    <SelectContent>{MERCH_AREAS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Planning Group</label>
                  <Select onValueChange={(v) => setBulkMapping({...bulkMapping, planningGroup: v})}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Planning Group" /></SelectTrigger>
                    <SelectContent>{PLANNING_GROUPS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Sub Planning Group</label>
                  <Select onValueChange={(v) => setBulkMapping({...bulkMapping, subPlanningGroup: v})}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select Sub Planning Group" /></SelectTrigger>
                    <SelectContent>{SUB_PLANNING_GROUPS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  {viewState === "bulk-edit" ? (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!bulkMapping.category || !bulkMapping.planningGroup}
                      onClick={handleBulkApply}
                    >
                      Review Changes
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold">Ready to update {selectedRowIds.size} styles</p>
                            <p className="text-[10px] mt-1 opacity-80">Changes will be applied to the master hierarchy mapping immediately.</p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmMapping}>
                        Confirm & Save
                      </Button>
                      <Button variant="ghost" className="w-full text-xs" onClick={() => setViewState("bulk-edit")}>
                        Back to Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Style Mapping Management</CardTitle>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Hierarchy Maintenance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasAppliedFilters && (
                  <Button 
                    disabled={selectedRowIds.size === 0}
                    onClick={() => setViewState("bulk-edit")}
                    className="h-8 text-[11px] font-bold px-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Map to New Style ({selectedRowIds.size})
                  </Button>
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
                      <tr>
                        <th className="w-10 px-0 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                          <div className="flex items-center justify-center">
                            <Checkbox checked={selectedRowIds.size === paginatedData.length && paginatedData.length > 0} onCheckedChange={toggleSelectAll} />
                          </div>
                        </th>
                        <TableHeader className="w-[100px]">Style Code</TableHeader>
                        <TableHeader className="w-[150px]">Style Name</TableHeader>
                        <TableHeader className="w-[100px]">YTD Sales</TableHeader>
                        <TableHeader className="w-[100px]">Closing Stock</TableHeader>
                        <TableHeader className="w-[120px]">Change required Y/N</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedData.map((row) => (
                        <tr key={row.id} className={cn("h-10 transition-colors hover:bg-slate-50/50", selectedRowIds.has(row.id) && "bg-blue-50/30 dark:bg-blue-900/10")}>
                          <td className="w-10 px-0 py-2 border border-slate-100 dark:border-slate-900">
                            <div className="flex items-center justify-center">
                              <Checkbox checked={selectedRowIds.has(row.id)} onCheckedChange={() => toggleRowSelection(row.id)} />
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[11px] font-medium border border-slate-100 text-center text-slate-700">{row.styleCode}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-left truncate max-w-[150px] text-slate-700">{row.styleName}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">£{row.ytdSales.toLocaleString()}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center tabular-nums text-slate-700">{row.closingStock.toLocaleString()}</td>
                          <td className="px-3 py-2 text-[11px] border border-slate-100 text-center font-bold text-orange-600">{row.changeRequired}</td>
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
