import { useState } from "react";
import { Search, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsersList } from "../../hooks/useAdminUsersList";
import { useAdminUserSearch } from "../../hooks/useAdminUserSearch";
import { useGrantAdminRole, useRevokeAdminRole } from "../../hooks/useAdminRoleMutations";

const ManageAdminsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: admins, isLoading: isLoadingAdmins } = useAdminUsersList();
  const { data: results, isLoading: isSearching } = useAdminUserSearch(search);
  const grantAdmin = useGrantAdminRole();
  const revokeAdmin = useRevokeAdminRole();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Manage Admins</h1>
        <p className="text-sm text-muted-foreground">
          Grant or revoke admin dashboard access. Only super admins can manage this list.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {search.trim().length > 0 && (
          <div className="rounded-md border border-border">
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
      </div>

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
