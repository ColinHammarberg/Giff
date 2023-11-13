import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './Notification.scss';

export const showNotification = (type, message) => {
    switch (type) {
      case 'success':
        NotificationManager.success(message, 'Success', 2000);
        break;
      case 'error':
        NotificationManager.error(message, 'Error', 2000);
        break;
      case 'info':
        NotificationManager.info(message, 'Info', 2000);
        break;
      default:
        NotificationManager.warning(message, 'Warning', 2000);
    }
  };