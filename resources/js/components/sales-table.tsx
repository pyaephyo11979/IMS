import { Table,TableBody,TableCell,TableCaption,TableFooter,TableHeader,TableHead,TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { usePage,useForm, router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";
import { Select,SelectContent,SelectItem,SelectGroup,SelectTrigger,SelectValue } from "./ui/select";
import React from 'react';

interface SaleRecord {
  id: number;
  product: { name: string };
  customer_name: string;
  quantity: number;
  status: 'pending' | 'paid' | 'canceled';
  total_amount: number;
  branch?: { name: string };
  created_at: string;
}
interface AuthUser { role: string }
// Extend index signature to satisfy Inertia's PageProps constraint
interface PageProps extends Record<string, unknown> { auth: { user: AuthUser }; }

export function SaleTable({sales}:{sales: SaleRecord[]}){
    const {auth} = usePage<PageProps>().props as PageProps;
    const {post} = useForm(); // reuse for delete only

    function updateStatus(id: number, status: string){
        router.post(route('sales.update', id), { status }, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function handleDelete(id: number){
        post(route('sales.destroy', id), {
            onSuccess: () => {
                // Handle successful deletion (e.g., show a notification)
            },
            onError: () => {
                // Handle error (e.g., show an error message)
            }
        });
    }
    return(
        <div className="flex">
            <Table>
                <TableCaption>List of sales</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Price</TableHead>
                        {auth.user.role == '2' && <TableHead>Branch</TableHead>}
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map((sale: SaleRecord) => (
                        <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.id}</TableCell>
                            <TableCell>{sale.product.name}</TableCell>
                            <TableCell>{sale.customer_name}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            {auth.user.role == '2' && <TableCell>{sale.status}</TableCell>}
                            {auth.user.role == '1' && (
                                <TableCell>
                                    <Select defaultValue={sale.status} onValueChange={(val)=> updateStatus(sale.id, val)}>
                                        <SelectTrigger size="sm" className="w-28">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="canceled">Canceled</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            )}
                            <TableCell>{sale.total_amount} MMK</TableCell>
                            {auth.user.role == '2' && <TableCell>{sale.branch?.name}</TableCell>}
                            <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button variant="destructive" onClick={() => handleDelete(sale.id)} size="icon"><Trash2/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5}>
                            Total Sales: {sales.length}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
