import { useState } from "react";
import { useTasks, useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, InsertTask } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { format } from "date-fns";

const formSchema = insertTaskSchema.extend({
  subjectId: z.coerce.number(),
  dueDate: z.coerce.date()
});

export default function Tasks() {
  const { data: tasks } = useTasks();
  const { data: subjects } = useSubjects();
  const { mutate: createTask, isPending } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InsertTask>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "medium",
      title: "",
      description: ""
    },
  });

  const onSubmit = (data: InsertTask) => {
    createTask(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      },
    });
  };

  const toggleTask = (id: number, currentStatus: boolean) => {
    updateTask({ id, isCompleted: !currentStatus });
  };

  const incompleteTasks = tasks?.filter(t => !t.isCompleted).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];
  const completedTasks = tasks?.filter(t => t.isCompleted) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Tasks</h1>
          <p className="text-muted-foreground">Track assignments and deadlines.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. History Essay" {...form.register("title")} />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" {...form.register("dueDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select onValueChange={(val: any) => form.setValue("priority", val)} defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input {...form.register("description")} />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating..." : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            To Do
          </h2>
          <AnimatePresence>
            {incompleteTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <button 
                  onClick={() => toggleTask(task.id, false)}
                  className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Circle className="w-6 h-6" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{task.title}</span>
                    {task.priority === 'high' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">HIGH</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {task.subject && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject.color }} />
                        {task.subject.name}
                      </span>
                    )}
                    <span>•</span>
                    <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {incompleteTasks.length === 0 && (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No pending tasks. Great job!</p>
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Completed</h2>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-transparent opacity-60 hover:opacity-100 transition-opacity"
              >
                <button 
                  onClick={() => toggleTask(task.id, true)}
                  className="flex-shrink-0 text-primary"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
                <div className="flex-1">
                  <span className="font-medium line-through decoration-muted-foreground">{task.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
