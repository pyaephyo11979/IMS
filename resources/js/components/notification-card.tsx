import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from '@inertiajs/react';
import { BellRing, Mail, MailOpen, Trash } from 'lucide-react';
export function NotificationCard({ notifications }: { notifications: any }) {
    const { post } = useForm();
    const unreadNotifications = notifications.filter((n: unknown) => !n.is_read);

    function handleRead(e: React.FormEvent, id: string) {
        e.preventDefault();
        post(route('notifications.read', id));
    }

    function handleDelete(e: React.FormEvent, id: string) {
        e.preventDefault();
        post(route('notifications.delete', id));
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    Notifications <BellRing className="inline-block h-4 w-4" />
                </CardTitle>
                <CardDescription>You have {unreadNotifications.length} new notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Message</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.map((notification: any) => (
                                <TableRow key={notification.id}>
                                    <TableCell>{notification.message}</TableCell>
                                    <TableCell>{notification.is_read ? 'Read' : 'Unread'}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={(e) => handleRead(e, notification.id)}
                                            size="icon"
                                            disabled={notification.is_read}
                                        >
                                            {notification.is_read ? <MailOpen /> : <Mail />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => handleDelete(e, notification.id)}
                                            size="icon"
                                            className="text-red-500"
                                        >
                                            <Trash />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
