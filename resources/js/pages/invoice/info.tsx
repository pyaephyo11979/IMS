import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';

interface InvoiceSale {
    id: number | string;
    total_amount: number;
    status: string;
}
interface InvoiceData {
    id: number | string;
    invoice_number: string;
    type: string;
    status: string;
    total_amount: number;
    tax_amount: number;
    discount: number;
    computed_sales_total: number;
    difference: number;
    customer?: { id: number | string; name: string } | null;
    supplier?: { id: number | string; name: string } | null;
    sales: InvoiceSale[];
    created_at?: string;
    updated_at?: string;
}

function statusVariant(status: string) {
    switch (status) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'canceled':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function InvoiceInfo() {
    const { invoice } = usePage().props as { invoice: InvoiceData };
    const printRef = useRef<HTMLDivElement | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Invoices', href: '/invoices' },
        { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
    ];

    function handlePrint() {
        if (!printRef.current) return;
        const printContents = printRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=900,height=1000');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head><title>${invoice.invoice_number}</title><style>
			body{ font-family: system-ui, sans-serif; padding:24px; }
			h1{ font-size:1.25rem; margin:0 0 1rem; }
			table{ width:100%; border-collapse: collapse; font-size:12px; }
			th,td{ border:1px solid #ccc; padding:6px 8px; text-align:left; }
			th{ background:#f5f5f5; }
			.totals{ margin-top:16px; width:300px; margin-left:auto; }
			.totals td{ border:none; padding:4px 0; }
			.totals tr:last-child td{ font-weight:600; border-top:1px solid #000; }
		</style></head><body>${printContents}</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 200);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={invoice.invoice_number} />
            <div className="flex flex-col gap-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Invoice {invoice.invoice_number}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/invoices">Back</Link>
                        </Button>
                        <Button variant="secondary" onClick={handlePrint}>
                            Print
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Details</CardTitle>
                            <CardDescription>Overview of invoice</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex flex-wrap gap-x-10 gap-y-3">
                                <div>
                                    <span className="text-muted-foreground">Type:</span>{' '}
                                    <span className="font-medium capitalize">{invoice.type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status:</span>{' '}
                                    <Badge variant={statusVariant(invoice.status)} className="ml-1 capitalize">
                                        {invoice.status}
                                    </Badge>
                                </div>
                                {invoice.customer && (
                                    <div>
                                        <span className="text-muted-foreground">Customer:</span>{' '}
                                        <span className="font-medium">{invoice.customer.name}</span>
                                    </div>
                                )}
                                {invoice.supplier && (
                                    <div>
                                        <span className="text-muted-foreground">Supplier:</span>{' '}
                                        <span className="font-medium">{invoice.supplier.name}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground">Created:</span> <span>{invoice.created_at}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Updated:</span> <span>{invoice.updated_at}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-3 md:grid-cols-4" ref={printRef}>
                                <div className="md:col-span-4">
                                    <h2 className="mb-3 text-sm font-semibold">Sales Items</h2>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Sale</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.sales.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                                                        No sales attached.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {invoice.sales.map((s, i) => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="text-xs">{i + 1}</TableCell>
                                                    <TableCell className="text-xs font-medium">Sale #{s.id}</TableCell>
                                                    <TableCell className="text-xs">
                                                        <Badge variant={statusVariant(s.status)} className="capitalize">
                                                            {s.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs">{s.total_amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="mt-6 flex justify-end">
                                        <div className="w-64 text-xs">
                                            <div className="flex justify-between py-1">
                                                <span>Subtotal</span>
                                                <span>{invoice.computed_sales_total.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span>Discount</span>
                                                <span>{invoice.discount?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span>Tax</span>
                                                <span>{invoice.tax_amount?.toLocaleString()}</span>
                                            </div>
                                            <div className="mt-1 flex justify-between border-t py-1 pt-2 font-semibold">
                                                <span>Total</span>
                                                <span>{invoice.total_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between py-1 text-muted-foreground">
                                                <span>Diff</span>
                                                <span>{invoice.difference.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Summary</CardTitle>
                                <CardDescription>Totals insight</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span>Sales Count</span>
                                    <span>{invoice.sales.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sales Total</span>
                                    <span>{invoice.computed_sales_total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Discount</span>
                                    <span>{invoice.discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{invoice.tax_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span>Total</span>
                                    <span>{invoice.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Difference</span>
                                    <span>{invoice.difference.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Actions</CardTitle>
                                <CardDescription>Manage invoice</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    Print Invoice
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={`/invoices/${invoice.id}/edit`}>Edit (future)</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
