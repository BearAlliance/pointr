export interface Participant {
  id: string;
  name: string;
  vote: number | null;
  observer: boolean;
}

export interface Session {
  id: string;
  participants: Map<string, Participant>;
  revealed: boolean;
}

export const sessions = new Map<string, Session>();
