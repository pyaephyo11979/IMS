import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { DialogClose } from '@radix-ui/react-dialog';
import { CreditCardIcon, PackageOpenIcon, Trash2Icon } from 'lucide-react';

export function ProductCard({ product }: any) {
    const { auth } = usePage<SharedData>().props;
    const { post, errors, get } = useForm();
    const isAdmin = auth.user?.role == '2';
    function handleEdit(e) {
        e.preventDefault();
        post(route('products.update', product.id), {
            onSuccess: () => {
                // Handle success
            },
            onError: () => {
                // Handle error
            },
        });
    }
    function handleDelete(productId) {
        post(route('products.destroy', productId));
    }
    function handleMakeSale($pid: string) {
        get(route('sales.create', $pid));
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
                                        <div>
                                            <p>Price: {product.price} MMK</p>
                                            <p>Stock: {product.stock_quantity}</p>
                                            <p>Category: {product.category.name}</p>
                                            <p>Supplier: {product.supplier.name}</p>
                                            <p>Branch: {product.branch.name}</p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={() => handleDelete(product.id)}>
                                            Delete <Trash2Icon />
                                        </Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
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
