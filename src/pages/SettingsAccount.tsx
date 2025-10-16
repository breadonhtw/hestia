import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsAccount = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: async () => {
      // For now, we'll just sign out the user
      // In a future update, we can add a deactivated field to the profiles table
      // and implement proper account deactivation/reactivation logic
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Account</h2>
        <p className="text-muted-foreground">
          See information about your account, download an archive of your data,
          or learn about your account deactivation options
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account information</CardTitle>
              <CardDescription>
                See your account information like your phone number and email
                address.
              </CardDescription>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Username</Label>
            <p className="text-lg">{profile?.username || "Not set"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Email</Label>
            <p className="text-lg">{user?.email || "Not set"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Phone</Label>
            <p className="text-lg">{user?.phone || "Not set"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Change your password</CardTitle>
              <CardDescription>
                Change your password at any time.
              </CardDescription>
            </div>
            {!isChangingPassword && (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                Change password
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Deactivate Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-destructive">
                Deactivate your account
              </CardTitle>
              <CardDescription>
                Find out how you can deactivate your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To deactivate your account, please contact support. We'll help you
            with the account deactivation process and answer any questions you
            may have.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsAccount;
