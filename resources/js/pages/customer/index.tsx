import { CustomerTable } from '@/components/customer-table';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function CustomerIndex() {
    const { customers, auth } = usePage().props;
    const breadcrumbs: BreadcrumbItem[] = [
        ...(auth.user?.role == '2' ? [{ title: 'Dashboard', href: '/dashboard' }] : [{ title: 'Pos', href: '/pos' }]),
        {
            title: 'Customers',
            href: '/customers',
        },
    ];
    const { data, post, setData, errors, processing } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        branch_id: '',
    });
    let successMessage = null;
    function handleSubmit(e) {
        e.preventDefault();
        setData('branch_id', auth.user.branch_id);
        post('/customers', {
            onSuccess: () => {
                setData({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    branch_id: '',
                });
                successMessage = 'Customer created successfully.';
            },
        });
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-col p-4">
                {auth.user?.role == '1' && (
                    <div className="mb-4 flex flex-row">
                        <form onSubmit={handleSubmit}>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Add Customer</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Customer</DialogTitle>
                                        <DialogDescription>Fill in the details to create a new supplier.</DialogDescription>
                                        {successMessage && <p className="text-green-500">{successMessage}</p>}
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
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                id="address"
                                                name="address"
                                            />
                                            {errors.address && <p className="text-red-500">{errors.address}</p>}
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
                )}
                <CustomerTable customers={customers} />
            </div>
        </AppLayout>
    );
}
