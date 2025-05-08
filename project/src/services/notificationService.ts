import { toast } from 'sonner';

class NotificationService {
  private isPermissionGranted = false;

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      return this.isPermissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async subscribeToPushNotifications(): Promise<void> {
    if (!this.isPermissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        toast.error('Please enable notifications to receive expense reminders');
        return;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
      });

      // Send the subscription to your server
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      toast.success('Successfully subscribed to notifications!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to notifications');
    }
  }

  async unsubscribeFromPushNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        toast.success('Successfully unsubscribed from notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from notifications');
    }
  }
}

export const notificationService = new NotificationService(); 