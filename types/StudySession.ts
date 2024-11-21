export type StudySession = {
  created_at: string | number | Date;
  id: string;
  date: Date;
  subject: string;
  duration: number;
  note: string | null;
  user_id?: string;
};
