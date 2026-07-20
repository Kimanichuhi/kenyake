import { useState } from "react";
import { Check, Copy, Search, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsersList } from "../../hooks/useAdminUsersList";
import { useAdminUserSearch } from "../../hooks/useAdminUserSearch";
import { useGrantAdminRole, useRevokeAdminRole } from "../../hooks/useAdminRoleMutations";
import { useCreateAdminInvite, AdminInvite } from "../../hooks/useCreateAdminInvite";

const ManageAdminsPage = () => {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invite, setInvite] = useState<AdminInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: admins, isLoading: isLoadingAdmins } = useAdminUsersList();
  const { data: results, isLoading: isSearching } = useAdminUserSearch(search);
  const grantAdmin = useGrantAdminRole();
  const revokeAdmin = useRevokeAdminRole();
  const createInvite = useCreateAdminInvite();

  const resetAddDialog = () => {
    setSearch("");
    setInviteEmail("");
    setInvite(null);
    setCopied(false);
  };

  const inviteLink = invite ? `${window.location.origin}/admin-signup?token=${invite.token}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Manage Admins</h1>
          <p className="text-sm text-muted-foreground">
            Grant or revoke admin dashboard access. Only super admins can manage this list.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
            <DialogDescription>
              Grant access to an existing user, or invite someone new by email.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="existing">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing user</TabsTrigger>
              <TabsTrigger value="invite">Invite by email</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search users by email or name..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search.trim().length > 0 && (
                <div className="max-h-80 overflow-y-auto rounded-md border border-border">
                  {isSearching ? (
                    <p className="p-4 text-sm text-muted-foreground">Searching...</p>
                  ) : results && results.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {results.map((r) => (
                        <li key={r.user_id} className="flex items-center justify-between gap-3 p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{r.full_name || "Unnamed user"}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                          </div>
                          {r.is_super_admin ? (
                            <Badge variant="outline">Super admin</Badge>
                          ) : r.is_admin ? (
                            <Badge variant="secondary">Already admin</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={grantAdmin.isPending}
                              onClick={() => grantAdmin.mutate({ userId: r.user_id })}
                            >
                              <UserPlus className="mr-1 h-4 w-4" />
                              Grant admin
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground">No users match this search.</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invite" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                They don't need an account yet. Generate a one-time signup link and send it to them yourself — it
                expires in 10 minutes.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="their.email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  disabled={!inviteEmail.trim() || createInvite.isPending}
                  onClick={() =>
                    createInvite.mutate(
                      { email: inviteEmail.trim() },
                      { onSuccess: (data) => setInvite(data) },
                    )
                  }
                >
                  Generate Link
                </Button>
              </div>

              {invite && (
                <div className="space-y-1.5 rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} className="text-xs" />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Expires in 10 minutes.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Current Admins</h2>
        <div className="rounded-md border border-border">
          {isLoadingAdmins ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : admins && admins.length > 0 ? (
            <ul className="divide-y divide-border">
              {admins.map((a) => {
                const isSelf = a.user_id === user?.id;
                return (
                  <li key={a.user_id} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.full_name || "Unnamed user"}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.email} · Admin since {formatDistanceToNow(new Date(a.granted_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.is_super_admin && (
                        <Badge variant="outline">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Super admin
                        </Badge>
                      )}
                      {!a.is_super_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf || revokeAdmin.isPending}
                          onClick={() => revokeAdmin.mutate({ userId: a.user_id })}
                        >
                          <UserMinus className="mr-1 h-4 w-4" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No admins yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAdminsPage;
