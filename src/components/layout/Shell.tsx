import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { SessionUser } from "@/types";
import { getMenuFormTemplates } from "@/modules/forms/actions/form-template-actions";

interface ShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export async function Shell({ user, children }: ShellProps) {
  const dynamicMenuItems = await getMenuFormTemplates(user.permissionLevel);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar permissionLevel={user.permissionLevel} dynamicMenuItems={dynamicMenuItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
