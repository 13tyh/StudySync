export type StudySession = {
  id: string;
  date: Date;
  subject: string;
  duration: number;
  note: string | null;
  user_id?: string;
};
