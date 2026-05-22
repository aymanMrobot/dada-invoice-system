import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || "dada2025";
    if (password === expectedPassword) {
      localStorage.setItem("dada_auth", "true");
      toast.success("Login successful");
      setLocation("/");
      window.location.reload();
    } else {
      toast.error("Invalid password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(209,92,42,.14),transparent_30%),linear-gradient(135deg,#fff8ef,#f7f2e8_45%,#eef5f3)] px-4">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-stone-300/30 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/dada-logo.png" alt="Dada Restaurant" className="h-20" />
          </div>
          <CardTitle className="text-2xl">Dada Restaurant</CardTitle>
          <CardDescription>Invoice command centre</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
