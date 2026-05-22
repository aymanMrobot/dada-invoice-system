import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowUpRight, Euro, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentInvoices } = trpc.invoices.list.useQuery();

  const recent = recentInvoices?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 rounded-lg border border-white/70 bg-[#201915] p-6 text-white shadow-xl shadow-stone-300/30 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Dada Restaurant</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Billing dashboard</h1>
            <p className="mt-1 text-white/70">Live view of invoices, collections and B2B customer activity.</p>
          </div>
          <Link href="/invoices/new">
            <Button size="lg" className="bg-white text-[#201915] hover:bg-white/90">
              <FileText className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-100 bg-emerald-50/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Euro className="h-4 w-4 text-emerald-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats?.totalRevenue || "0.00"}</div>
                <p className="text-xs text-muted-foreground">From paid invoices</p>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-amber-50/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats?.outstandingAmount || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Unpaid invoices</p>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-sky-50/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <TrendingUp className="h-4 w-4 text-sky-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.paidInvoices || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.unpaidInvoices || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white/85">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest invoices from your business</CardDescription>
              </div>
              <Link href="/invoices">
                <Button variant="outline" size="sm">
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No invoices yet. Create your first invoice to get started.</p>
                <Link href="/invoices/new">
                  <Button className="mt-4" variant="outline">Create Invoice</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recent.map((item) => (
                  <Link key={item.invoice.id} href={`/invoices/${item.invoice.id}`}>
                    <div className="flex cursor-pointer items-center justify-between rounded-md border border-border/70 p-4 transition-colors hover:bg-accent/50">
                      <div className="flex-1">
                        <div className="font-medium">{item.invoice.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.customer?.companyName || "Unknown Customer"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">€{item.invoice.total}</div>
                        <div className={`text-xs font-medium ${
                          item.invoice.status === 'paid' ? 'text-green-600' :
                          item.invoice.status === 'overdue' ? 'text-red-600' :
                          item.invoice.status === 'sent' ? 'text-blue-600' :
                          'text-muted-foreground'
                        }`}>
                          {item.invoice.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
