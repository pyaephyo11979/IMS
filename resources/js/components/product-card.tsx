import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, usePage } from '@inertiajs/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { CreditCardIcon, PackageOpenIcon, Trash2Icon } from 'lucide-react';

type BranchLite = { id: number | string; name: string };
type CategoryLite = { id: number | string; name: string };
type SupplierLite = { id: number | string; name: string };
type ProductLite = {
    id: number | string;
    name: string;
    price: number | string;
    description: string;
    stock_quantity: number;
    category: CategoryLite;
    supplier: SupplierLite;
    branch: BranchLite;
};
type PageProps = {
    auth: { user?: { role?: string | number } };
    branches?: BranchLite[];
};

export function ProductCard({ product }: { product: ProductLite }) {
    const { auth, branches = [] } = usePage<PageProps>().props;
    const { post, get, processing } = useForm();
    const isAdmin = auth.user?.role == '2';

    function handleDelete(productId: ProductLite['id']) {
        post(route('products.destroy', productId));
    }
    function handleMakeSale(pid: ProductLite['id']) {
        get(route('sales.create', pid));
    }

    // Local handlers for updating branch and stock
    function submitBranchUpdate(newBranchId: string) {
        if (!newBranchId) return;
        // Send branch_id as query string
        post(route('products.updateBranch', product.id) + `?branch_id=${encodeURIComponent(newBranchId)}`,  {
            preserveScroll: true,
        });
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{product.price} MMK</CardDescription>
                <CardDescription>{product.description.slice(0, 20)}...</CardDescription>
            </CardContent>
            <CardFooter>
                <CardAction>
                    {isAdmin ? (
                        <div className="flex flex-2 gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        View <PackageOpenIcon />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{product.name}</DialogTitle>
                                        <DialogDescription>{product.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-1">
                                            <p>Price: {product.price} MMK</p>
                                            <p>Category: {product.category.name}</p>
                                            <p>Supplier: {product.supplier.name}</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs">Stock Quantity</Label>
                                            <div className="flex items-center gap-2">
                                                <span>{product.stock_quantity}</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs">Branch</Label>
                                            <Select value={String(product.branch.id)} onValueChange={(v) => submitBranchUpdate(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branches.map((b) => (
                                                        <SelectItem key={b.id} value={String(b.id)}>
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => handleDelete(product.id)}>
                                            Delete <Trash2Icon />
                                        </Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="flex flex-2 gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        View <PackageOpenIcon />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{product.name}</DialogTitle>
                                        <DialogDescription>{product.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div>
                                            <p>Price: {product.price} MMK</p>
                                            <p>Stock: {product.stock_quantity}</p>
                                            <p>Category: {product.category.name}</p>
                                            <p>Supplier: {product.supplier.name}</p>
                                            <p>Branch: {product.branch.name}</p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => handleMakeSale(product.id)}>
                                            Make Sale <CreditCardIcon />
                                        </Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardAction>
            </CardFooter>
        </Card>
    );
}
