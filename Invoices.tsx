import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Edit3, Eye, FileText, Plus, Trash2 } from "lucide-react";
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

  const filteredInvoices =
    invoices?.filter((item) => statusFilter === "all" || item.invoice.status === statusFilter) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "overdue":
        return "text-red-700 bg-red-50 border-red-200";
      case "sent":
        return "text-sky-700 bg-sky-50 border-sky-200";
      default:
        return "text-stone-700 bg-stone-100 border-stone-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-white/70 bg-white/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Receivables</p>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Edit, send, track and close every customer invoice.</p>
          </div>
          <Link href="/invoices/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border/70 bg-white/70 p-3">
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
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No invoices found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {statusFilter === "all" ? "Get started by creating your first invoice" : `No ${statusFilter} invoices found`}
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
          <div className="overflow-hidden rounded-lg border border-border/70 bg-white/85 shadow-sm">
            {filteredInvoices.map((item) => (
              <div
                key={item.invoice.id}
                className="grid gap-4 border-b border-border/70 p-5 transition-colors last:border-b-0 hover:bg-stone-50/80 lg:grid-cols-[1.2fr_.8fr_.8fr_auto]"
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <Link href={`/invoices/${item.invoice.id}`}>
                      <h3 className="cursor-pointer text-lg font-semibold hover:text-primary">
                        {item.invoice.invoiceNumber}
                      </h3>
                    </Link>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(item.invoice.status)}`}>
                      {item.invoice.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{item.customer?.companyName || "Unknown Customer"}</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">
                    Issued {format(new Date(item.invoice.issueDate), "dd MMM yyyy")}
                  </div>
                  <div>Due {format(new Date(item.invoice.dueDate), "dd MMM yyyy")}</div>
                </div>

                <div className="lg:text-right">
                  <div className="text-2xl font-bold">€{item.invoice.total}</div>
                  <div className="text-xs text-muted-foreground">VAT €{item.invoice.vatAmount}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Link href={`/invoices/${item.invoice.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/invoices/${item.invoice.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  {item.invoice.status !== "paid" && (
                    <Button
                      size="sm"
                      onClick={() => markAsPaidMutation.mutate({ id: item.invoice.id })}
                      disabled={markAsPaidMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Paid
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
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
