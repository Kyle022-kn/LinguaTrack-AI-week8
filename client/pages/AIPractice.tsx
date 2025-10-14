import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/data/languages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Sparkles,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  Check,
  X,
  Loader2,
  BookOpen,
  Zap,
  Heart,
  PartyPopper,
} from "lucide-react";

interface Exercise {
  id: string;
  type: string;
  question: string;
  options?: string[];
  answer: string | string[];
  explain?: string;
  difficulty: string;
}

export default function AIPractice() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0].key);
  const [selectedType, setSelectedType] = useState<string>("vocab");
  const [difficulty, setDifficulty] = useState<string>("beginner");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answerAnimation, setAnswerAnimation] = useState<"correct" | "incorrect" | null>(null);

  const exerciseTypes = [
    { value: "vocab", label: "Vocabulary", icon: "📚" },
    { value: "translation", label: "Translation", icon: "🔄" },
    { value: "fillblank", label: "Fill Blank", icon: "✍️" },
    { value: "sentencebuilding", label: "Sentence Building", icon: "🔨" },
    { value: "multiplechoice", label: "Grammar & Culture", icon: "🎓" },
  ];

  useEffect(() => {
    fetchProgress();
    fetchStreak();
  }, []);

  const fetchProgress = async () => {
    try {
      const sessionToken = localStorage.getItem("ltai_session");
      const response = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setXP(data.xp || 0);
        setLevel(data.level || 1);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  };

  const fetchStreak = async () => {
    try {
      const sessionToken = localStorage.getItem("ltai_session");
      const response = await fetch("/api/progress/streak", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak || 0);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  const generateExercises = async () => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem("ltai_session");
      const response = await fetch("/api/ai/exercises/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          language: selectedLang,
          type: selectedType,
          difficulty,
          count: 5,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate exercises");

      const data = await response.json();
      setExercises(data.exercises);
      setCurrentIndex(0);
      setScore(0);
      setUserAnswer("");
      setShowResult(false);
      setHearts(5);
      setShowCelebration(false);
      toast.success("AI exercises generated!", { description: `${data.exercises.length} questions ready` });
    } catch (error) {
      toast.error("Failed to generate exercises", { description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    const currentExercise = exercises[currentIndex];
    const correctAnswers = Array.isArray(currentExercise.answer)
      ? currentExercise.answer.map((a) => a.toLowerCase().trim())
      : [currentExercise.answer.toLowerCase().trim()];

    const correct = correctAnswers.includes(userAnswer.toLowerCase().trim());
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((s) => s + 1);
      addXP(20);
      setAnswerAnimation("correct");
      setTimeout(() => setAnswerAnimation(null), 600);
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setAnswerAnimation("incorrect");
      setTimeout(() => setAnswerAnimation(null), 600);
      
      if (hearts <= 1) {
        setTimeout(() => {
          toast.error("Out of hearts!", { description: "Practice session ended" });
          finishPractice();
        }, 1500);
      }
    }
  };

  const addXP = async (amount: number) => {
    try {
      const sessionToken = localStorage.getItem("ltai_session");
      const response = await fetch("/api/progress/add-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ amount, source: "ai_practice" }),
      });

      if (response.ok) {
        const data = await response.json();
        setXP(data.xp);
        setLevel(data.level);
        if (data.leveledUp) {
          toast.success("Level Up!", { description: `You're now level ${data.level}!` });
        }
      }
    } catch (error) {
      console.error("Failed to add XP:", error);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
    } else {
      finishPractice();
    }
  };

  const finishPractice = async () => {
    try {
      const sessionToken = localStorage.getItem("ltai_session");
      await fetch("/api/progress/streak", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      fetchStreak();
      
      if (hearts > 0) {
        setShowCelebration(true);
      } else {
        toast.error("Practice ended", {
          description: `Score: ${score}/${exercises.length}`,
        });
        setExercises([]);
        setCurrentIndex(0);
        setScore(0);
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }
  };
  
  const restartPractice = () => {
    setShowCelebration(false);
    setExercises([]);
    setCurrentIndex(0);
    setScore(0);
    setHearts(5);
  };

  const currentExercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Celebration Screen */}
      {showCelebration && (
        <Card className="rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl animate-bounce mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              Lesson Complete!
            </h2>
            <div className="space-y-2">
              <div className="text-5xl font-extrabold text-primary">{score}/{exercises.length}</div>
              <p className="text-muted-foreground">Questions Correct</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mt-6">
              <div className="p-4 rounded-xl bg-white dark:bg-card">
                <div className="text-2xl font-bold text-green-600">+{score * 20} XP</div>
                <div className="text-xs text-muted-foreground">Earned</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-card">
                <div className="text-2xl font-bold text-amber-600">{hearts} ❤️</div>
                <div className="text-xs text-muted-foreground">Hearts Left</div>
              </div>
            </div>
            <Button onClick={restartPractice} className="w-full max-w-xs mt-6 h-12 text-lg font-bold">
              <Sparkles className="mr-2 size-5" /> Practice Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hearts Display */}
      {!showCelebration && exercises.length > 0 && (
        <div className="flex items-center justify-center gap-1 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className={`size-8 ${
                i < hearts
                  ? "fill-red-500 text-red-500 animate-pulse"
                  : "fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700"
              }`}
            />
          ))}
        </div>
      )}

      {/* Header with Stats */}
      {!showCelebration && (
        <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 grid place-items-center">
              <Zap className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{xp} XP</div>
              <div className="text-xs text-muted-foreground">Level {level}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-amber-500/10 grid place-items-center">
              <Flame className="size-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-green-500/10 grid place-items-center">
              <Trophy className="size-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Setup Section */}
      {!showCelebration && exercises.length === 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" /> AI-Powered Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Language</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.key}
                    onClick={() => setSelectedLang(lang.key)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedLang === lang.key
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-accent hover:border-primary/30"
                    }`}
                  >
                    <div className="text-2xl mb-1">{lang.emoji}</div>
                    <div className="text-xs font-medium">{lang.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Exercise Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {exerciseTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-accent hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {["beginner", "intermediate", "advanced"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${
                      difficulty === diff
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-accent hover:border-primary/30"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateExercises}
              disabled={loading}
              className="w-full h-12 text-lg font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-5 mr-2" /> Generate AI Exercises
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exercise Section */}
      {!showCelebration && exercises.length > 0 && currentExercise && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {currentExercise.difficulty}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {exercises.length}
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-xl font-bold">{currentExercise.question}</div>

            {!showResult && (
              <>
                {currentExercise.options ? (
                  <div className="grid grid-cols-1 gap-3">
                    {currentExercise.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserAnswer(option)}
                        className={`p-4 rounded-2xl border-4 transition-all text-left font-medium text-base ${
                          userAnswer === option
                            ? "border-primary bg-primary/20 scale-105 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-card hover:border-primary/50 hover:scale-102 hover:shadow-md"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && userAnswer && checkAnswer()}
                    placeholder="Type your answer..."
                    className="w-full p-4 rounded-2xl border-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-card text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                )}

                <Button
                  onClick={checkAnswer}
                  disabled={!userAnswer}
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="size-6 mr-2" /> Check Answer
                </Button>
              </>
            )}

            {showResult && (
              <div
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-950/20 border-green-500 animate-bounce-in"
                    : "bg-red-50 dark:bg-red-950/20 border-red-500 animate-shake"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <Check className="size-5 text-green-600" />
                      <span className="font-bold text-green-600">Correct! +20 XP</span>
                    </>
                  ) : (
                    <>
                      <X className="size-5 text-red-600" />
                      <span className="font-bold text-red-600">Not quite</span>
                    </>
                  )}
                </div>
                {currentExercise.explain && (
                  <p className="text-sm text-muted-foreground">{currentExercise.explain}</p>
                )}
                {!isCorrect && (
                  <p className="text-sm mt-2">
                    <strong>Answer:</strong>{" "}
                    {Array.isArray(currentExercise.answer)
                      ? currentExercise.answer[0]
                      : currentExercise.answer}
                  </p>
                )}
                <Button 
                  onClick={nextQuestion} 
                  className="w-full h-14 mt-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {currentIndex < exercises.length - 1 ? (
                    <>
                      Next Question <ChevronRight className="size-6 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Practice <Star className="size-6 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
