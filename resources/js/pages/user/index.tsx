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
import {Textarea} from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserTable } from '@/components/user-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UserIndex() {
    const { users, branches } = usePage().props;
    const { data, post, setData, errors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
        branch_id: '',
    });
    function handleSubmit(e) {
        e.preventDefault();
        post('/users', data);
    }
    const roles = [
        { id: '1', name: 'Cashier' },
        { id: '2', name: 'Admin' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-col p-4">
                <div className="mb-4 flex flex-row">
                    <form onSubmit={handleSubmit}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Add User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add User</DialogTitle>
                                    <DialogDescription>Fill in the details to create a new user.</DialogDescription>
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
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            id="password"
                                            name="password"
                                            type="password"
                                        />
                                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                                    </div>
                                    <div className="flex flex-2 gap-2">
                                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
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
                                    <Button onClick={handleSubmit} disabled={processing}>
                                        Create
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </form>
                </div>
                <UserTable users={users} />
            </div>
        </AppLayout>
    );
}
