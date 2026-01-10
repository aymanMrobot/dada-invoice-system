import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { toast } from "sonner";

export default function InvoiceDetail() {
  const params = useParams();
  const invoiceId = parseInt(params.id!);
  const { data: invoiceData, isLoading } = trpc.invoices.getById.useQuery({ id: invoiceId });

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error("Failed to generate PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceData?.invoice.invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoiceData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Invoice not found</p>
              <Link href="/invoices">
                <Button className="mt-4">Back to Invoices</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { invoice, customer, items } = invoiceData;

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
              <p className="text-muted-foreground">Invoice Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Link href={`/invoices/${invoiceId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <img src="/dada-logo.png" alt="Dada Restaurant" className="h-16 mb-4" />
                <h2 className="text-2xl font-bold">Dada Restaurant</h2>
                <p className="text-sm text-muted-foreground">
                  Ireland<br />
                  www.dadarestaurant.ie
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-2 ${getStatusColor(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Issue Date: {format(new Date(invoice.issueDate), "dd MMM yyyy")}</div>
                  <div>Due Date: {format(new Date(invoice.dueDate), "dd MMM yyyy")}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{customer?.companyName}</div>
                  {customer?.contactName && <div>{customer.contactName}</div>}
                  {customer?.addressLine1 && <div>{customer.addressLine1}</div>}
                  {customer?.addressLine2 && <div>{customer.addressLine2}</div>}
                  {(customer?.city || customer?.county) && (
                    <div>{[customer?.city, customer?.county].filter(Boolean).join(", ")}</div>
                  )}
                  {customer?.postcode && <div>{customer.postcode}</div>}
                  {customer?.country && <div>{customer.country}</div>}
                  {customer?.email && <div className="mt-2">{customer.email}</div>}
                  {customer?.phone && <div>{customer.phone}</div>}
                  {customer?.taxId && <div className="mt-2">VAT: {customer.taxId}</div>}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Description</th>
                    <th className="text-right py-2 font-semibold w-24">Quantity</th>
                    <th className="text-right py-2 font-semibold w-32">Unit Price</th>
                    <th className="text-right py-2 font-semibold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">€{item.unitPrice}</td>
                      <td className="text-right py-3 font-medium">€{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>€{invoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT ({invoice.vatRate}%):</span>
                  <span>€{invoice.vatAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>€{invoice.total}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-2">Notes:</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
