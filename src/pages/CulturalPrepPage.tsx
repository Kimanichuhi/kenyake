import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, Award, Clock, ChevronRight, ChevronDown,
  GraduationCap, Shield, Lock, Star, ArrowRight, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  difficulty: string;
  estimated_minutes: number;
  sort_order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  body: string;
  media_type: string | null;
  media_url: string | null;
  quiz_questions: QuizQuestion[];
  sort_order: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface UserProgress {
  module_id: string;
  lesson_id: string | null;
  completed: boolean;
  quiz_score: number | null;
}

interface Certification {
  certification_type: string;
  title: string;
  earned_at: string;
  modules_completed: string[];
}

const categoryColors: Record<string, string> = {
  etiquette: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  photography: "bg-accent/20 text-accent-foreground border-accent/30",
  economics: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  sacred: "bg-primary/20 text-primary-foreground border-primary/30",
  environment: "bg-primary/20 text-primary-foreground border-primary/30",
  wildlife: "bg-accent/20 text-accent-foreground border-accent/30",
  history: "bg-muted text-muted-foreground border-border",
  conservation: "bg-primary/20 text-primary-foreground border-primary/30",
  "community-specific": "bg-secondary/20 text-secondary-foreground border-secondary/30",
  general: "bg-muted text-muted-foreground border-border",
};

const certifications = [
  {
    type: "culturally-prepared",
    title: "Culturally Prepared Traveler",
    icon: "🎓",
    description: "Complete all core modules to earn this badge. Communities can see your preparation status.",
    requiredCategories: ["etiquette", "photography", "economics", "sacred"],
  },
  {
    type: "eco-warrior",
    title: "Eco-Conscious Explorer",
    icon: "🌍",
    description: "Complete environmental and conservation modules.",
    requiredCategories: ["environment", "conservation"],
  },
  {
    type: "wildlife-ready",
    title: "Wildlife-Ready Visitor",
    icon: "🦁",
    description: "Complete wildlife interaction and safety modules.",
    requiredCategories: ["wildlife"],
  },
];

const CulturalPrepPage = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchModules();
    if (user) {
      fetchProgress();
      fetchCerts();
    }
  }, [user]);

  const fetchModules = async () => {
    const { data } = await supabase
      .from("education_modules")
      .select("*")
      .order("sort_order");
    if (data) setModules(data as Module[]);
    setLoading(false);
  };

  const fetchLessonsForModule = async (moduleId: string) => {
    if (lessons[moduleId]) return;
    const { data } = await supabase
      .from("education_lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("sort_order");
    if (data) {
      setLessons((prev) => ({
        ...prev,
        [moduleId]: data.map((l: any) => ({
          ...l,
          quiz_questions: (l.quiz_questions || []) as QuizQuestion[],
        })),
      }));
    }
  };

  const fetchProgress = async () => {
    const { data } = await supabase
      .from("user_education_progress")
      .select("module_id, lesson_id, completed, quiz_score");
    if (data) setProgress(data as UserProgress[]);
  };

  const fetchCerts = async () => {
    const { data } = await supabase
      .from("user_certifications")
      .select("certification_type, title, earned_at, modules_completed");
    if (data) setCerts(data as Certification[]);
  };

  const openModule = (moduleId: string) => {
    if (activeModule === moduleId) {
      setActiveModule(null);
      setActiveLesson(null);
    } else {
      setActiveModule(moduleId);
      setActiveLesson(null);
      setQuizSubmitted(false);
      setQuizAnswers({});
      fetchLessonsForModule(moduleId);
    }
  };

  const completeLesson = async (moduleId: string, lessonId: string, quizScore?: number) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to track your progress." });
      return;
    }
    const { error } = await supabase.from("user_education_progress").upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        lesson_id: lessonId,
        completed: true,
        quiz_score: quizScore ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id,lesson_id" }
    );
    if (!error) {
      await fetchProgress();
      toast({ title: "✅ Lesson completed!", description: "Your progress has been saved." });
      checkCertifications();
    }
  };

  const checkCertifications = async () => {
    if (!user) return;
    for (const cert of certifications) {
      const alreadyEarned = certs.find((c) => c.certification_type === cert.type);
      if (alreadyEarned) continue;

      const requiredModules = modules.filter((m) => cert.requiredCategories.includes(m.category));
      const allComplete = requiredModules.every((mod) => {
        const modLessons = lessons[mod.id];
        if (!modLessons) return false;
        return modLessons.every((l) =>
          progress.some((p) => p.module_id === mod.id && p.lesson_id === l.id && p.completed)
        );
      });

      if (allComplete && requiredModules.length > 0) {
        await supabase.from("user_certifications").insert({
          user_id: user.id,
          certification_type: cert.type,
          title: cert.title,
          modules_completed: requiredModules.map((m) => m.id),
        });
        toast({
          title: `🎉 Badge Earned: ${cert.title}!`,
          description: "Communities can now see your preparation status.",
        });
        await fetchCerts();
      }
    }
  };

  const getModuleProgress = (moduleId: string) => {
    const modLessons = lessons[moduleId];
    if (!modLessons || modLessons.length === 0) return 0;
    const completed = modLessons.filter((l) =>
      progress.some((p) => p.module_id === moduleId && p.lesson_id === l.id && p.completed)
    ).length;
    return Math.round((completed / modLessons.length) * 100);
  };

  const isLessonCompleted = (moduleId: string, lessonId: string) =>
    progress.some((p) => p.module_id === moduleId && p.lesson_id === lessonId && p.completed);

  const handleQuizSubmit = (lesson: Lesson) => {
    setQuizSubmitted(true);
    const questions = lesson.quiz_questions;
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[`${lesson.id}-${i}`] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    completeLesson(lesson.module_id, lesson.id, score);
  };

  const categories = ["all", ...Array.from(new Set(modules.map((m) => m.category)))];
  const filteredModules = filter === "all" ? modules : modules.filter((m) => m.category === filter);

  const totalLessonsCompleted = progress.filter((p) => p.completed).length;
  const overallProgress = modules.length > 0
    ? Math.round((totalLessonsCompleted / Math.max(1, Object.values(lessons).flat().length)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-primary/15 text-primary border-primary/25 font-body">
                <GraduationCap className="h-3 w-3 mr-1" /> Tourist Education
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Cultural Preparation Hub
              </h1>
              <p className="text-lg text-muted-foreground font-body max-w-2xl">
                Earn your "Culturally Prepared Traveler" badge before you visit. Communities can see your preparation status — showing you've done the work earns genuine respect.
              </p>
            </motion.div>

            {/* Stats row */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-display font-bold text-foreground">{totalLessonsCompleted}</div>
                  <div className="text-xs text-muted-foreground font-body">Lessons Completed</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-display font-bold text-foreground">{certs.length}</div>
                  <div className="text-xs text-muted-foreground font-body">Badges Earned</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-display font-bold text-foreground">{overallProgress}%</div>
                  <div className="text-xs text-muted-foreground font-body">Overall Progress</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-display font-bold text-foreground">{modules.length}</div>
                  <div className="text-xs text-muted-foreground font-body">Available Modules</div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Certifications */}
        <section className="py-8 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">
              <Award className="inline h-5 w-5 mr-2 text-secondary" />
              Certifications & Badges
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {certifications.map((cert) => {
                const earned = certs.find((c) => c.certification_type === cert.type);
                return (
                  <motion.div
                    key={cert.type}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-xl p-5 border ${
                      earned
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{cert.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground text-sm">
                          {cert.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-body mt-1">
                          {cert.description}
                        </p>
                        {earned ? (
                          <Badge className="mt-2 bg-primary text-primary-foreground text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Earned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3 mr-1" /> Not yet earned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className="rounded-full capitalize font-body text-xs"
                >
                  {cat === "all" ? "All Modules" : cat.replace("-", " ")}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredModules.map((mod, idx) => {
                  const isOpen = activeModule === mod.id;
                  const modProgress = getModuleProgress(mod.id);
                  const modLessons = lessons[mod.id] || [];

                  return (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-card rounded-xl border border-border overflow-hidden"
                    >
                      {/* Module header */}
                      <button
                        onClick={() => openModule(mod.id)}
                        className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-2xl flex-shrink-0">{mod.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-semibold text-foreground">{mod.title}</h3>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {mod.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-body line-clamp-1 mt-0.5">
                            {mod.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {mod.estimated_minutes} min
                            </span>
                            {user && modProgress > 0 && (
                              <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                                <Progress value={modProgress} className="h-1.5" />
                                <span className="text-xs text-muted-foreground">{modProgress}%</span>
                              </div>
                            )}
                            {modProgress === 100 && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded lessons */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-5 space-y-3">
                              {modLessons.length === 0 ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                              ) : (
                                modLessons.map((lesson) => {
                                  const completed = isLessonCompleted(mod.id, lesson.id);
                                  const isActive = activeLesson === lesson.id;
                                  const hasQuiz = lesson.quiz_questions && lesson.quiz_questions.length > 0;

                                  return (
                                    <div key={lesson.id} className="rounded-lg border border-border overflow-hidden">
                                      <button
                                        onClick={() => {
                                          setActiveLesson(isActive ? null : lesson.id);
                                          setQuizSubmitted(false);
                                          setQuizAnswers({});
                                        }}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                                      >
                                        {completed ? (
                                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        ) : (
                                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                                        )}
                                        <span className="font-body font-medium text-sm text-foreground flex-1">
                                          {lesson.title}
                                        </span>
                                        {hasQuiz && (
                                          <Badge variant="outline" className="text-[10px]">Quiz</Badge>
                                        )}
                                        <ChevronRight
                                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                                            isActive ? "rotate-90" : ""
                                          }`}
                                        />
                                      </button>

                                      <AnimatePresence>
                                        {isActive && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="px-4 pb-4 border-t border-border pt-4">
                                              {/* Lesson content */}
                                              <div className="prose prose-sm max-w-none font-body text-foreground/90">
                                                {lesson.body?.split("\n\n").map((para, pi) => (
                                                  <div key={pi} className="mb-3">
                                                    {para.split("\n").map((line, li) => {
                                                      if (line.startsWith("**") && line.endsWith("**")) {
                                                        return (
                                                          <h4 key={li} className="font-display font-semibold text-foreground text-sm mt-3 mb-1">
                                                            {line.replace(/\*\*/g, "")}
                                                          </h4>
                                                        );
                                                      }
                                                      if (line.startsWith("- ")) {
                                                        return (
                                                          <div key={li} className="flex gap-2 ml-2 text-sm text-foreground/80">
                                                            <span className="text-secondary">•</span>
                                                            <span dangerouslySetInnerHTML={{
                                                              __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                            }} />
                                                          </div>
                                                        );
                                                      }
                                                      if (line.match(/^\d+\./)) {
                                                        return (
                                                          <div key={li} className="flex gap-2 ml-2 text-sm text-foreground/80">
                                                            <span className="text-primary font-medium">{line.match(/^\d+/)?.[0]}.</span>
                                                            <span dangerouslySetInnerHTML={{
                                                              __html: line.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                            }} />
                                                          </div>
                                                        );
                                                      }
                                                      return (
                                                        <p key={li} className="text-sm text-foreground/80" dangerouslySetInnerHTML={{
                                                          __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                        }} />
                                                      );
                                                    })}
                                                  </div>
                                                ))}
                                              </div>

                                              {/* Quiz */}
                                              {hasQuiz && (
                                                <div className="mt-6 bg-muted/50 rounded-lg p-4 border border-border">
                                                  <h4 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-secondary" /> Quick Quiz
                                                  </h4>
                                                  {lesson.quiz_questions.map((q, qi) => (
                                                    <div key={qi} className="mb-4">
                                                      <p className="text-sm font-medium text-foreground mb-2 font-body">{q.question}</p>
                                                      <div className="space-y-2">
                                                        {q.options.map((opt, oi) => {
                                                          const key = `${lesson.id}-${qi}`;
                                                          const selected = quizAnswers[key] === oi;
                                                          const isCorrect = oi === q.correct;
                                                          let optClass = "bg-card border-border hover:border-primary/50";
                                                          if (quizSubmitted && selected && isCorrect)
                                                            optClass = "bg-primary/15 border-primary/40 text-primary";
                                                          else if (quizSubmitted && selected && !isCorrect)
                                                            optClass = "bg-destructive/15 border-destructive/40 text-destructive";
                                                          else if (quizSubmitted && isCorrect)
                                                            optClass = "bg-primary/10 border-primary/30";
                                                          else if (selected)
                                                            optClass = "bg-secondary/15 border-secondary/40";

                                                          return (
                                                            <button
                                                              key={oi}
                                                              disabled={quizSubmitted}
                                                              onClick={() =>
                                                                setQuizAnswers((prev) => ({ ...prev, [key]: oi }))
                                                              }
                                                              className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-body transition-colors ${optClass}`}
                                                            >
                                                              {opt}
                                                            </button>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  ))}
                                                  {!quizSubmitted && (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => handleQuizSubmit(lesson)}
                                                      disabled={
                                                        lesson.quiz_questions.some(
                                                          (_, qi) => quizAnswers[`${lesson.id}-${qi}`] === undefined
                                                        )
                                                      }
                                                      className="mt-2"
                                                    >
                                                      Submit Answers
                                                    </Button>
                                                  )}
                                                </div>
                                              )}

                                              {/* Complete button */}
                                              {!completed && !hasQuiz && (
                                                <Button
                                                  size="sm"
                                                  onClick={() => completeLesson(mod.id, lesson.id)}
                                                  className="mt-4"
                                                >
                                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                                  Mark as Complete
                                                </Button>
                                              )}
                                              {completed && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-primary font-body">
                                                  <CheckCircle2 className="h-4 w-4" /> Completed
                                                </div>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-12 bg-primary/5 border-t border-border">
            <div className="container mx-auto px-4 text-center">
              <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Track Your Preparation
              </h2>
              <p className="text-muted-foreground font-body max-w-md mx-auto mb-6">
                Sign in to save progress, earn badges, and show communities you're a prepared traveler.
              </p>
              <Button asChild className="rounded-full">
                <a href="/auth">
                  Sign In to Start <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </section>
        )}
      </main>
      <FooterSection />
    </div>
  );
};

export default CulturalPrepPage;
