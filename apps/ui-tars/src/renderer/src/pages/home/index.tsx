import RunMessages from '@renderer/components/RunMessages';

import { AppSidebar } from '@/renderer/src/components/SideBar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar';

export default function Page() {
  return (
    <SidebarProvider className="flex h-screen w-full bg-white">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <RunMessages />
      </SidebarInset>
    </SidebarProvider>
  );
}
