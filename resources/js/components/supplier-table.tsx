import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from '@inertiajs/react';
import { Check, Pencil, Trash2, X } from 'lucide-react';

export function SupplierTable({ suppliers }: { suppliers: any }) {
    const { post, data, setData } = useForm({
        status: '',
    });
    function deleteSupplier(id: string) {
        post(`/suppliers/${id}`);
    }
    function updateStatus(id: string) {
        post(`/suppliers/update/${id}`, data);
    }
    const statuses = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
        { id: 'suspended', name: 'Suspended' },
    ];
    return (
        <div className="p-4">
            <div className="shadow-md">
                <Table>
                    <TableHeader className="">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contract Start Date</TableHead>
                            <TableHead>Contract End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier: any) => (
                            <TableRow key={supplier.id}>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell>{supplier.email}</TableCell>
                                <TableCell>{supplier.phone}</TableCell>
                                <TableCell>{supplier.address}</TableCell>
                                <TableCell>{supplier.contract_start_date}</TableCell>
                                <TableCell>{supplier.contract_end_date}</TableCell>
                                <TableCell>{supplier.status}</TableCell>
                                <TableCell>{supplier.branch.name}</TableCell>
                                <TableCell>
                                    <Button onClick={() => deleteSupplier(supplier.id)}>
                                        <Trash2 />
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="ml-2">
                                                <Pencil />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem key={status.id} value={status.id}>
                                                            {status.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="mt-2 flex justify-end gap-2">
                                                <Button onClick={() => updateStatus(supplier.id)}>
                                                    <Check />
                                                </Button>
                                                <Button variant="outline">
                                                    <X />
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
