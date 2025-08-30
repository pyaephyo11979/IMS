import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useEffect } from "react";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pos', href: '/pos' },
    { title: 'Sales', href: '/sales' },
    { title: 'Create', href: '/sales/create' },
];


export default function CreateSale() {
        interface Customer { id: number|string; name: string }
        interface Product { id: number|string; name: string; price: number }
        const { customers = [], product } = usePage().props as { customers: Customer[]; product: Product };
    const { data, setData, post, processing } = useForm({
        customer_id: '',
        product_id: '',
        customer_name: '',
        tax: 0,
        discount: 0,
        status: 'pending',
        quantity: 1,
        price: 0,
        total_amount:0,
    });

        useEffect(() => {
            if (product) {
                setData(prev => ({ ...prev, product_id: String(product.id), price: product.price }));
            }
        }, [product, setData]);

    const base = useMemo(() => {
        if (!product) return 0;
        const unit = typeof product.price === 'number' ? product.price : Number(product.price || 0);
        return (data.quantity || 0) * unit;
    }, [data.quantity, product]);

    const total = useMemo(() => {
        const discountAmount = (data.discount / 100) * base;
        const taxed = base - discountAmount;
        const taxAmount = (data.tax / 100) * base; // apply tax on base (change if different rule)
        return Math.max(taxed + taxAmount, 0);
    }, [base, data.discount, data.tax]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setData('price', product?.price || 0);
        setData('total_amount', total);
        post('/sales');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Sale" />
            <form onSubmit={submit} className="mx-auto max-w-5xl p-6 space-y-8 bg-background/50 rounded-lg border">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="customer_id">Customer</Label>
                        <Select value={data.customer_id} onValueChange={(v) => setData('customer_id', v)}>
                            <SelectTrigger id="customer_id">
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Walk‑in Customer Name (optional)</Label>
                        <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} placeholder="If not registered" />
                    </div>

                    <div className="space-y-2">
                        <Label>Product</Label>
                        <Input value={product?.name || ''} readOnly />
                    </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" min={1} value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value) || 0)} />
                        </div>

                    <div className="space-y-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input id="discount" type="number" min={0} max={100} value={data.discount} onChange={(e) => setData('discount', Number(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tax">Tax (%)</Label>
                        <Input id="tax" type="number" min={0} max={100} value={data.tax} onChange={(e) => setData('tax', Number(e.target.value) || 0)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit_price">Unit Price</Label>
                        <Input id="unit_price" value={product?.price ?? ''} readOnly />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-md bg-muted/40 border">
                        <p className="text-xs text-muted-foreground">Base</p>
                        <p className="text-lg font-semibold">{base.toLocaleString()} MMK</p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/40 border">
                        <p className="text-xs text-muted-foreground">Discount</p>
                        <p className="text-lg font-semibold">{((data.discount/100)*base).toLocaleString()} MMK</p>
                    </div>
                    <div className="p-4 rounded-md bg-muted/40 border">
                        <p className="text-xs text-muted-foreground">Tax</p>
                        <p className="text-lg font-semibold">{((data.tax/100)*base).toLocaleString()} MMK</p>
                    </div>
                      <div className="p-4 rounded-md bg-primary text-primary-foreground border-none">
                        <p className="text-xs opacity-80">Total</p>
                        <p className="text-xl font-bold">{total.toLocaleString()} MMK</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Create Sale'}</Button>
                </div>
            </form>
        </AppLayout>
    );
}
