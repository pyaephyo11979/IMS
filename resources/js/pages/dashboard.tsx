import { NotificationCard } from '@/components/notification-card';
import { SectionCard } from '@/components/section-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Building2, CreditCard, Package, ShoppingCart, Store, Users, ArrowUpDown, Grid, List, Search } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Local lightweight typings for dashboard metrics to satisfy TS (adjust to your global ShareData if needed)
interface DashboardPageProps {
    products: { id: number }[];
    users: { id: number }[];
    customers: { id: number }[];
    suppliers: { id: number; status: string }[];
    branches: { id: number; name: string }[];
    sales: { id: number; total_amount: number; branch_id?: number; branch?: { id: number } }[];
    stockNotifications: unknown[];
}

export default function Dashboard() {
    const { products, users, customers, suppliers, branches, sales, stockNotifications } = usePage<{ props: DashboardPageProps }>()
        .props as unknown as DashboardPageProps;
    let saleamount = 0;
    sales.forEach((sale) => {
        saleamount += sale.total_amount;
    });
    // Compute per-branch sales (include branches with zero sales)
    interface BranchLite {
        id: number;
        name: string;
    }
    interface SaleLite {
        id: number;
        total_amount: number;
        branch_id?: number;
        branch?: { id: number };
    }
    const branchSalesRaw = useMemo(() => {
        return (branches as BranchLite[]).map((br) => {
            const salesFor = (sales as SaleLite[]).filter((s) => (s.branch_id ?? s.branch?.id) === br.id);
            const total = salesFor.reduce((sum, s) => sum + (s.total_amount || 0), 0);
            return { id: br.id, name: br.name, total, count: salesFor.length };
        });
    }, [branches, sales]);

    // Interactive state controls
    const [sortKey, setSortKey] = useState<'total' | 'count' | 'name'>('total');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [showPrimary, setShowPrimary] = useState(false); // branch id 1 hidden by default
    const [searchTerm, setSearchTerm] = useState('');

    const branchSales = useMemo(() => {
        let data = branchSalesRaw.filter((b) => (showPrimary ? true : b.id !== 1));
        if (searchTerm.trim()) {
            const q = searchTerm.trim().toLowerCase();
            data = data.filter((b) => b.name.toLowerCase().includes(q));
        }
        data = [...data].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (av === bv) return 0;
            if (sortDir === 'asc') return av > bv ? 1 : -1;
            return av < bv ? 1 : -1;
        });
        return data;
    }, [branchSalesRaw, sortKey, sortDir, showPrimary, searchTerm]);

    function toggleSort(key: 'total' | 'count' | 'name') {
        if (key === sortKey) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    // ---- Live Auto-Refresh ----
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [intervalMs, setIntervalMs] = useState(30000); // 30s default
    const ticking = useRef<number | null>(null);
    const lastRefresh = useRef<number>(Date.now());
    const [secondsSince, setSecondsSince] = useState(0);

    // Update seconds since last refresh counter
    useEffect(() => {
        const id = window.setInterval(() => setSecondsSince(Math.floor((Date.now() - lastRefresh.current) / 1000)), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        function doReload() {
            lastRefresh.current = Date.now();
            setSecondsSince(0);
            // Reload only the data props; preserve local UI state
            router.visit(window.location.href, {
                only: ['products', 'users', 'customers', 'suppliers', 'branches', 'sales', 'stockNotifications'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
        if (!autoRefresh) {
            if (ticking.current) window.clearInterval(ticking.current);
            ticking.current = null;
            return;
        }
        // Pause when tab hidden
        function handleVisibility() {
            if (document.hidden) {
                if (ticking.current) {
                    window.clearInterval(ticking.current);
                    ticking.current = null;
                }
            } else if (!ticking.current && autoRefresh) {
                doReload();
                ticking.current = window.setInterval(doReload, intervalMs);
            }
        }
        document.addEventListener('visibilitychange', handleVisibility);
        // Initial kick
        doReload();
        ticking.current = window.setInterval(doReload, intervalMs);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (ticking.current) window.clearInterval(ticking.current);
            ticking.current = null;
        };
    }, [autoRefresh, intervalMs]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <NotificationCard notifications={stockNotifications} />
                <div className="mb-1 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2 rounded border px-2 py-1 bg-background">
                        <label className="flex items-center gap-1 text-xs font-medium">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border"
                            />
                            Auto Refresh
                        </label>
                        <select
                            value={intervalMs}
                            onChange={(e) => setIntervalMs(Number(e.target.value))}
                            className="rounded border bg-background px-1 py-0.5 text-xs"
                            disabled={!autoRefresh}
                        >
                            <option value={15000}>15s</option>
                            <option value={30000}>30s</option>
                            <option value={60000}>1m</option>
                            <option value={120000}>2m</option>
                        </select>
                        <span className="text-[10px]">Last: {secondsSince}s ago</span>
                        {!autoRefresh && (
                            <button
                                type="button"
                                onClick={() => {
                                    lastRefresh.current = Date.now();
                                    setSecondsSince(0);
                                    router.visit(window.location.href, {
                                        only: ['products', 'users', 'customers', 'suppliers', 'branches', 'sales', 'stockNotifications'],
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    });
                                }}
                                className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground"
                            >
                                Refresh Now
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <SectionCard
                        title="Active Staff"
                        value={users.length.toLocaleString()}
                        icon={<Users />}
                        footer={<span>{users.length} total active staff accounts</span>}
                        href="/users"
                        variant="primary"
                    />
                    <SectionCard
                        title="Products"
                        value={products.length.toLocaleString()}
                        icon={<Package />}
                        footer={<span>Inventory items</span>}
                        sparkline={[3, 4, 6, 5, 8, 7, 9]}
                        href="/products"
                    />
                    <SectionCard
                        title="Customers"
                        value={customers.length.toLocaleString()}
                        icon={<ShoppingCart />}
                        footer={<span>Registered customers</span>}
                        sparkline={[2, 3, 3, 4, 6, 5, 7]}
                        href="/customers"
                    />
                    <SectionCard
                        title="Active Suppliers"
                        value={`${(suppliers as { status: string }[]).filter((s) => s.status === 'active').length}/${suppliers.length}`}
                        icon={<Building2 />}
                        footer={<span>Active / Total</span>}
                        sparkline={[1, 2, 2, 3, 4, 4, 5]}
                        href="/suppliers"
                    />
                    <SectionCard
                        title="Branches"
                        value={branches.length}
                        icon={<Store />}
                        footer={<span>Operational branches</span>}
                        sparkline={[1, 1, 2, 2, 3, 3, 3]}
                    />
                    <SectionCard
                        title="Sales Volume"
                        value={saleamount.toLocaleString()}
                        valueSuffix=" MMK"
                        icon={<CreditCard />}
                        changeLabel="vs prev period"
                        footer={<span>Total sales revenue</span>}
                        sparkline={[10, 12, 9, 14, 18, 16, 20]}
                        href="/sales"
                        variant="primary"
                    />
                </div>
                <div className="mt-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="px-1 text-sm font-medium text-muted-foreground">Branch Sales</h2>
                        <div className="flex items-center gap-2 rounded border bg-background px-2 py-1 text-xs">
                            <button
                                type="button"
                                onClick={() => toggleSort('total')}
                                className={cn('inline-flex items-center gap-1', sortKey === 'total' && 'font-semibold text-primary')}
                            >
                                Total <ArrowUpDown className="h-3 w-3" />
                            </button>
                            <span className="text-muted-foreground">/</span>
                            <button
                                type="button"
                                onClick={() => toggleSort('count')}
                                className={cn('inline-flex items-center gap-1', sortKey === 'count' && 'font-semibold text-primary')}
                            >
                                Count <ArrowUpDown className="h-3 w-3" />
                            </button>
                            <span className="text-muted-foreground">/</span>
                            <button
                                type="button"
                                onClick={() => toggleSort('name')}
                                className={cn('inline-flex items-center gap-1', sortKey === 'name' && 'font-semibold text-primary')}
                            >
                                Name <ArrowUpDown className="h-3 w-3" />
                            </button>
                        </div>
                        <label className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={showPrimary}
                                onChange={(e) => setShowPrimary(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border"
                            />
                            Show Primary Branch
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search branches..."
                                className="pl-7 pr-2 py-1 text-xs rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="ml-auto flex items-center gap-1 rounded border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => setView('grid')}
                                className={cn('rounded px-2 py-1 text-xs font-medium', view === 'grid' && 'bg-primary text-primary-foreground')}
                            >
                                <Grid className="mr-1 inline h-3 w-3" /> Grid
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('table')}
                                className={cn('rounded px-2 py-1 text-xs font-medium', view === 'table' && 'bg-primary text-primary-foreground')}
                            >
                                <List className="mr-1 inline h-3 w-3" /> Table
                            </button>
                        </div>
                    </div>
                    {view === 'grid' ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {branchSales.map((b) => (
                                <SectionCard
                                    key={b.id}
                                    title={b.name}
                                    value={b.total.toLocaleString()}
                                    valueSuffix=" MMK"
                                    footer={<span>{b.count} sale{b.count !== 1 && 's'}</span>}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded border">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Branch</th>
                                        <th className="px-3 py-2 text-right">Total (MMK)</th>
                                        <th className="px-3 py-2 text-right">Sales Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branchSales.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">No branches match.</td>
                                        </tr>
                                    )}
                                    {branchSales.map((b) => (
                                        <tr key={b.id} className="border-t">
                                            <td className="px-3 py-2 font-medium">{b.name}</td>
                                            <td className="px-3 py-2 text-right tabular-nums">{b.total.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right">{b.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
