import { apiRequest } from "@/lib/api";

export interface OutgoingEmailListItem {
  id: number;
  created_at: string;
  sent_at: string | null;
  status: "PENDING" | "SENT" | "FAILED";
  from_email: string;
  to_emails: string;
  subject: string;
  backend: string;
  attachment_count: number;
}

export interface OutgoingEmailAttachment {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  file_url: string | null;
  created_at: string;
}

export interface OutgoingEmailDetail {
  id: number;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  status: "PENDING" | "SENT" | "FAILED";
  error_message: string;
  backend: string;
  from_email: string;
  to_emails: string;
  cc_emails: string;
  bcc_emails: string;
  reply_to: string;
  subject: string;
  text_body: string;
  html_body: string;
  attachments: OutgoingEmailAttachment[];
}

export const emailService = {
  getAll: async (params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : "";
    return apiRequest<OutgoingEmailListItem[]>(`/admin/emails/${queryString}`);
  },
  getById: async (id: number) => {
    return apiRequest<OutgoingEmailDetail>(`/admin/emails/${id}/`);
  },
};
