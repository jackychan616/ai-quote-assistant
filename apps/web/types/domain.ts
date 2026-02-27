export type LeadStatus = 'new' | 'qualified' | 'quoted' | 'won' | 'lost';

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  ownerUserId?: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  leadId: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  versionNo: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil?: string;
  aiSummary?: string;
  createdByUserId?: string;
  createdAt: string;
}

export interface Followup {
  id: string;
  leadId: string;
  quoteId?: string;
  dueAt: string;
  channel: 'email' | 'phone' | 'whatsapp' | 'line' | 'other';
  status: 'pending' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  messageDraft?: string;
  outcomeNote?: string;
  createdByUserId?: string;
  completedAt?: string;
  createdAt: string;
}
