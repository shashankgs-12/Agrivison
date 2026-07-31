"use client";

import React from "react";
import { Users, Search, Filter, Shield, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/stores/auth-store";

export default function AdminUsersPage() {
  const { user } = useAuthStore();

  const userList = user
    ? [
        {
          id: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
          region: user.location || "GPS Location Active",
          status: "Active Session",
        },
      ]
    : [];
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
          User Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system access, roles, and assigned officer districts
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 dark:border-slate-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Region</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {userList.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3">
                  <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.email}</p>
                </td>
                <td className="p-3">
                  <Badge variant={u.role === "admin" ? "amber" : u.role === "agriculture_officer" ? "blue" : "emerald"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{u.region}</td>
                <td className="p-3">
                  <span className="text-emerald-600 font-bold">● {u.status}</span>
                </td>
                <td className="p-3 text-right">
                  <button className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
