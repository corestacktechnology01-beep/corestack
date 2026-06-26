export type UserRole = 'user' | 'admin';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
export type PostStatus = 'draft' | 'published' | 'scheduled';
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  image_url: string | null;
  features: string[];
  price_monthly: number | null;
  price_yearly: number | null;
  demo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_position: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  avatar_url: string | null;
  review_text: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  client_id: string | null;
  category_id: string | null;
  status: ProjectStatus;
  image_url: string | null;
  tags: string[] | null;
  technologies: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
  results: string | null;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  salary_range: string | null;
  is_active: boolean;
  is_internship: boolean;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  career_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_url: string | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[] | null;
  status: PostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  logo_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  cta_label: string | null;
  sort_order: number;
  created_at: string;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: string;
  group_name: string | null;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  created_at: string;
}
