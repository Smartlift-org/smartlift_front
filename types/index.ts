export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserHome: undefined;
  CoachHome: undefined;
  BasicProfile: undefined;
  StatsProfile: { fromRedirect?: boolean };
};

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'coach';
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'user' | 'coach';
}
