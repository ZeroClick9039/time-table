import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarDays, CheckSquare, Timer, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();
  
  const items = [
    { href: "/", icon: LayoutDashboard },
    { href: "/timetable", icon: CalendarDays },
    { href: "/tasks", icon: CheckSquare },
    { href: "/study", icon: Timer },
  ];

  return (
    <>
      {/* Top Bar for Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-40 flex items-center justify-between px-4">
        <div className="font-display font-bold text-xl text-primary">PlanIt.</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-40 flex justify-around items-center px-2 pb-safe">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center w-14 h-full gap-1 pt-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-6 h-6 transition-all", isActive && "scale-110")} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-primary absolute bottom-2" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
