export interface IUpdateUserEvent {
  id: string;
  data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: string[];
    address: null | string;
  };
}
