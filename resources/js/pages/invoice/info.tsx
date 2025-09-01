import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
    branch?: string | null;
    total_amount: number;
    tax_amount: number;
    discount: number;
    computed_sales_total: number;
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
    const { invoice, auth } = usePage().props as unknown as { invoice: InvoiceData; auth: { user: { role: string | number } } };
    const printRef = useRef<HTMLDivElement | null>(null);

    const breadcrumbs: BreadcrumbItem[] =
        auth.user.role == '2'
            ? [
                  { title: 'Dashboard', href: '/dashboard' },
                  { title: 'Invoices', href: '/invoices' },
                  { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
              ]
            : [
                  { title: 'Pos', href: '/pos' },
                  { title: 'Invoices', href: '/invoices' },
                  { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
              ];

    function handlePrint() {
        if (!printRef.current) return;
        const headHtml = document.querySelector('head')?.innerHTML || '';
        const contentHtml = printRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=900,height=1000');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head>${headHtml}<title>${invoice.invoice_number}</title><style>
            @media print { .no-print { display:none !important; } }
            body { background:#fff; }
        </style></head><body>${contentHtml}</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 300);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={invoice.invoice_number} />
            <div className="mx-auto my-2 flex w-full max-w-7xl flex-col gap-8 px-4 md:px-8 lg:px-10">
                <div ref={printRef} className="flex flex-col gap-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold">Invoice {invoice.invoice_number}</h1>
                            {invoice.branch && <p className="text-xs text-muted-foreground">Branch: {invoice.branch}</p>}
                        </div>
                        <div className="no-print flex gap-2">
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
                                                    <span>{invoice.computed_sales_total.toLocaleString()} MMK</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span>Discount</span>
                                                    <span>{invoice.discount?.toLocaleString()} MMK</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span>Tax</span>
                                                    <span>{invoice.tax_amount?.toLocaleString()} MMK</span>
                                                </div>
                                                <div className="mt-1 flex justify-between border-t py-1 pt-2 font-semibold">
                                                    <span>Total</span>
                                                    <span>{invoice.total_amount.toLocaleString()} MMK</span>
                                                </div>
                                                {/* Diff removed */}
                                            </div>
                                        </div>
                                        <div className="mt-10 flex items-center justify-between border-t pt-6 text-[10px] text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-[11px] font-semibold">
                                                    🧾
                                                </span>
                                                <span>Generated by IMS System</span>
                                            </div>
                                            <span>Date: {new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-12 grid gap-8 text-xs sm:grid-cols-3 print:mt-16">
                                            <div className="flex flex-col items-start gap-6">
                                                <div className="h-10 w-full border-b" />
                                                <span className="tracking-wide text-muted-foreground uppercase">Prepared By</span>
                                            </div>
                                            <div className="flex flex-col items-start gap-6">
                                                <div className="h-10 w-full border-b" />
                                                <span className="tracking-wide text-muted-foreground uppercase">Checked / Verified</span>
                                            </div>
                                            <div className="flex flex-col items-start gap-6">
                                                <div className="h-10 w-full border-b" />
                                                <span className="tracking-wide text-muted-foreground uppercase">Approved</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="no-print flex flex-col gap-6">
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
                                    {/* Difference removed */}
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
                                </CardContent>
                            </Card>
                            {String(auth?.user?.role) === '1' && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Update Status</CardTitle>
                                        <CardDescription>Modify and save</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="inv_status" className="w-16 text-muted-foreground">
                                                Status
                                            </label>
                                            <select
                                                id="inv_status"
                                                defaultValue={invoice.status}
                                                onChange={(e) => {
                                                    router.post(
                                                        `/invoices/update/${invoice.id}`,
                                                        { status: e.target.value },
                                                        { preserveScroll: true },
                                                    );
                                                }}
                                                className="flex-1 rounded border bg-background px-2 py-1"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="canceled">Canceled</option>
                                            </select>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                if (confirm('Delete this invoice?')) {
                                                    router.post(`/invoices/${invoice.id}`, {}, { preserveScroll: true });
                                                }
                                            }}
                                        >
                                            Delete Invoice
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
