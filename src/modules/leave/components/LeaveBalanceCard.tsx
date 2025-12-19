"use client";

import type { LeaveType, LeaveBalance } from "@prisma/client";

type BalanceWithType = LeaveBalance & {
  leaveType: LeaveType;
};

interface LeaveBalanceCardProps {
  balances: BalanceWithType[];
}

export function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="font-semibold text-gray-900 mb-4">Leave Balance</h2>

      {balances.length === 0 ? (
        <p className="text-sm text-gray-500">No leave balances set up yet.</p>
      ) : (
        <div className="space-y-4">
          {balances.map((balance) => {
            const total = Number(balance.entitlement) + Number(balance.carriedOver) + Number(balance.adjustment);
            const used = Number(balance.used);
            const available = total - used;
            const percentage = total > 0 ? (used / total) * 100 : 0;

            return (
              <div key={balance.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: balance.leaveType.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {balance.leaveType.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {available.toFixed(1)} / {total.toFixed(1)} days
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: balance.leaveType.color,
                    }}
                  />
                </div>
                {Number(balance.carriedOver) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Includes {Number(balance.carriedOver).toFixed(1)} days carried over
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
