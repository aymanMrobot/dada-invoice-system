import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Euro, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentInvoices } = trpc.invoices.list.useQuery();

  const recent = recentInvoices?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Dada Restaurant Invoice System</p>
          </div>
          <Link href="/invoices/new">
            <Button size="lg">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats?.totalRevenue || "0.00"}</div>
                <p className="text-xs text-muted-foreground">From paid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats?.outstandingAmount || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Unpaid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.paidInvoices || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoices from your business</CardDescription>
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
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
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
