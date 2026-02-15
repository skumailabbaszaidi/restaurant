"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Role } from "@/lib/adminTypes";

export default function TeamPage() {
  const teamMembers = useAdminStore((state) => state.teamMembers);
  const inviteMember = useAdminStore((state) => state.inviteMember);
  const removeMember = useAdminStore((state) => state.removeMember);
  const currentUser = useAdminStore((state) => state.currentUser);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("member");

  const handleInvite = () => {
    if (!newName || !newEmail) return;
    inviteMember(newName, newEmail, newRole);
    setIsInviteOpen(false);
    toast.success("Invitation sent", {
        description: `${newName} has been invited as a ${newRole}.`
    });
    setNewName("");
    setNewEmail("");
    setNewRole("member");
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
        removeMember(id);
        toast.success("Team member removed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-gray-500">Manage who has access to your restaurant dashboard.</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Mail className="mr-2 h-4 w-4" /> Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite New Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your organization.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newRole} onValueChange={(val: Role) => setNewRole(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                <SelectItem value="member">Member (Orders & Menu)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} className="bg-orange-600 hover:bg-orange-700">Send Invitation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
            <Card key={member.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {member.role === 'admin' ? 
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Shield className="w-3 h-3 mr-1" /> Admin</Badge> 
                            : 
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><User className="w-3 h-3 mr-1" /> Member</Badge>
                        }
                    </CardTitle>
                    {currentUser?.id !== member.id && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleRemove(member.id, member.name)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-bold leading-none">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <Badge variant="secondary" className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {member.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
