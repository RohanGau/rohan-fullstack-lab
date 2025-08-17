export type SlotStatus = 'booked' | 'cancelled';

export interface ISlotBase {
  name: string;
  email: string;
  date: Date;
  duration: number;
  message?: string;
  status: SlotStatus;
}

export interface ISlotDb extends ISlotBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface ISlotDto extends ISlotBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
