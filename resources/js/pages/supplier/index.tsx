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
import { Head, useForm, usePage } from '@inertiajs/react';
import { set } from 'date-fns';

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

export default function SupplierIndex() {
    const { suppliers, branches } = usePage().props;
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <div className="flex flex-col p-4">
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
                <SupplierTable suppliers={suppliers} />
            </div>
        </AppLayout>
    );
}
