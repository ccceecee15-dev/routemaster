import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import AllocationView from "@/pages/sip/AllocationView";
import ManageEventUplift from "@/pages/sip/ManageEventUplift";
import GenerateForecast from "@/pages/sip/GenerateForecast";
import VendorView from "@/pages/sip/VendorView";
import SkuDetail from "@/pages/sip/SkuDetail";
import DetermineGradingSize from "@/pages/rap/DetermineGradingSize";
import GradeStore from "@/pages/rap/GradeStore";
import RangeStyle from "@/pages/rap/RangeStyle";
import DetermineFacingsPresentation from "@/pages/rap/DetermineFacingsPresentation";
import NotFound from "@/pages/not-found";
import PlaceholderPage from "@/pages/PlaceholderPage";
import RouteMaster from "@/pages/master/RouteMaster";
import RouteMasterV2 from "@/pages/master/RouteMasterV2";
import SpacePlanning from "@/pages/SpacePlanning";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/sip/allocation" />
      </Route>
      <Route path="/sip/allocation" component={AllocationView} />
      <Route path="/sip/allocation/:skuId" component={SkuDetail} />
      <Route path="/sip/event-uplift" component={ManageEventUplift} />
      <Route path="/sip/forecast" component={GenerateForecast} />
      <Route path="/sip/vendor" component={VendorView} />
      <Route path="/sip/rules">{() => <PlaceholderPage title="SIP Rules" />}</Route>
      
      <Route path="/rap/grading-size" component={DetermineGradingSize} />
      <Route path="/rap/grade-store" component={GradeStore} />
      <Route path="/rap/range-style" component={RangeStyle} />
      <Route path="/rap/facings-presentation" component={DetermineFacingsPresentation} />
      <Route path="/rap/rules">{() => <PlaceholderPage title="RAP Rules" />}</Route>

      <Route path="/space-planning">
        <Redirect to="/space-planning/blocks" />
      </Route>
      <Route path="/space-planning/:screen" component={SpacePlanning} />

      <Route path="/master/route-master">{() => <RouteMaster />}</Route>
      <Route path="/route-master-v2" component={RouteMasterV2} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
