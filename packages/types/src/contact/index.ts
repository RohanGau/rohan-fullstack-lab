export interface IContactBase {
  name: string;
  email: string;
  message: string;
}

export interface IContactDb extends IContactBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactDto extends IContactBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}