import { SectionCard } from '@/components/section-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Package, Users, ShoppingCart, Store, CreditCard, Building2 } from 'lucide-react';
import { useMemo } from 'react';
import { NotificationCard } from '@/components/notification-card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Local lightweight typings for dashboard metrics to satisfy TS (adjust to your global ShareData if needed)
interface DashboardPageProps {
    products: { id:number }[];
    users: { id:number }[];
    customers: { id:number }[];
    suppliers: { id:number; status:string }[];
    branches: { id:number; name:string }[];
    sales: { id:number; total_amount:number; branch_id?:number; branch?:{id:number} }[];
        stockNotifications: unknown[];
}


export default function Dashboard() {
        const { products, users, customers, suppliers, branches, sales, stockNotifications } = usePage<{ props: DashboardPageProps }>().props as unknown as DashboardPageProps;
    let saleamount=0;
        sales.forEach((sale) => {
        saleamount += sale.total_amount;
    });
    // Compute per-branch sales (include branches with zero sales)
    interface BranchLite { id: number; name: string }
    interface SaleLite { id: number; total_amount: number; branch_id?: number; branch?: { id: number } }
    const branchSales = useMemo(() => {
        return (branches as BranchLite[]).map((br) => {
            const salesFor = (sales as SaleLite[]).filter((s) => (s.branch_id ?? s.branch?.id) === br.id);
            const total = salesFor.reduce((sum, s) => sum + (s.total_amount || 0), 0);
            return { id: br.id, name: br.name, total, count: salesFor.length };
        });
    }, [branches, sales]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                                                <NotificationCard notifications={stockNotifications} />
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        <SectionCard
                                            title="Active Staff"
                                            value={users.length}
                                            icon={<Users />}
                                            footer={<span>{users.length} total active staff accounts</span>}

                                        />
                                        <SectionCard
                                            title="Products"
                                            value={products.length}
                                            icon={<Package />}
                                            footer={<span>Inventory items</span>}
                                            sparkline={[3,4,6,5,8,7,9]}
                                        />
                                        <SectionCard
                                            title="Customers"
                                            value={customers.length}
                                            icon={<ShoppingCart />}
                                            footer={<span>Registered customers</span>}
                                            sparkline={[2,3,3,4,6,5,7]}
                                        />
                                        <SectionCard
                                            title="Active Suppliers"
                                            value={`${(suppliers as {status:string}[]).filter((s) => s.status==='active').length}/${suppliers.length}`}
                                            icon={<Building2 />}
                                            footer={<span>Active / Total</span>}
                                            sparkline={[1,2,2,3,4,4,5]}
                                        />
                                        <SectionCard
                                            title="Branches"
                                            value={branches.length}
                                            icon={<Store />}
                                            footer={<span>Operational branches</span>}
                                            sparkline={[1,1,2,2,3,3,3]}
                                        />
                                        <SectionCard
                                            title="Sales Volume"
                                            value={saleamount}
                                            valueSuffix=" MMK"
                                            icon={<CreditCard />}
                                            changeLabel="vs prev period"
                                            footer={<span>Total sales revenue</span>}
                                            sparkline={[10,12,9,14,18,16,20]}
                                        />
                                </div>
                                <div className="mt-6">
                                    <h2 className="px-1 text-sm font-medium text-muted-foreground">Branch Sales</h2>
                                    <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {branchSales.filter(b => b.id !== 1).map(b => (
                                            <SectionCard
                                                key={b.id}
                                                title={b.name}
                                                value={b.total}
                                                valueSuffix=" MMK"
                                                footer={<span>{b.count} sale{b.count !== 1 && 's'}</span>}
                                                sparkline={undefined}
                                            />
                                        ))}
                                    </div>
                                </div>
            </div>
        </AppLayout>
    );
}
