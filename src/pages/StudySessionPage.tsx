import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import PomodoroTimer from '@/components/study/PomodoroTimer';
import StudySessionHistory from '@/components/study/StudySessionHistory';
import StudyStatistics from '@/components/study/StudyStatistics';
import TimerSettings from '@/components/study/TimerSettings';
import { StudySubject, StudySession, PomodoroSettings } from '@/types/study';
import { useStudyContext } from '@/contexts/StudyContext';


const StudySessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    studySessions,
    setStudySessions,
    subjects,
    studyPlan
  } = useStudyContext();


  // Timer states
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentSubtopic, setCurrentSubtopic] = useState('');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({
    studyTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartSessions: false,
    soundEnabled: true
  });

  const timerInterval = useRef<NodeJS.Timeout | null>(null);


  // Initialize session from URL parameters
  useEffect(() => {
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const taskId = searchParams.get('taskId');
    const autoStart = searchParams.get('autoStart') === 'true';

    if (subject && autoStart) {
      startTimer(subject, topic || '', subtopic || '', taskId || '');
    } else if (subject) {
      setCurrentSubject(subject);
      setCurrentTopic(topic || '');
      setCurrentSubtopic(subtopic || '');
    }
  }, [searchParams]);

  const startTimer = (subject: string, topic?: string, subtopic?: string, taskId?: string) => {
    if (!subject) return;
    
    setCurrentSubject(subject);
    setCurrentTopic(topic || '');
    setCurrentSubtopic(subtopic || '');
    setTimer(pomodoroSettings.studyTime);
    setTimerMode('study');
    setIsTimerRunning(true);
    setCurrentSession({
      id: Date.now().toString(),
      subject,
      topic,
      subtopic,
      startTime: new Date(),
      duration: 0,
      completed: false,
      taskId
    });
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60);
      const completedSession: StudySession = {
        ...currentSession,
        endTime,
        duration,
        completed: false
      };
      setStudySessions(prev => [...prev, completedSession]);
    }
    setIsTimerRunning(false);
    setTimer(0);
    setCurrentSession(null);
    setCurrentSubject('');
    setCurrentTopic('');
    setCurrentSubtopic('');
  };

  const handleTimerSettingChange = (field: keyof PomodoroSettings, value: number | boolean) => {
    setPomodoroSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Timer countdown logic
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (timerMode === 'study') {
              const isLongBreak = (completedSessions + 1) % pomodoroSettings.sessionsUntilLongBreak === 0;
              const breakTime = isLongBreak ? pomodoroSettings.longBreakTime : pomodoroSettings.breakTime;
              
              if (currentSession) {
                const completedSession: StudySession = {
                  ...currentSession,
                  endTime: new Date(),
                  duration: pomodoroSettings.studyTime / 60,
                  completed: true
                };
                setStudySessions(prev => [...prev, completedSession]);
                setCompletedSessions(prev => prev + 1);
              }
              
              setTimerMode('break');
              return breakTime;
            } else {
              // Break finished - stop timer
              setTimerMode('study');
              setCurrentSession(null);
              setIsTimerRunning(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isTimerRunning, timer, timerMode, currentSession, pomodoroSettings, completedSessions]);

  const handleBackToPlanner = () => {
    navigate('/');
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <Button
              onClick={() => setShowSettings(false)}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Configurações do Timer</h1>
            <p className="text-muted-foreground mt-2">
              Ajuste as configurações do seu timer Pomodoro
            </p>
          </div>

          <TimerSettings
            pomodoroSettings={pomodoroSettings}
            onSettingChange={handleTimerSettingChange}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <Button
            onClick={handleBackToPlanner}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Plano
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sessão de Estudo</h1>
              <p className="text-muted-foreground mt-2">
                Foque nos seus estudos com o método Pomodoro
              </p>
            </div>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <PomodoroTimer
            subjects={subjects}
            currentSubject={currentSubject}
            currentTopic={currentTopic}
            currentSubtopic={currentSubtopic}
            timer={timer}
            isTimerRunning={isTimerRunning}
            timerMode={timerMode}
            currentSession={currentSession}
            pomodoroSettings={pomodoroSettings}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
            onStopTimer={stopTimer}
            onBackToPlanner={handleBackToPlanner}
            onOpenSettings={() => setShowSettings(true)}
          />

          {studySessions.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <StudySessionHistory studySessions={studySessions} />
              <StudyStatistics studySessions={studySessions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudySessionPage;