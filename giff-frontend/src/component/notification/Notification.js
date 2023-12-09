import { NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './Notification.scss';

export const showNotification = (type, message) => {
    switch (type) {
      case 'success':
        NotificationManager.success(message, 'Success', 4000);
        break;
      case 'error':
        NotificationManager.error(message, 'Error', 4000);
        break;
      case 'info':
        NotificationManager.info(message, 'Info', 4000);
        break;
      default:
        NotificationManager.warning(message, 'Warning', 4000);
    }
  };