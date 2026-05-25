import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

const toDateInputValue = (value: string | Date | null | undefined, fallback = new Date()) => {
  const date = new Date(value || fallback);
  const safeDate = Number.isNaN(date.getTime()) ? fallback : date;
  return safeDate.toISOString().split("T")[0];
};

export default function InvoiceForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const invoiceId = params.id ? parseInt(params.id) : null;
  const isEditing = invoiceId !== null;

  const { data: invoiceData } = trpc.invoices.getById.useQuery(
    { id: invoiceId! },
    { enabled: isEditing }
  );
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: nextNumber } = trpc.invoices.getNextNumber.useQuery(undefined, {
    enabled: !isEditing,
  });

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
    vatRate: "23.00",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "0.00", amount: "0.00" },
  ]);

  useEffect(() => {
    if (nextNumber && !isEditing) {
      setFormData((prev) => ({ ...prev, invoiceNumber: nextNumber }));
    }
  }, [nextNumber, isEditing]);

  useEffect(() => {
    if (invoiceData) {
      const invoice = invoiceData.invoice;
      setFormData({
        customerId: invoice.customerId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        issueDate: toDateInputValue(invoice.issueDate),
        dueDate: toDateInputValue(invoice.dueDate),
        status: invoice.status,
        vatRate: invoice.vatRate,
        notes: invoice.notes || "",
      });
      if (invoiceData.items && invoiceData.items.length > 0) {
        setLineItems(
          invoiceData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          }))
        );
      }
    }
  }, [invoiceData]);

  const calculateLineAmount = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      newItems[index].amount = calculateLineAmount(
        newItems[index].quantity,
        newItems[index].unitPrice
      );
    }

    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "0.00", amount: "0.00" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
    const vatRate = parseFloat(formData.vatRate) / 100;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    return {
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const totals = calculateTotals();

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      toast.success("Invoice created successfully");
      setLocation("/invoices");
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      setLocation("/invoices");
    },
    onError: () => {
      toast.error("Failed to update invoice");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      toast.error("All line items must have a description");
      return;
    }

    const invoicePayload = {
      customerId: parseInt(formData.customerId),
      invoiceNumber: formData.invoiceNumber,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      subtotal: totals.subtotal,
      vatRate: formData.vatRate,
      vatAmount: totals.vatAmount,
      total: totals.total,
      notes: formData.notes || undefined,
      items: lineItems,
    };

    if (isEditing) {
      updateMutation.mutate({ id: invoiceId, ...invoicePayload });
    } else {
      createMutation.mutate(invoicePayload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4 rounded-lg border border-white/70 bg-white/85 p-5 shadow-sm">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Invoice editor</p>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Edit Invoice" : "New Invoice"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update invoice details" : "Create a new invoice for your customer"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Basic information about the invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Line Items</CardTitle>
                    <CardDescription>Add products or services to this invoice</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-4 rounded-md border border-border/70 bg-stone-50/50 p-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="flex-1 grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, "description", e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-2 lg:justify-end">
                      <div className="text-right pt-8">
                        <div className="font-semibold">€{item.amount}</div>
                      </div>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          className="mt-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="ml-auto max-w-sm space-y-2 rounded-md border border-border/70 bg-white p-4 shadow-sm">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">€{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                      <span>VAT:</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.vatRate}
                        onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })}
                        className="w-20 h-7"
                      />
                      <span>%</span>
                    </div>
                    <span className="font-medium">€{totals.vatAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>€{totals.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes or terms..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4" />
                {isPending ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
              </Button>
              <Link href="/invoices">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
