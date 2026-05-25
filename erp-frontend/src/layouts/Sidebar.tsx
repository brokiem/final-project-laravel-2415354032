import { Link, Outlet, useLocation } from "react-router-dom"
import {
    SidebarProvider,
    Sidebar as UISidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Users, Package, FileText } from "lucide-react"

export function Sidebar() {
    const location = useLocation()

    return (
        <SidebarProvider>
            <div className="flex bg-muted/20 min-h-screen w-full">
                <UISidebar>
                    <SidebarHeader className="h-16 flex border-b flex-row items-center justify-start px-4">
                        <div className="font-bold text-lg">
                            ERP App
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-2 py-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/customers" || location.pathname === "/"}>
                                    <Link to="/customers">
                                        <Users />
                                        <span>Customers</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/services"}>
                                    <Link to="/services">
                                        <Package />
                                        <span>Services</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/subscriptions"}>
                                    <Link to="/subscriptions">
                                        <FileText />
                                        <span>Subscription</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </UISidebar>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 flex items-center px-6 border-b bg-background">
                        <h1 className="text-lg font-semibold text-muted-foreground mr-auto capitalize">
                            {location.pathname === "/" ? "Customers" : location.pathname.substring(1)}
                        </h1>
                    </header>

                    <main className="p-6 flex-1 overflow-auto bg-muted/10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
