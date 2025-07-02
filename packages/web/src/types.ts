export type File = {
  name: string;
  lastModified: Date;
};

export type OldCustomer = {
  customerId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type NewCustomer = {
  customerId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOldCustomer = {
  customerId: string;
  name: string;
  email: string;
};

export type CreateNewCustomer = {
  customerId: string;
  name: string;
  email: string;
};

export type UpdateOldCustomer = {
  name?: string;
  email?: string;
};

export type UpdateNewCustomer = {
  name?: string;
  email?: string;
};
