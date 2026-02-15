export type Role = 'admin' | 'member';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string; // This corresponds to the restaurant slug
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'invited';
  organizationId: string;
};

export type AdminState = {
  currentUser: User | null;
  currentOrganization: Organization | null;
  orders: any[]; // We'll reuse/extend Order type
  menuItems: any[]; // We'll reuse MenuItem type
  teamMembers: TeamMember[];
  
  // Actions
  login: (email: string) => boolean;
  logout: () => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  updateMenuItem: (item: any) => void;
  inviteMember: (email: string, role: Role) => void;
  removeMember: (id: string) => void;
};
