import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarDays, CheckSquare, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="font-display font-bold text-2xl text-primary flex items-center gap-2">
          <CalendarDays className="w-8 h-8" />
          PlanIt.
        </div>
        <Link href="/api/login">
          <Button>Sign In</Button>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center px-4 text-center max-w-4xl mx-auto space-y-12 py-20">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-tight">
            Master your schedule.<br/>
            <span className="text-primary bg-primary/10 px-4 rounded-2xl">Ace your studies.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The minimal, distraction-free planner designed for students who want to stay organized without the clutter.
          </p>
          <div className="pt-4">
            <Link href="/api/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full pt-12">
          {[
            { icon: CalendarDays, title: "Smart Timetable", desc: "Drag-and-drop schedule management." },
            { icon: CheckSquare, title: "Task Tracking", desc: "Never miss an assignment deadline." },
            { icon: Clock, title: "Study Timer", desc: "Focus sessions with built-in analytics." },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg shadow-black/5">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 mx-auto">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; 2024 PlanIt. Built for students.</p>
      </footer>
    </div>
  );
}
