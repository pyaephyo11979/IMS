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
import { UserTable } from '@/components/user-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';

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

interface BranchListItem {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    products_count?: number;
    sales_count?: number;
    address?: string;
    contact_number?: string;
}
interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    branch: { id: number; name: string };
}

export default function UserIndex() {
    const { users, branches } = usePage<{ users: { data: UserRecord[] }; branches: BranchListItem[] }>().props;
    const userForm = useForm<{ name: string; email: string; password: string; role: string; branch_id: string }>({
        name: '',
        email: '',
        password: '',
        role: '',
        branch_id: '',
    });

    function submitUser(e: React.FormEvent) {
        e.preventDefault();
        userForm.post('/users', { preserveScroll: true, onSuccess: () => userForm.reset() });
    }

    const roles = [
        { id: '1', name: 'Cashier' },
        { id: '2', name: 'Admin' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-col p-4">
                <div className="mb-4 flex flex-row flex-wrap gap-4">
                    <form onSubmit={submitUser}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Add User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add User</DialogTitle>
                                    <DialogDescription>Create a new system user.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label htmlFor="u_name">Name</Label>
                                        <Input id="u_name" value={userForm.data.name} onChange={(e) => userForm.setData('name', e.target.value)} />
                                        {userForm.errors.name && <p className="text-xs text-red-500">{userForm.errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="u_email">Email</Label>
                                        <Input
                                            id="u_email"
                                            type="email"
                                            value={userForm.data.email}
                                            onChange={(e) => userForm.setData('email', e.target.value)}
                                        />
                                        {userForm.errors.email && <p className="text-xs text-red-500">{userForm.errors.email}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="u_pass">Password</Label>
                                        <Input
                                            id="u_pass"
                                            type="password"
                                            value={userForm.data.password}
                                            onChange={(e) => userForm.setData('password', e.target.value)}
                                        />
                                        {userForm.errors.password && <p className="text-xs text-red-500">{userForm.errors.password}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={userForm.data.role} onValueChange={(v) => userForm.setData('role', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {roles.map((r) => (
                                                        <SelectItem key={r.id} value={r.id}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Select value={userForm.data.branch_id} onValueChange={(v) => userForm.setData('branch_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {branches.map((b) => (
                                                        <SelectItem key={b.id} value={b.id}>
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button disabled={userForm.processing}>Create</Button>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </form>
                    <ManageBranchesDialog branches={branches} />
                </div>
                <UserTable users={users} />
            </div>
        </AppLayout>
    );
}

function ManageBranchesDialog({ branches }: { branches: BranchListItem[] }) {
    const createForm = useForm<{ name: string; address: string; contact_number: string; status: 'active' | 'inactive' }>({
        name: '',
        address: '',
        contact_number: '',
        status: 'active',
    });

    function submitNew(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/branches', { preserveScroll: true, onSuccess: () => createForm.reset() });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Manage Branches</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Branch Management</DialogTitle>
                    <DialogDescription>Toggle status, delete unused branches, create new.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <form onSubmit={submitNew} className="grid grid-cols-5 items-end gap-2 text-xs">
                        <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input value={createForm.data.address} onChange={(e) => createForm.setData('address', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">Contact</Label>
                            <Input value={createForm.data.contact_number} onChange={(e) => createForm.setData('contact_number', e.target.value)} />
                        </div>
                        <div>
                            <Label className="text-xs">Status</Label>
                            <Select value={createForm.data.status} onValueChange={(v) => createForm.setData('status', v as 'active' | 'inactive')}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-5 flex justify-end">
                            <Button size="sm" disabled={createForm.processing}>
                                Create
                            </Button>
                        </div>
                        {Object.values(createForm.errors).length > 0 && (
                            <div className="col-span-5 text-xs text-red-600">{Object.values(createForm.errors).join(', ')}</div>
                        )}
                    </form>
                    <div className="max-h-72 overflow-auto border border-black">
                        <table className="w-full text-xs">
                            <thead className="border-b border-black bg-black text-white">
                                <tr>
                                    <th className="px-2 py-1 text-left">Name</th>
                                    <th className="px-2 py-1 text-left">Status</th>
                                    <th className="px-2 py-1">P</th>
                                    <th className="px-2 py-1">S</th>
                                    <th className="px-2 py-1">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches.map((b) => (
                                    <BranchRow key={b.id} branch={b} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BranchRow({ branch }: { branch: BranchListItem }) {
    const statusForm = useForm<{ status: 'active' | 'inactive' }>({ status: branch.status });
    const deleteForm = useForm();
    const locked = (branch.products_count ?? 0) > 0 || (branch.sales_count ?? 0) > 0;

    function toggle() {
        const ns = statusForm.data.status === 'active' ? 'inactive' : 'active';
        statusForm.setData('status', ns);
        router.post(`/branches/status/${branch.id}`, { status: ns }, { preserveScroll: true });
    }
    function remove() {
        if (locked) return;
        if (confirm(`Delete branch ${branch.name}?`)) {
            deleteForm.post(`/branches/delete/${branch.id}`, { preserveScroll: true });
        }
    }
    return (
        <tr className="border-b border-black last:border-0">
            <td className="px-2 py-1">{branch.name}</td>
            <td className="px-2 py-1">
                <button
                    onClick={toggle}
                    disabled={statusForm.processing || deleteForm.processing}
                    className={`rounded border border-black px-2 py-0.5 ${statusForm.data.status === 'active' ? 'bg-white' : 'bg-black text-white'} text-[10px]`}
                >
                    {statusForm.data.status}
                </button>
            </td>
            <td className="px-2 py-1 text-center">{branch.products_count ?? 0}</td>
            <td className="px-2 py-1 text-center">{branch.sales_count ?? 0}</td>
            <td className="px-2 py-1 text-center">
                <button
                    onClick={remove}
                    disabled={locked || statusForm.processing || deleteForm.processing}
                    className={`rounded border border-black px-2 py-0.5 text-[10px] ${locked ? 'cursor-not-allowed opacity-40' : 'bg-white'}`}
                    title={locked ? 'Has products or sales' : 'Delete'}
                >
                    Del
                </button>
            </td>
        </tr>
    );
}
