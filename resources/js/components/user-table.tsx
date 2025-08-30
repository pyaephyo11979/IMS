import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

export function UserTable({ users }: { users: any }) {
    const { post } = useForm();
    function roleName($role) {
        switch ($role) {
            case '1':
                return 'Cashier';
            case '2':
                return 'Admin';
            default:
                return 'Cashier';
        }
    }
    function deleteUser(id: string) {
        post(`/users/delete/${id}`);
    }
    return (
        <div className="p-4">
            <div className="shadow-md">
                <Table>
                    <TableHeader className="">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{roleName(user.role)}</TableCell>
                                <TableCell>{user.branch.name}</TableCell>
                                <TableCell>
                                    <Button onClick={() => deleteUser(user.id)}>
                                        <Trash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
