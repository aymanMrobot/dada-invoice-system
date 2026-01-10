import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const utils = trpc.useUtils();

  const markAsPaidMutation = trpc.invoices.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Invoice marked as paid");
      utils.invoices.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: () => {
      toast.error("Failed to update invoice");
    },
  });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      utils.invoices.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete invoice");
    },
  });

  const filteredInvoices = invoices?.filter((item) =>
    statusFilter === "all" || item.invoice.status === statusFilter
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600 bg-green-50";
      case "overdue": return "text-red-600 bg-red-50";
      case "sent": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage and track all your invoices</p>
          </div>
          <Link href="/invoices/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {statusFilter === "all"
                  ? "Get started by creating your first invoice"
                  : `No ${statusFilter} invoices found`}
              </p>
              {statusFilter === "all" && (
                <Link href="/invoices/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((item) => (
              <Card key={item.invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/invoices/${item.invoice.id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                            {item.invoice.invoiceNumber}
                          </h3>
                        </Link>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.invoice.status)}`}>
                          {item.invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{item.customer?.companyName || "Unknown Customer"}</div>
                        <div>
                          Issue Date: {format(new Date(item.invoice.issueDate), "dd MMM yyyy")} | 
                          Due Date: {format(new Date(item.invoice.dueDate), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">€{item.invoice.total}</div>
                        <div className="text-xs text-muted-foreground">
                          (VAT: €{item.invoice.vatAmount})
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={`/invoices/${item.invoice.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        {item.invoice.status !== "paid" && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaidMutation.mutate({ id: item.invoice.id })}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this invoice?")) {
                              deleteMutation.mutate({ id: item.invoice.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
