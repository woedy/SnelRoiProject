import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService, User } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, UserPlus } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    is_staff: false,
    is_active: true,
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    password: "",
    is_staff: false,
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateChange = (key: keyof typeof createForm, value: string | boolean) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditChange = (key: keyof typeof editForm, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await userService.create(createForm);
      setCreateForm({ full_name: "", email: "", password: "", is_staff: false, is_active: true });
      setShowCreateForm(false);
      await fetchUsers();
    } catch (error) {
      setErrorMessage("Unable to create user. Please check the details and try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const payload: Record<string, unknown> = {
        full_name: editForm.full_name,
        email: editForm.email,
        is_staff: editForm.is_staff,
        is_active: editForm.is_active,
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      await userService.update(editingUser.id.toString(), payload);
      setEditingUser(null);
      setEditForm({ full_name: "", email: "", password: "", is_staff: false, is_active: true });
      await fetchUsers();
    } catch (error) {
      setErrorMessage("Unable to update user. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name ?? "",
      email: user.email,
      password: "",
      is_staff: user.is_staff,
      is_active: user.is_active,
    });
    setShowCreateForm(false);
  };

  const handleDelete = async (userId: number) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await userService.delete(userId.toString());
      await fetchUsers();
    } catch (error) {
      setErrorMessage("Unable to delete user. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Users</h2>
          <p className="text-muted-foreground">Manage system users and their roles.</p>
        </div>
        <Button onClick={() => setShowCreateForm((prev) => !prev)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {showCreateForm ? "Close" : "New User"}
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {showCreateForm && (
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle>Create User</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
              <div className="space-y-2">
                <Label htmlFor="create-full-name">Full name</Label>
                <Input
                  id="create-full-name"
                  value={createForm.full_name}
                  onChange={(event) => handleCreateChange("full_name", event.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) => handleCreateChange("email", event.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Temporary password</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) => handleCreateChange("password", event.target.value)}
                  placeholder="Set a password"
                  required
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.is_staff}
                    onChange={(event) => handleCreateChange("is_staff", event.target.checked)}
                  />
                  Admin access
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(event) => handleCreateChange("is_active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create user
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editingUser && (
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Edit User</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <Label htmlFor="edit-full-name">Full name</Label>
                <Input
                  id="edit-full-name"
                  value={editForm.full_name}
                  onChange={(event) => handleEditChange("full_name", event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => handleEditChange("email", event.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Reset password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(event) => handleEditChange("password", event.target.value)}
                  placeholder="Leave blank to keep"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.is_staff}
                    onChange={(event) => handleEditChange("is_staff", event.target.checked)}
                  />
                  Admin access
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(event) => handleEditChange("is_active", event.target.checked)}
                  />
                  Active
                </label>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || <span className="text-muted-foreground italic">Not set</span>}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      user.is_active 
                        ? 'bg-green-500/10 text-green-500 ring-green-500/20' 
                        : 'bg-red-500/10 text-red-500 ring-red-500/20'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{user.is_staff ? 'Admin' : 'Customer'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() => handleEditClick(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user.id)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
