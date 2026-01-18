import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useSessions } from "@/hooks/use-sessions";
import { useClasses } from "@/hooks/use-classes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubjectChip } from "@/components/SubjectChip";
import { format } from "date-fns";
import { CheckCircle2, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: classes, isLoading: classesLoading } = useClasses();

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6

  // Filter for today's classes
  const todaysClasses = classes?.filter(c => c.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

  // Pending tasks
  const pendingTasks = tasks?.filter(t => !t.isCompleted).slice(0, 3) || [];
  
  // Recent sessions
  const recentSessions = sessions?.slice(0, 3) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's your overview for {format(today, 'EEEE, MMMM do')}
        </p>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-border/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>You have {todaysClasses.length} classes today</CardDescription>
              </div>
              <Link href="/timetable">
                <Button variant="outline" size="sm" className="gap-2">
                  View Full <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : todaysClasses.length > 0 ? (
                <div className="space-y-4">
                  {todaysClasses.map((c) => (
                    <div key={c.id} className="flex items-center p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                      <div className="flex-shrink-0 w-16 text-center">
                        <p className="font-bold text-foreground">{c.startTime}</p>
                        <p className="text-xs text-muted-foreground">{c.endTime}</p>
                      </div>
                      <div className="w-px h-10 bg-border mx-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{c.subject?.name}</h3>
                          {c.subject && <SubjectChip name={c.subject.name} color={c.subject.color} className="hidden sm:inline-flex" />}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {c.location || "No location"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>No classes scheduled for today.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-border/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Priority Tasks</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{task.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                        </p>
                      </div>
                      {task.subject && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject.color }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Study Sessions */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-1/3 rounded-xl" />
                  <Skeleton className="h-24 w-1/3 rounded-xl" />
                  <Skeleton className="h-24 w-1/3 rounded-xl" />
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        {session.subject && <SubjectChip name={session.subject.name} color={session.subject.color} />}
                        <span className="text-xs text-muted-foreground">{format(new Date(session.startTime), 'MMM d')}</span>
                      </div>
                      <h4 className="font-semibold mb-1">{session.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent study sessions recorded.</p>
                  <Link href="/study">
                    <Button variant="link" className="mt-2 text-primary">Start a session</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
