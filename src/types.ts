export interface User {
  uid: string;
  projectId: number;
  email: string;
  displayName: string;
  photoURL: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  occupation?: string;
  address: string;
  division: string;
  district: string;
  upazilla: string;
  mobile: string;
  isVerified: boolean;
  isAvailable: boolean;
  isActive: boolean;
  donationCount: number;
  lastDonatedAt?: number;
  joinedAt: number;
  work?: string;
  details?: string;
  isDonor: boolean;
  verificationDoc?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'Identity Verification' | 'Blood Donation Document';
  documentUrl: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  media: { type: 'image' | 'iframe', url: string }[];
  likes: number;
  authorId: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  name: string;
  text: string;
  likes: number;
  replies?: Comment[];
  createdAt: number;
}

export interface Sponsor {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  type: 'image' | 'iframe';
}

export interface PushedAd {
  id: string;
  title?: string;
  subtitle?: string;
  mediaUrl: string;
  link?: string;
  durationInDays: number;
  createdAt: number;
}

export interface Thought {
  id: string;
  email: string;
  description: string;
  createdAt: number;
}

export interface AdminActivity {
  id: string;
  action: string;
  summary: string;
  timestamp: number;
}
