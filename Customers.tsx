import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Building2, Mail, Phone, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: customers, isLoading } = trpc.customers.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      utils.customers.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your B2B client information</p>
          </div>
          <Link href="/customers/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Try adjusting your search" : "Get started by adding your first customer"}
              </p>
              {!searchTerm && (
                <Link href="/customers/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    {customer.companyName}
                  </CardTitle>
                  {customer.contactName && (
                    <CardDescription>{customer.contactName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.taxId && (
                    <div className="text-sm text-muted-foreground">
                      VAT: {customer.taxId}
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Link href={`/customers/${customer.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Edit</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this customer?")) {
                          deleteMutation.mutate({ id: customer.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
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
