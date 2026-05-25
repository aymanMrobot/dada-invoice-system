import { useMemo, useState, useSyncExternalStore } from "react";

type Status = "draft" | "sent" | "paid" | "overdue";

type Customer = {
  id: number;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
};

type Invoice = {
  id: number;
  customerId: number;
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  status: Status;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  notes?: string;
  paidAt?: string | Date | null;
};

type InvoiceItem = {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

type Store = {
  customers: Customer[];
  invoices: Invoice[];
  invoiceItems: Record<number, InvoiceItem[]>;
};

const STORAGE_KEY = "dada_invoice_store";
const listeners = new Set<() => void>();

const seedStore: Store = {
  customers: [
    {
      id: 1,
      companyName: "Temple Bar Events",
      contactName: "Aoife Byrne",
      email: "accounts@templebarevents.ie",
      phone: "+353 1 555 0181",
      taxId: "IE6388047V",
      addressLine1: "14 Fleet Street",
      city: "Dublin",
      county: "Dublin",
      postcode: "D02",
      country: "Ireland",
    },
    {
      id: 2,
      companyName: "Cork Hospitality Group",
      contactName: "Liam Murphy",
      email: "finance@corkhospitality.ie",
      phone: "+353 21 555 0192",
      taxId: "IE9821173T",
      addressLine1: "28 South Mall",
      city: "Cork",
      county: "Cork",
      country: "Ireland",
    },
  ],
  invoices: [
    {
      id: 1,
      customerId: 1,
      invoiceNumber: "DADA-2026-001",
      issueDate: "2026-05-01",
      dueDate: "2026-05-31",
      status: "sent",
      subtotal: "1200.00",
      vatRate: "23.00",
      vatAmount: "276.00",
      total: "1476.00",
      notes: "Corporate dinner catering and private room service.",
      paidAt: null,
    },
    {
      id: 2,
      customerId: 2,
      invoiceNumber: "DADA-2026-002",
      issueDate: "2026-05-10",
      dueDate: "2026-06-09",
      status: "paid",
      subtotal: "780.00",
      vatRate: "23.00",
      vatAmount: "179.40",
      total: "959.40",
      notes: "Monthly restaurant group account.",
      paidAt: "2026-05-18",
    },
  ],
  invoiceItems: {
    1: [
      { description: "Private dining menu", quantity: "24", unitPrice: "42.00", amount: "1008.00" },
      { description: "Service charge", quantity: "1", unitPrice: "192.00", amount: "192.00" },
    ],
    2: [{ description: "Group lunch account", quantity: "12", unitPrice: "65.00", amount: "780.00" }],
  },
};

const readStore = (): Store => {
  if (typeof localStorage === "undefined") return seedStore;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStore));
    return seedStore;
  }

  try {
    return JSON.parse(saved) as Store;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedStore));
    return seedStore;
  }
};

const getStoreSnapshot = () => {
  const seeded = JSON.stringify(seedStore);
  if (typeof localStorage === "undefined") return seeded;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  localStorage.setItem(STORAGE_KEY, seeded);
  return seeded;
};

const parseStoreSnapshot = (snapshot: string): Store => {
  try {
    return JSON.parse(snapshot) as Store;
  } catch {
    return seedStore;
  }
};

const writeStore = (store: Store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const useStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getStoreSnapshot, () => JSON.stringify(seedStore));
  return useMemo(() => parseStoreSnapshot(snapshot), [snapshot]);
};

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((item) => item.id)) + 1;

const findCustomer = (store: Store, id: number) => store.customers.find((customer) => customer.id === id);

const useQuery = <T,>(selector: (store: Store) => T, enabled = true, deps: unknown[] = []) => {
  const store = useStore();
  const data = useMemo(() => (enabled ? selector(store) : undefined), [enabled, store, ...deps]);
  return { data, isLoading: false };
};

const useMutation = <TInput,>(
  action: (input: TInput, store: Store) => Store,
  options?: { onSuccess?: () => void; onError?: () => void }
) => {
  const [, setTick] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const mutate = (input: TInput) => {
    setIsPending(true);
    try {
      writeStore(action(input, readStore()));
      options?.onSuccess?.();
      setTick((tick) => tick + 1);
    } catch (error) {
      console.error(error);
      options?.onError?.();
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

export const trpc = {
  useUtils: () => ({
    customers: { list: { invalidate: () => listeners.forEach((listener) => listener()) } },
    invoices: { list: { invalidate: () => listeners.forEach((listener) => listener()) } },
    dashboard: { stats: { invalidate: () => listeners.forEach((listener) => listener()) } },
  }),
  customers: {
    list: { useQuery: () => useQuery((store) => store.customers) },
    getById: {
      useQuery: (input: { id: number }, options?: { enabled?: boolean }) =>
        useQuery((store) => findCustomer(store, input.id), options?.enabled ?? true, [input.id]),
    },
    create: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<Omit<Customer, "id">>((input, store) => ({
          ...store,
          customers: [...store.customers, { id: nextId(store.customers), ...input }],
        }), options),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<Customer>((input, store) => ({
          ...store,
          customers: store.customers.map((customer) => (customer.id === input.id ? input : customer)),
        }), options),
    },
    delete: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<{ id: number }>((input, store) => {
          const deletedInvoiceIds = new Set(
            store.invoices.filter((invoice) => invoice.customerId === input.id).map((invoice) => invoice.id)
          );
          const invoiceItems = { ...store.invoiceItems };
          deletedInvoiceIds.forEach((id) => delete invoiceItems[id]);

          return {
            ...store,
            customers: store.customers.filter((customer) => customer.id !== input.id),
            invoices: store.invoices.filter((invoice) => invoice.customerId !== input.id),
            invoiceItems,
          };
        }, options),
    },
  },
  invoices: {
    list: {
      useQuery: () =>
        useQuery((store) =>
          [...store.invoices]
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
            .map((invoice) => ({ invoice, customer: findCustomer(store, invoice.customerId) }))
        ),
    },
    getById: {
      useQuery: (input: { id: number }, options?: { enabled?: boolean }) =>
        useQuery((store) => {
          const invoice = store.invoices.find((item) => item.id === input.id);
          if (!invoice) return undefined;
          return {
            invoice,
            customer: findCustomer(store, invoice.customerId),
            items: store.invoiceItems[invoice.id] || [],
          };
        }, options?.enabled ?? true, [input.id]),
    },
    getNextNumber: {
      useQuery: (_input?: unknown, options?: { enabled?: boolean }) =>
        useQuery((store) => {
          const next = nextId(store.invoices).toString().padStart(3, "0");
          return `DADA-2026-${next}`;
        }, options?.enabled ?? true),
    },
    create: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<Omit<Invoice, "id"> & { items: InvoiceItem[] }>((input, store) => {
          const id = nextId(store.invoices);
          const { items, ...invoice } = input;
          return {
            ...store,
            invoices: [...store.invoices, { ...invoice, id }],
            invoiceItems: { ...store.invoiceItems, [id]: items },
          };
        }, options),
    },
    update: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<Invoice & { items: InvoiceItem[] }>((input, store) => {
          const { items, ...invoice } = input;
          return {
            ...store,
            invoices: store.invoices.map((item) => (item.id === input.id ? invoice : item)),
            invoiceItems: { ...store.invoiceItems, [input.id]: items },
          };
        }, options),
    },
    delete: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<{ id: number }>((input, store) => {
          const invoiceItems = { ...store.invoiceItems };
          delete invoiceItems[input.id];
          return {
            ...store,
            invoices: store.invoices.filter((invoice) => invoice.id !== input.id),
            invoiceItems,
          };
        }, options),
    },
    markAsPaid: {
      useMutation: (options?: { onSuccess?: () => void; onError?: () => void }) =>
        useMutation<{ id: number }>((input, store) => ({
          ...store,
          invoices: store.invoices.map((invoice) =>
            invoice.id === input.id
              ? { ...invoice, status: "paid" as Status, paidAt: new Date().toISOString() }
              : invoice
          ),
        }), options),
    },
  },
  dashboard: {
    stats: {
      useQuery: () =>
        useQuery((store) => {
          const paid = store.invoices.filter((invoice) => invoice.status === "paid");
          const unpaid = store.invoices.filter((invoice) => invoice.status !== "paid");
          const sum = (items: Invoice[]) =>
            items.reduce((total, invoice) => total + Number(invoice.total || 0), 0).toFixed(2);

          return {
            totalRevenue: sum(paid),
            outstandingAmount: sum(unpaid),
            paidInvoices: paid.length,
            unpaidInvoices: unpaid.length,
          };
        }),
    },
  },
};

export const useInvoiceStoreSnapshot = () => {
  const store = useStore();
  return useMemo(() => store, [store]);
};
