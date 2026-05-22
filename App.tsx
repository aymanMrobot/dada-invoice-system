import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./NotFound";
import Login from "./Login";
import { Route, Switch } from "wouter";
import { useSimpleAuth } from "./useSimpleAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./Dashboard";
import Customers from "./Customers";
import CustomerForm from "./CustomerForm";
import Invoices from "./Invoices";
import InvoiceForm from "./InvoiceForm";
import InvoiceDetail from "./InvoiceDetail";

function Router() {
  const { isAuthenticated, isLoading } = useSimpleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/customers/new"} component={CustomerForm} />
      <Route path={"/customers/:id"} component={CustomerForm} />
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/invoices/new"} component={InvoiceForm} />
      <Route path={"/invoices/:id/edit"} component={InvoiceForm} />
      <Route path={"/invoices/:id"} component={InvoiceDetail} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
