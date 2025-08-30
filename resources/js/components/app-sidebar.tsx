import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { BookOpen, Building2, ChartLine, Folder, LayoutGrid, PackageCheck, ReceiptText, Users, UsersRound } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<ShareData>().props;

    const mainNavItems: NavItem[] =
        auth.user?.role == '2'
            ? [
                  {
                      title: 'Dashboard',
                      href: '/dashboard',
                      icon: LayoutGrid,
                  },
                  {
                      title: 'Products',
                      href: '/products',
                      icon: PackageCheck,
                  },
                  {
                      title: 'Sales',
                      href: '/sales',
                      icon: ChartLine,
                  },
                  {
                      title: 'Users',
                      href: '/users',
                      icon: Users,
                  },
                  {
                      title: 'Suppliers',
                      href: '/suppliers',
                      icon: Building2,
                  },
                  {
                      title: 'Customer',
                      href: '/customers',
                      icon: UsersRound,
                  },
                  {
                      title: 'Invoices',
                      href: '/invoices',
                      icon: ReceiptText,
                  },
              ]
            : [
                  {
                      title: 'Products',
                      href: '/pos',
                      icon: PackageCheck,
                  },
                  {
                      title: 'Sales',
                      href: '/sales',
                      icon: ChartLine,
                  },
                  {
                      title: 'Customer',
                      href: '/customers',
                      icon: UsersRound,
                  },
                  {
                      title: 'Invoices',
                      href: '/invoices',
                      icon: ReceiptText,
                  },
              ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton disabled size="lg" asChild>
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
