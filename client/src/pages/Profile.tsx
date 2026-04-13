import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { apiChangePassword, apiUpdateProfile } from "../api/users";

export default function Profile() {
  const { user, refreshMe, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const profileMutation = useMutation({
    mutationFn: apiUpdateProfile,
    onSuccess: async () => {
      await refreshMe();
      setMsg("Profile updated");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: apiChangePassword,
    onSuccess: async () => {
      setMsg("Password changed. Please login again.");
      await logout();
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Profile</div>
        <div className="text-sm text-slate-400">Manage your account.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-300">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-300">Email</div>
              <Input value={user?.email || ""} readOnly />
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-300">Avatar URL</div>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
            <div className="mt-1 text-xs text-slate-500">Tip: upload via “New ticket” attachments, then paste URL here.</div>
          </div>

          {msg ? <div className="text-sm text-green-300">{msg}</div> : null}
          {err ? <div className="text-sm text-red-300">{err}</div> : null}

          <Button
            variant="secondary"
            onClick={async () => {
              setMsg(null);
              setErr(null);
              try {
                await profileMutation.mutateAsync({ name, avatar });
              } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Failed to update profile");
              }
            }}
            disabled={profileMutation.isPending}
          >
            {profileMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-medium text-slate-300">Current password</div>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-300">New password</div>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={async () => {
              setMsg(null);
              setErr(null);
              try {
                await passwordMutation.mutateAsync({ currentPassword, newPassword });
              } catch (e: any) {
                setErr(e?.response?.data?.message || e?.message || "Failed to change password");
              }
            }}
            disabled={passwordMutation.isPending || !currentPassword || !newPassword}
          >
            {passwordMutation.isPending ? "Updating..." : "Change password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

