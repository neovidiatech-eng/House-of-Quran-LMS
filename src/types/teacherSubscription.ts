export interface TeacherSubscriptionRequest {
  id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  codeCountry?: string;
  code_country?: string;
  gender?: string;
  country?: string;
  nationality?: string;
  city?: string;
  age?: number | string;
  createdAt: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    code_country?: string;
    country?: string;
    city?: string;
    age?: number;
    nationality?: string;
    createdAt?: string;
  };


}

export interface ApproveTeacherRequestBody {
  currency_id: string;
  hour_price: string | number;
  subject_ids: string[];
  meeting_link?: string;
}
