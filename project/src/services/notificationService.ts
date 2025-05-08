import { toast } from 'sonner';

const NOTIFICATION_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

interface NotificationAction {
  action: string;
  title: string;
}

interface NotificationEvent extends Event {
  action: string;
}

class NotificationService {
  private notificationTimer: number | null = null;
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

  async scheduleReminder(): Promise<void> {
    if (!this.isPermissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        toast.error('Please enable notifications to receive expense reminders');
        return;
      }
    }

    // Clear any existing timer
    if (this.notificationTimer) {
      window.clearInterval(this.notificationTimer);
    }

    // Schedule new reminder
    this.notificationTimer = window.setInterval(() => {
      this.showReminder();
    }, NOTIFICATION_INTERVAL);

    // Show initial reminder
    this.showReminder();
  }

  private showReminder(): void {
    if (!this.isPermissionGranted) return;

    const notification = new Notification('AH Expenses Reminder', {
      body: 'Don\'t forget to track your expenses! Tap to open the app.',
      icon: '/android-launchericon-192-192.png',
      badge: '/android-launchericon-48-48.png',
      tag: 'expense-reminder',
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to the expense page
      window.location.href = '/expense/new';
    };
  }

  stopReminder(): void {
    if (this.notificationTimer) {
      window.clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
  }
}

export const notificationService = new NotificationService(); 