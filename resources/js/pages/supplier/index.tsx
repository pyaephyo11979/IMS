import { SupplierTable } from '@/components/supplier-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Suppliers',
        href: '/suppliers',
    },
];

interface Branch { id: number|string; name: string }
interface SupplierItem {
    id: number|string;
    name: string; email: string; phone: string; address: string;
    contract_start_date?: string|null; contract_end_date?: string|null;
    status: string; branch: Branch;
}
interface Paginated<T> {
    data: T[];
    total: number;
    prev_page_url: string|null;
    next_page_url: string|null;
    links: { url:string|null; label:string; active:boolean }[];
}
interface PageProps { suppliers: Paginated<SupplierItem>; branches: Branch[]; filters: { status?:string|null; branch?:string|null; q?:string|null } }

export default function SupplierIndex() {
    const { suppliers, branches, filters } = usePage().props as unknown as PageProps;
    const [localFilters, setLocalFilters] = useState({
        status: filters?.status || 'all',
        branch: filters?.branch || 'all',
        q: filters?.q || '',
    });
    const { data, post, setData, errors, processing } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        contract_start_date: '',
        contract_end_date: '',
        payment_terms: '',
        branch_id: '',
    });
    function handleSubmit(e) {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => {
                setData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    contract_start_date: '',
                    contract_end_date: '',
                    payment_terms: '',
                    branch_id: '',
                });
            },
        });
    }
    function applyFilters(partial?: Partial<typeof localFilters>) {
        const next = { ...localFilters, ...(partial || {}) };
        setLocalFilters(next);
        router.get('/suppliers', {
            status: next.status === 'all' ? undefined : next.status,
            branch: next.branch === 'all' ? undefined : next.branch,
            q: next.q || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') applyFilters();
    }

    const statuses = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <div className="flex flex-col p-4 gap-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="w-40">
                        <Label className="text-xs font-medium mb-1 block">Status</Label>
                        <Select value={localFilters.status} onValueChange={(v)=> applyFilters({ status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                        <Label className="text-xs font-medium mb-1 block">Branch</Label>
                        <Select value={localFilters.branch} onValueChange={(v)=> applyFilters({ branch: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {branches.map((b)=> <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Label className="text-xs font-medium mb-1 block">Search</Label>
                        <Input placeholder="Name / email / phone" value={localFilters.q} onChange={e=> setLocalFilters(f=> ({...f,q:e.target.value}))} onKeyDown={handleSearchKey} />
                    </div>
                    <Button variant="secondary" onClick={()=> applyFilters()}>Apply</Button>
                    <Button variant="outline" onClick={()=> { setLocalFilters({ status:'all', branch:'all', q:''}); applyFilters({ status:'all', branch:'all', q:''}); }}>Reset</Button>
                </div>
                <div className="mb-4 flex flex-row">
                    <form onSubmit={handleSubmit}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Add Supplier</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Supplier</DialogTitle>
                                    <DialogDescription>Fill in the details to create a new supplier.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input onChange={(e) => setData('name', e.target.value)} value={data.name} id="name" name="name" />
                                        {errors.name && <p className="text-red-500">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            id="email"
                                            name="email"
                                            type="email"
                                        />
                                        {errors.email && <p className="text-red-500">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            id="phone"
                                            name="phone"
                                            type="text"
                                        />
                                        {errors.phone && <p className="text-red-500">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <Label>Address</Label>
                                        <Input
                                            onChange={(e) => setData('address', e.target.value)}
                                            value={data.address}
                                            id="address"
                                            name="address"
                                        />
                                        {errors.address && <p className="text-red-500">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <Label> Contract Start Date</Label>
                                        <Input
                                            type="date"
                                            onChange={(e) => setData('contract_start_date', e.target.value)}
                                            value={data.contract_start_date}
                                        />
                                        {errors.contract_start_date && <p className="text-red-500">{errors.contract_start_date}</p>}
                                    </div>
                                    <div>
                                        <Label>Contract End Date</Label>
                                        <Input
                                            type="date"
                                            onChange={(e) => setData('contract_end_date', e.target.value)}
                                            value={data.contract_end_date}
                                        />
                                        {errors.contract_end_date && <p className="text-red-500">{errors.contract_end_date}</p>}
                                    </div>
                                    <div className="">
                                        <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {branches.map((branch) => (
                                                        <SelectItem key={branch.id} value={branch.id}>
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button onClick={handleSubmit} disabled={processing}>
                                            Create
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button variant="outline">Close</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </form>
                </div>
                <SupplierTable suppliers={suppliers.data || suppliers} />
                {suppliers?.links && (
                    <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
                        <p className="text-xs text-muted-foreground">Showing {suppliers.data.length} of {suppliers.total} suppliers</p>
                        <Pagination>
                            <PaginationContent>
                                {suppliers.prev_page_url && (
                                    <PaginationItem>
                                        <PaginationPrevious href={suppliers.prev_page_url} onClick={e=> { e.preventDefault(); router.get(suppliers.prev_page_url, {}, { preserveState:true, replace:true }); }} />
                                    </PaginationItem>
                                )}
                                {suppliers.links.filter((l)=> l.label !== 'Previous' && l.label !== 'Next').map((l,i)=> (
                                    <PaginationItem key={i}>
                                        {l.url ? (
                                            <PaginationLink href={l.url} isActive={l.active} onClick={e=> { e.preventDefault(); router.get(l.url, {}, { preserveState:true, replace:true }); }}>{l.label}</PaginationLink>
                                        ) : <span className="px-2 text-xs">...</span>}
                                    </PaginationItem>
                                ))}
                                {suppliers.next_page_url && (
                                    <PaginationItem>
                                        <PaginationNext href={suppliers.next_page_url} onClick={e=> { e.preventDefault(); router.get(suppliers.next_page_url, {}, { preserveState:true, replace:true }); }} />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
