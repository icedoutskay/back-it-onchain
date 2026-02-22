"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Clock, Users, Filter } from "lucide-react";

interface StakeActivity {
  id: string;
  user: {
    wallet: string;
    displayName?: string;
    avatar?: string;
  };
  side: "up" | "down";
  amount: number;
  token: string;
  timestamp: string;
}

interface ActivityLogProps {
  stakes?: StakeActivity[];
  className?: string;
}

// Mock data for demonstration
const mockStakes: StakeActivity[] = [
  {
    id: "1",
    user: {
      wallet: "0x1234...5678",
      displayName: "CryptoWhale",
      avatar: "bg-blue-500",
    },
    side: "up",
    amount: 500,
    token: "USDC",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    user: {
      wallet: "0xabcd...efgh",
      displayName: "TraderJoe",
      avatar: "bg-green-500",
    },
    side: "down",
    amount: 250,
    token: "USDC",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    user: {
      wallet: "0x9876...5432",
      displayName: "DeFiKing",
      avatar: "bg-purple-500",
    },
    side: "up",
    amount: 1000,
    token: "USDC",
    timestamp: "12 min ago",
  },
  {
    id: "4",
    user: {
      wallet: "0x1111...2222",
      displayName: "MoonShot",
      avatar: "bg-orange-500",
    },
    side: "up",
    amount: 150,
    token: "USDC",
    timestamp: "25 min ago",
  },
  {
    id: "5",
    user: {
      wallet: "0x3333...4444",
      displayName: "BearHunter",
      avatar: "bg-red-500",
    },
    side: "down",
    amount: 750,
    token: "USDC",
    timestamp: "1 hour ago",
  },
  {
    id: "6",
    user: {
      wallet: "0x5555...6666",
      displayName: "AlphaSeeker",
      avatar: "bg-cyan-500",
    },
    side: "up",
    amount: 300,
    token: "USDC",
    timestamp: "2 hours ago",
  },
  {
    id: "7",
    user: {
      wallet: "0x7777...8888",
      displayName: "DegenMaster",
      avatar: "bg-yellow-500",
    },
    side: "down",
    amount: 2000,
    token: "USDC",
    timestamp: "3 hours ago",
  },
];

function getInitials(name: string): string {
  return name.substring(0, 2).toUpperCase();
}

function formatWallet(wallet: string): string {
  if (wallet.includes("...")) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

export function ActivityLog({ stakes = mockStakes, className }: ActivityLogProps) {
  const [filter, setFilter] = useState<"all" | "up" | "down">("all");

  const filteredStakes = stakes.filter((stake) => {
    if (filter === "all") return true;
    return stake.side === filter;
  });

  const upVolume = stakes
    .filter((s) => s.side === "up")
    .reduce((acc, s) => acc + s.amount, 0);
  const downVolume = stakes
    .filter((s) => s.side === "down")
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Up Volume</span>
          </div>
          <span className="text-lg font-bold text-green-500">
            ${upVolume.toLocaleString()}
          </span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Down Volume</span>
          </div>
          <span className="text-lg font-bold text-red-500">
            ${downVolume.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground mr-2" />
        {(["all", "up", "down"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {type === "all" ? "All" : type === "up" ? "Up" : "Down"}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="border border-border rounded-xl overflow-hidden bg-card/30">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">User</div>
          <div className="col-span-2 text-center">Side</div>
          <div className="col-span-3 text-right">Amount</div>
          <div className="col-span-3 text-right">Time</div>
        </div>

        {/* Table Body */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredStakes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            filteredStakes.map((stake, index) => (
              <div
                key={stake.id}
                className={cn(
                  "grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm hover:bg-secondary/30 transition-colors",
                  index !== filteredStakes.length - 1 && "border-b border-border"
                )}
              >
                {/* User */}
                <div className="col-span-4 flex items-center gap-2">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      stake.user.avatar || "bg-primary"
                    )}
                  >
                    {getInitials(stake.user.displayName || stake.user.wallet)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {stake.user.displayName || formatWallet(stake.user.wallet)}
                    </p>
                  </div>
                </div>

                {/* Side */}
                <div className="col-span-2 flex justify-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      stake.side === "up"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {stake.side === "up" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {stake.side === "up" ? "Up" : "Down"}
                  </span>
                </div>

                {/* Amount */}
                <div className="col-span-3 text-right">
                  <span className="font-medium text-foreground">
                    {stake.amount.toLocaleString()} {stake.token}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-3 text-right">
                  <span className="flex items-center justify-end gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" />
                    {stake.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
