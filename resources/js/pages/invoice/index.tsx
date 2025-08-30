import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface InvoiceSale {
    id: number | string;
    total_amount: number;
    status: string;
}
interface Party {
    id: number | string;
    name: string;
}
interface InvoiceItem {
    id: number | string;
    invoice_number: string;
    type: string;
    status: string;
    total_amount: number;
    computed_sales_total: number;
    difference: number;
    customer?: Party | null;
    supplier?: Party | null;
    sales_count: number;
    sales: InvoiceSale[];
    created_at?: string;
}

interface AuthUser {
    role: string | number;
}
interface PageProps {
    invoices: {
        data: InvoiceItem[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { status?: string | null; type?: string | null; q?: string | null };
    summary: { total: number; pending: number; paid: number; canceled: number };
    auth: { user: AuthUser };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoices', href: '/invoices' }];

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

export default function InvoiceIndex() {
    const { invoices, filters, summary, auth } = usePage().props as unknown as PageProps;
    const [local, setLocal] = useState({
        status: filters.status || 'all',
        type: filters.type || 'all',
        q: filters.q || '',
    });

    function applyFilters(partial?: Partial<typeof local>) {
        const next = { ...local, ...(partial || {}) };
        setLocal(next);
        router.get(
            '/invoices',
            {
                status: next.status === 'all' ? undefined : next.status,
                type: next.type === 'all' ? undefined : next.type,
                q: next.q || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    const diffTotals = useMemo(() => {
        const positive = invoices.data.reduce((s, i) => s + (i.difference > 0 ? i.difference : 0), 0);
        const negative = invoices.data.reduce((s, i) => s + (i.difference < 0 ? i.difference : 0), 0);
        return { positive, negative };
    }, [invoices.data]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="mt-2 flex w-full max-w-7xl flex-col gap-8 px-4 md:px-8 lg:px-10">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Total</CardTitle>
                            <CardDescription>{summary.total} invoices</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{summary.total}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Paid</CardTitle>
                            <CardDescription>Completed invoices</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{summary.paid}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Pending</CardTitle>
                            <CardDescription>Awaiting payment</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{summary.pending}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Diff +/- (page)</CardTitle>
                            <CardDescription>Pos / Neg</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1 text-sm font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400">+{diffTotals.positive.toLocaleString()}</span>
                            <span className="text-red-600 dark:text-red-400">{diffTotals.negative.toLocaleString()}</span>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-40">
                        <label className="mb-1 block text-xs font-medium">Status</label>
                        <Select value={local.status} onValueChange={(v) => applyFilters({ status: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-40">
                        <label className="mb-1 block text-xs font-medium">Type</label>
                        <Select value={local.type} onValueChange={(v) => applyFilters({ type: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="sale">Sale</SelectItem>
                                <SelectItem value="purchase">Purchase</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="min-w-[200px] flex-1">
                        <label className="mb-1 block text-xs font-medium">Search</label>
                        <Input
                            value={local.q}
                            placeholder="Invoice # or customer"
                            onChange={(e) => setLocal((l) => ({ ...l, q: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters();
                            }}
                        />
                    </div>
                    <Button variant="secondary" onClick={() => applyFilters()}>
                        Apply
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setLocal({ status: 'all', type: 'all', q: '' });
                            applyFilters({ status: 'all', type: 'all', q: '' });
                        }}
                    >
                        Reset
                    </Button>
                    {String(auth?.user?.role) === '1' && (
                        <div className="ml-auto">
                            <Button asChild>
                                <Link href="/invoices/create">New Invoice</Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Sales Total</TableHead>
                                <TableHead className="text-right">Diff</TableHead>
                                <TableHead>Customer/Supplier</TableHead>
                                <TableHead className="text-center">Sales</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {invoices.data.map((inv, idx) => {
                                const diff = inv.difference;
                                return (
                                    <TableRow key={inv.id}>
                                        <TableCell>{(invoices.current_page - 1) * 10 + idx + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/invoices/${inv.id}`} className="hover:underline">
                                                {inv.invoice_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={inv.type === 'purchase' ? 'secondary' : 'outline'} className="capitalize">
                                                {inv.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(inv.status as string)} className="capitalize">
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{inv.total_amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{inv.computed_sales_total.toLocaleString()}</TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-right font-medium',
                                                diff === 0
                                                    ? 'text-muted-foreground'
                                                    : diff > 0
                                                      ? 'text-emerald-600 dark:text-emerald-400'
                                                      : 'text-red-600 dark:text-red-400',
                                            )}
                                        >
                                            {diff.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="max-w-[180px]">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {inv.customer && <span className="truncate">Customer: {inv.customer.name}</span>}
                                                {inv.supplier && <span className="truncate">Supplier: {inv.supplier.name}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-xs">{inv.sales_count}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{inv.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/invoices/${inv.id}`} className="text-xs text-primary hover:underline">
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        Showing {invoices.data.length} of {invoices.total} invoices
                    </p>
                    <Pagination>
                        <PaginationContent>
                            {invoices.prev_page_url && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={invoices.prev_page_url}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.get(invoices.prev_page_url!, {}, { preserveState: true, replace: true });
                                        }}
                                    />
                                </PaginationItem>
                            )}
                            {invoices.links
                                .filter((l) => l.label !== 'Previous' && l.label !== 'Next')
                                .map((l, i) => (
                                    <PaginationItem key={i}>
                                        {l.url ? (
                                            <PaginationLink
                                                href={l.url}
                                                isActive={l.active}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.get(l.url!, {}, { preserveState: true, replace: true });
                                                }}
                                            >
                                                {l.label}
                                            </PaginationLink>
                                        ) : (
                                            <span className="px-2 text-xs">...</span>
                                        )}
                                    </PaginationItem>
                                ))}
                            {invoices.next_page_url && (
                                <PaginationItem>
                                    <PaginationNext
                                        href={invoices.next_page_url}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.get(invoices.next_page_url!, {}, { preserveState: true, replace: true });
                                        }}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </AppLayout>
    );
}
