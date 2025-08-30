import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

// Breadcrumbs for invoice creation
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Invoices', href: '/invoices' },
    { title: 'Create', href: '/invoices/create' },
];

interface Customer {
    id: number | string;
    name: string;
}
interface Supplier {
    id: number | string;
    name: string;
}
interface SaleLite {
    id: number | string;
    total_amount: number;
    status: string;
}

export default function CreateInvoice() {
    const { customers = [], suppliers = [], sales = [] } = usePage().props as { customers: Customer[]; suppliers: Supplier[]; sales: SaleLite[] };

    // Using percent inputs locally, converting to absolute amounts on submit
    const { data, setData, post, processing } = useForm({
        customer_id: '',
        supplier_id: '',
        customer_name: '',
        type: 'sale', // or 'purchase'
        status: 'pending',
        sales: [] as (string | number)[],
        due_date: '',
        discount_percent: 0,
        tax_percent: 0,
        discount: 0, // absolute (populated on submit)
        tax_amount: 0, // absolute (populated on submit)
        notes: '',
        total_amount: 0,
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
        setData('sales', (prev) => {
            const set = new Set(prev.map(String));
            const key = String(id);
            if (set.has(key)) {
                return prev.filter((p) => String(p) !== key);
            }
            return [...prev, id];
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // Convert percent inputs to absolute amounts expected by backend
        setData('discount', Number(discountAmount.toFixed(2)) as any);
        setData('tax_amount', Number(taxAmount.toFixed(2)) as any);
        setData('total_amount', Number(grandTotal.toFixed(2)) as any);
        post('/invoices');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <form onSubmit={submit} className="mx-auto max-w-6xl space-y-10 rounded-lg border bg-background/50 p-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="customer_id">Customer</Label>
                        <Select value={data.customer_id} onValueChange={(v) => setData('customer_id', v)}>
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
                    <div className="space-y-2">
                        <Label htmlFor="supplier_id">Supplier (for purchases)</Label>
                        <Select value={data.supplier_id} onValueChange={(v) => setData('supplier_id', v)}>
                            <SelectTrigger id="supplier_id">
                                <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sale">Sale</SelectItem>
                                <SelectItem value="purchase">Purchase</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
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
                    <Label className="text-sm font-medium">Attach Sales</Label>
                    {sales.length === 0 && <p className="text-sm text-muted-foreground">No sales available to attach right now.</p>}
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
                        <div className="rounded-md bg-primary p-3 text-sm font-bold text-primary-foreground">{grandTotal.toLocaleString()} MMK</div>
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
        </AppLayout>
    );
}
