import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { SessionUser } from "@/types";

interface ShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function Shell({ user, children }: ShellProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar permissionLevel={user.permissionLevel} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
