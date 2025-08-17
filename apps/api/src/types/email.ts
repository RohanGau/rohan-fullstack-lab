export interface SlotNotificationFields {
  name: string;
  email: string;
  date: Date | string;
  duration: number;
  message?: string;
}

export type UserNotificationType = 'updated' | 'deleted' | 'created' | string;

export interface SlotUserNotificationFields {
  email: string;
  date?: Date | string;
  duration?: number;
  type?: UserNotificationType;
  status?: string;
  message?: string;
}

