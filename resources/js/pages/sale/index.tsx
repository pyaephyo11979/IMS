import { SaleTable } from "@/components/sales-table";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage,Link } from '@inertiajs/react';

export default function SaleIndex() {
        const { sales,auth } = usePage().props;

const breadcrumbs: BreadcrumbItem[] = [
    ...(auth.user?.role == '2' ? [{ title: 'Dashboard', href: '/dashboard' }] : [{ title: 'Pos', href: '/pos' }]),
    { title: 'Sales', href: '/sales' },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales" />
            <SaleTable sales={sales} />
        </AppLayout>
    );
}
