export interface IUserCreatedEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  address: null | string;
}
