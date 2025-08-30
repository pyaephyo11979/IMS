import { ProductCard } from '@/components/product-card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Point of Sale', href: '/pos' }];

export default function PosIndex() {
    const { products } = usePage<ShareData>().props;
    const pageLinks = products.links.filter((link, index) => index !== 0 && index !== products.links.length - 1);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point of Sale" />
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
