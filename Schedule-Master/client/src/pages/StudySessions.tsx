import { useSessions, useCreateSession } from "@/hooks/use-sessions";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, StopCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertStudySessionSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

const formSchema = insertStudySessionSchema.extend({
  subjectId: z.coerce.number(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});

export default function StudySessions() {
  const { data: sessions } = useSessions();
  const { data: subjects } = useSubjects();
  const { mutate: createSession } = useCreateSession();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    setStartTime(new Date());
    setIsTimerRunning(true);
    setElapsed(0);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setIsOpen(true); // Open dialog to save details
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subjectId: undefined,
    }
  });

  const onSubmit = (data: any) => {
    if (!startTime) return;
    
    createSession({
      ...data,
      startTime: startTime,
      endTime: new Date(),
      isCompleted: true
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setStartTime(null);
        setElapsed(0);
        form.reset();
      }
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Focus Timer</h1>
        <p className="text-muted-foreground">Track your study sessions.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-12 bg-card rounded-3xl border border-border/50 shadow-xl shadow-primary/5">
        <div className="text-7xl font-mono font-bold text-primary mb-8 tracking-wider tabular-nums">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex gap-4">
          {!isTimerRunning ? (
            <Button size="lg" className="h-16 w-16 rounded-full" onClick={handleStartTimer}>
              <Play className="w-8 h-8 ml-1" />
            </Button>
          ) : (
            <Button size="lg" variant="destructive" className="h-16 w-16 rounded-full" onClick={handleStopTimer}>
              <StopCircle className="w-8 h-8" />
            </Button>
          )}
        </div>
        <p className="mt-6 text-muted-foreground font-medium">
          {isTimerRunning ? "Focus mode on..." : "Ready to study?"}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Session Title</Label>
              <Input placeholder="What did you study?" {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select onValueChange={(val) => form.setValue("subjectId", parseInt(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Save Session</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">History</h2>
        {sessions?.map(session => (
          <div key={session.id} className="flex items-center justify-between p-4 bg-card border rounded-xl">
            <div>
              <h3 className="font-semibold">{session.title}</h3>
              <p className="text-sm text-muted-foreground">{format(new Date(session.startTime), "PP p")}</p>
            </div>
            <div className="text-right">
              {session.subject && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted mb-1 inline-block">
                  {session.subject.name}
                </span>
              )}
              <p className="font-mono text-sm">
                {formatTime((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
