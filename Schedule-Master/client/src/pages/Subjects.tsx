import { useState } from "react";
import { useSubjects, useCreateSubject, useDeleteSubject } from "@/hooks/use-subjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Palette } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema, InsertSubject } from "@shared/schema";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
];

export default function Subjects() {
  const { data: subjects, isLoading } = useSubjects();
  const { mutate: createSubject, isPending: isCreating } = useCreateSubject();
  const { mutate: deleteSubject } = useDeleteSubject();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InsertSubject>({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: "",
      color: PRESET_COLORS[0],
    },
  });

  const onSubmit = (data: InsertSubject) => {
    createSubject(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      },
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Subjects</h1>
          <p className="text-muted-foreground">Manage your courses and color codes.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Plus className="w-5 h-5" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Computer Science"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Color Code</Label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => form.setValue("color", color)}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-offset-background ${
                        form.watch("color") === color ? "ring-foreground scale-110" : "ring-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {form.formState.errors.color && (
                  <p className="text-sm text-destructive">{form.formState.errors.color.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : subjects?.map((subject) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-border/50 hover:border-border transition-colors h-full">
              <div 
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: subject.color }}
              />
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{subject.name}</h3>
                    <div 
                      className="w-3 h-3 rounded-full opacity-50"
                      style={{ backgroundColor: subject.color }} 
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                    onClick={() => deleteSubject(subject.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {!isLoading && subjects?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No subjects yet</h3>
            <p className="mb-4">Create subjects to start organizing your classes and tasks.</p>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
              Create First Subject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
