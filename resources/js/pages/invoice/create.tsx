import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

// Breadcrumbs for invoice creation


interface Customer {
    id: number | string;
    name: string;
}
interface SaleLite {
    id: number | string;
    total_amount: number;
    status: string;
}
type FormData = {
    customer_id: string | number | '';
    customer_name: string;
    status: 'pending' | 'paid' | 'canceled';
    sales: (string | number)[];
    due_date: string;
    discount_percent: number;
    tax_percent: number;
    discount: number;
    tax_amount: number;
    notes: string;
    total_amount: number;
    type: 'sale';
};

export default function CreateInvoice() {
    const pageProps = usePage().props as unknown as Partial<{
        customers: Customer[];
        sales: SaleLite[];
        selected_customer_id: string | number | null;
        sale_search: string;
        auth: { user: { role: string | number } };
    }>;

    const role = pageProps.auth?.user?.role;
    const breadcrumbs: BreadcrumbItem[] = role == '2' ? [
        {title: 'Dashboard', href: '/dashboard' },
        { title: 'Invoices', href: '/invoices' },
        { title: 'Create', href: '/invoices/create' },
    ] : [
        { title: 'Pos', href: '/pos' },
        { title: 'Invoices', href: '/invoices' },
        { title: 'Create', href: '/invoices/create' },
    ];


    const customers = useMemo(() => pageProps.customers ?? [], [pageProps.customers]);
    const sales = useMemo(() => pageProps.sales ?? [], [pageProps.sales]);
    const selectedCustomerId = pageProps.selected_customer_id ?? '';
    const initialSaleSearch = pageProps.sale_search ?? '';

    const { data, setData, post, processing } = useForm<FormData>({
        customer_id: selectedCustomerId ? String(selectedCustomerId) : '',
        customer_name: '',
        status: 'pending',
        sales: [],
        due_date: '',
        discount_percent: 0,
        tax_percent: 0,
        discount: 0,
        tax_amount: 0,
        notes: '',
        total_amount: 0,
        type: 'sale',
    });

    // Base from selected sales
    const base = useMemo(() => {
        if (!data.sales.length) return 0;
        const selected = new Set(data.sales.map(String));
        return sales.filter((s) => selected.has(String(s.id))).reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
    }, [data.sales, sales]);

    const discountAmount = useMemo(() => (data.discount_percent / 100) * base, [data.discount_percent, base]);
    const taxableBase = useMemo(() => Math.max(base - discountAmount, 0), [base, discountAmount]);
    const taxAmount = useMemo(() => (data.tax_percent / 100) * taxableBase, [data.tax_percent, taxableBase]);
    const grandTotal = useMemo(() => Math.max(taxableBase + taxAmount, 0), [taxableBase, taxAmount]);

    function toggleSale(id: number | string) {
        const prev = Array.isArray(data.sales) ? data.sales : [];
        const key = String(id);
        const exists = prev.map(String).includes(key);
        const next = exists ? prev.filter((p) => String(p) !== key) : [...prev, id];
        setData('sales', next);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // Convert percent inputs to absolute amounts expected by backend
        setData('discount', Number(discountAmount.toFixed(2)));
        setData('tax_amount', Number(taxAmount.toFixed(2)));
        setData('total_amount', Number(grandTotal.toFixed(2)));
        post('/invoices');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <div className="mx-auto mt-2 w-full max-w-7xl px-4 md:px-8 lg:px-10">
                <form onSubmit={submit} className="mx-auto max-w-6xl space-y-10 rounded-lg border bg-background/50 p-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <Select
                                value={String(data.customer_id)}
                                onValueChange={(v) => {
                                    setData('customer_id', v);
                                    // Refresh page to load sales for this customer
                                    router.get('/invoices/create', { customer_id: v }, { preserveState: true, replace: true });
                                    // Reset selected sales when changing customer
                                    setData('sales', []);
                                }}
                            >
                                <SelectTrigger id="customer_id">
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customer_name">Walk‑in Customer Name (optional)</Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                placeholder="If not registered"
                            />
                        </div>
                        {/* Removed supplier and purchase type fields; invoices are sales-only */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as FormData['status'])}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-end gap-4 flex-wrap">
                            <div className="flex-1 min-w-[220px]">
                                <Label className="text-sm font-medium">Attach Sales</Label>
                                {(!data.customer_id || data.customer_id === '') && (
                                    <p className="text-xs text-muted-foreground">Select a customer OR search walk‑in sales.</p>
                                )}
                            </div>
                            {!data.customer_id && (
                                <div className="flex items-end gap-2">
                                    <div>
                                        <Label htmlFor="sale_search" className="text-xs">Walk‑in Sale Search</Label>
                                        <Input
                                            id="sale_search"
                                            defaultValue={initialSaleSearch}
                                            placeholder="Sale ID or customer name"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    router.get('/invoices/create', { sale_search: val }, { preserveState: true, replace: true });
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const input = document.getElementById('sale_search') as HTMLInputElement | null;
                                            const val = input?.value || '';
                                            router.get('/invoices/create', { sale_search: val }, { preserveState: true, replace: true });
                                        }}
                                    >
                                        Search
                                    </Button>
                                </div>
                            )}
                        </div>
                        {(data.customer_id || initialSaleSearch) && sales.length === 0 && (
                            <p className="text-sm text-muted-foreground">No sales found.</p>
                        )}
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {sales.map((sale) => {
                                const checked = data.sales.map(String).includes(String(sale.id));
                                return (
                                    <label
                                        key={sale.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                                    >
                                        <Checkbox checked={checked} onCheckedChange={() => toggleSale(sale.id)} />
                                        <span className="flex flex-col">
                                            <span className="font-medium">Sale #{sale.id}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Amount: {Number(sale.total_amount).toLocaleString()} • Status: {sale.status}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount_percent">Discount (%)</Label>
                            <Input
                                id="discount_percent"
                                type="number"
                                min={0}
                                max={100}
                                value={data.discount_percent}
                                onChange={(e) => setData('discount_percent', Number(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">Amount: {discountAmount.toLocaleString()} MMK</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax_percent">Tax (%)</Label>
                            <Input
                                id="tax_percent"
                                type="number"
                                min={0}
                                max={100}
                                value={data.tax_percent}
                                onChange={(e) => setData('tax_percent', Number(e.target.value) || 0)}
                            />
                            <p className="text-xs text-muted-foreground">Amount: {taxAmount.toLocaleString()} MMK</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Subtotal (Selected Sales)</Label>
                            <div className="rounded-md border bg-muted/40 p-3 text-sm font-medium">{base.toLocaleString()} MMK</div>
                        </div>
                        <div className="space-y-2">
                            <Label>Total</Label>
                            <div className="rounded-md bg-primary p-3 text-sm font-bold text-primary-foreground">
                                {grandTotal.toLocaleString()} MMK
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            className="min-h-[80px] w-full rounded-md border bg-background p-2 text-sm"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Additional information..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Invoice'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
