import { ProductCard } from '@/components/product-card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

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
import { PackagePlus,BookPlus,Book } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Products', href: '/products' },
];

export default function ProductIndex() {
    const { products, categories, branches, suppliers } = usePage<ShareData>().props;
    const pageLinks = products.links.filter((link, index) => index !== 0 && index !== products.links.length - 1);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        branch_id: '',
        supplier_id: '',
        category_name: '',
        category_description: '',
    });
    function handleSubmit(e) {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                reset();
            },
        });
    }
    function handleCategoryAdd(e) {
        e.preventDefault();
        post(route('categories.store'),data);
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="m-2 flex gap-2 p-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            Add Product <PackagePlus />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Product</DialogTitle>
                            <DialogDescription>Add a new product to the inventory</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Product Name" />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Product Description"
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="Product Price"
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        placeholder="Stock Quantity"
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger id="category" className="w-full">
                                            <SelectValue placeholder="Select a category"   />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Select value={data.branch_id} onValueChange={(value) => setData('branch_id', value)}>
                                        <SelectTrigger id="branch" className="w-full">
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
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                        <SelectTrigger id="supplier" className="w-full">
                                            <SelectValue placeholder="Select a supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {suppliers.map((supplier) => (
                                                    <SelectItem key={supplier.id} value={supplier.id}>
                                                        {supplier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="submit">Save</Button>
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            Add Category <BookPlus />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                            <DialogDescription>Add a new Product category</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCategoryAdd}>
                            <div className="grid gap-4 py-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="category_name">Category Name</Label>
                                    <Input
                                        id="category_name"
                                        value={data.category_name}
                                        onChange={(e) => setData('category_name', e.target.value)}
                                        placeholder="Category Name"
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="category_description">Category Description</Label>
                                    <Input
                                        id="category_description"
                                        value={data.category_description}
                                        onChange={(e) => setData('category_description', e.target.value)}
                                        placeholder="Category Description"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="submit" disabled={(!data.category_name && !data.category_description) || processing}>
                                        Save
                                    </Button>
                                </DialogClose>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {products.data.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href={products.prev_page_url} disabled={!products.prev_page_url} asChild>
                            <a>Previous</a>
                        </PaginationPrevious>
                    </PaginationItem>
                    {pageLinks.map((link, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href={link.url}
                                isActive={link.active}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={link.active ? 'bg-primary text-primary-foreground' : ''}
                            />
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href={products.next_page_url} disabled={!products.next_page_url} asChild>
                            <a>Next</a>
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </AppLayout>
    );
}
