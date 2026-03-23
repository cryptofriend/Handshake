import { User } from '@/types/agreement';

export interface Contact {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

// Mock contacts list (simulating Telegram contacts)
export const MOCK_CONTACTS: Contact[] = [
  { id: '2', name: 'John', username: 'john_designer' },
  { id: '3', name: 'Alice', username: 'alice_dev' },
  { id: '4', name: 'Mike', username: 'mike_pm' },
  { id: '5', name: 'Sarah', username: 'sarah_writer' },
  { id: '6', name: 'David', username: 'david_ceo' },
  { id: '7', name: 'Emma', username: 'emma_marketing' },
  { id: '8', name: 'James', username: 'james_ops' },
  { id: '9', name: 'Olivia', username: 'olivia_finance' },
];
