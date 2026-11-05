import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../../utils/apiConfig";
import { toast } from "sonner";

import { useAuthStore } from "../../store/useAuthStore";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetchWithAuth("/api/admin/login", {
        method: "POST",
        body: { username, password },
      });
      const data = await res.json();
      
      if (data.success) {
        setToken(data.token);
        toast.success("Login Successful");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
