<?php

namespace App\Http\Controllers;

use App\Models\StockNotification;
use Illuminate\Http\Request;

class StockNotificationController extends Controller
{
    public function markAsRead(Request $request, $id)
    {
        $notification = StockNotification::find($id);
        if ($notification) {
            $notification->is_read = true;
            $notification->save();

            return back()->with('message', 'Notification marked as read');
        }

        return back()->with('error', 'Notification not found');
    }

    public function delete(Request $request, $id)
    {
        $notification = StockNotification::find($id);
        if ($notification) {
            $notification->delete();

            return back()->with('message', 'Notification deleted');
        }

        return back()->with('error', 'Notification not found');
    }
}
