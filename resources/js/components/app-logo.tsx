import { PackageIcon } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary">
                <PackageIcon size={44} />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 text-3xl leading-tight font-semibold">
                    I<br />M<br />S
                </span>
            </div>
        </>
    );
}
