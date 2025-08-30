import { Head } from '@inertiajs/react';
export default function ProductInfo({ product }: any) {
    return (
        <div className={'flex flex-col rounded-md border border-gray-200 p-4'}>
            <Head title={product.name} />

            <h2 className={'text-lg font-semibold'}>{product.name}</h2>
            <p className={'text-gray-600'}>{product.description}</p>
            <p className={'font-bold text-gray-800'}>${product.price}</p>
            <p className={'text-gray-600'}>Category: {product.category.name}</p>
            <p className={'text-gray-600'}>Supplier: {product.supplier.name}</p>
            <p className={'text-gray-600'}>Branch: {product.branch.name}</p>
            <p className={'text-gray-600'}>Stock Quantity: {product.stock_quantity}</p>
        </div>
    );
}
