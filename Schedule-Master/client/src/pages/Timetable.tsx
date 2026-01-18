import { useState } from "react";
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-classes";
import { useSubjects } from "@/hooks/use-subjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClassSchema, InsertClass } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SubjectChip } from "@/components/SubjectChip";
import { z } from "zod";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Frontend schema matches API input but forms handle numbers as strings sometimes
const formSchema = insertClassSchema.extend({
  subjectId: z.coerce.number(),
  dayOfWeek: z.coerce.number()
});

export default function Timetable() {
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const { mutate: createClass, isPending } = useCreateClass();
  const { mutate: deleteClass } = useDeleteClass();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const form = useForm<InsertClass>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOfWeek: selectedDay,
      startTime: "09:00",
      endTime: "10:00",
      location: "",
    },
  });

  const onSubmit = (data: InsertClass) => {
    createClass(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      },
    });
  };

  const dayClasses = classes?.filter(c => c.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Timetable</h1>
          <p className="text-muted-foreground">Weekly schedule at a glance.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(val) => form.setValue("subjectId", parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.subjectId && (
                  <p className="text-sm text-destructive">{form.formState.errors.subjectId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select 
                    defaultValue={String(selectedDay)} 
                    onValueChange={(val) => form.setValue("dayOfWeek", parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="Room 101" {...form.register("location")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" {...form.register("startTime")} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" {...form.register("endTime")} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Adding..." : "Add Class"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedDay === i 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule View */}
      <div className="relative min-h-[500px] bg-card rounded-2xl border border-border/50 shadow-sm p-6">
        <div className="absolute left-6 top-6 bottom-6 w-px bg-border/50" />
        
        {dayClasses.length > 0 ? (
          <div className="space-y-6 relative">
            {dayClasses.map((c, i) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="w-16 pt-1 text-right text-sm text-muted-foreground font-mono flex-shrink-0">
                  {c.startTime}
                </div>
                
                <div 
                  className="flex-1 p-4 rounded-xl border border-border/50 hover:border-border transition-all relative overflow-hidden bg-background shadow-sm hover:shadow-md"
                >
                  <div 
                    className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: c.subject?.color || 'var(--primary)' }} 
                  />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{c.subject?.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.startTime} - {c.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {c.location || "Online"}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1 transition-opacity"
                      onClick={() => deleteClass(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No classes on this day.</p>
          </div>
        )}
      </div>
    </div>
  );
}
