import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Settings, Clock, Cog, Save, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudyPlan, StudySession, StudySubject, ExamType } from '@/types/study';
import PlanAdjustmentModal from './PlanAdjustmentModal';
import StudyPlanHeader from './StudyPlanHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { saveStudyPlan, getSavedPlans, loadStudyPlan } from '@/utils/studyPlanPersistence';
interface CycleConfig {
  forceAllSubjects: boolean;
  subjectsPerCycle: number;
  rotationIntensity: number;
  focusMode: 'balanced' | 'priority' | 'difficulty';
  avoidConsecutive: boolean;
}
interface StudyPlanDisplayProps {
  studyPlan: StudyPlan;
  subjectLevels: Record<string, string>;
  studySessions?: StudySession[];
  onBack: () => void;
  onStartTimer: (subject: string, topic?: string, subtopic?: string, taskId?: string) => void;
  onUpdatePlan?: (updatedPlan: StudyPlan) => void;
  onRegenerateCycle?: (config: CycleConfig) => void;
  examDate?: Date;
  selectedExam: string;
  examTypes: ExamType[];
}
const StudyPlanDisplay: React.FC<StudyPlanDisplayProps> = ({
  studyPlan,
  subjectLevels,
  studySessions = [],
  onBack,
  onStartTimer,
  onUpdatePlan = () => {},
  onRegenerateCycle,
  examDate,
  selectedExam,
  examTypes
}) => {
  const navigate = useNavigate();
  const [savePlanName, setSavePlanName] = React.useState('');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showManageDialog, setShowManageDialog] = React.useState(false);
  const [savedPlans, setSavedPlans] = React.useState(getSavedPlans());
  // Function to calculate subject progress
  const getSubjectProgress = (subject: StudySubject) => {
    if (!subject.topics || subject.topics.length === 0) return 0;
    const completedTopics = subject.topics.filter(t => t.completed).length;
    return (completedTopics / subject.topics.length) * 100;
  };

  // Handle start study - simplified without task management
  const handleStartStudy = () => {
    navigate('/study-session');
  };

  // Handle save plan
  const handleSavePlan = () => {
    if (!savePlanName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um nome para o plano.",
        variant: "destructive"
      });
      return;
    }

    const planId = saveStudyPlan(studyPlan, savePlanName.trim());
    if (planId) {
      toast({
        title: "Sucesso",
        description: `Plano "${savePlanName}" salvo com sucesso!`
      });
      setSavePlanName('');
      setShowSaveDialog(false);
      setSavedPlans(getSavedPlans());
    } else {
      toast({
        title: "Erro",
        description: "Falha ao salvar o plano.",
        variant: "destructive"
      });
    }
  };

  // Handle load plan
  const handleLoadPlan = (planId: string) => {
    const plan = loadStudyPlan(planId);
    if (plan) {
      onUpdatePlan?.(plan);
      toast({
        title: "Sucesso",
        description: "Plano carregado com sucesso!"
      });
      setShowManageDialog(false);
      setSavedPlans(getSavedPlans());
    } else {
      toast({
        title: "Erro",
        description: "Falha ao carregar o plano.",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      {/* Plan Header */}
      <StudyPlanHeader 
        studyPlan={studyPlan}
        examDate={examDate}
        selectedExam={selectedExam}
        examTypes={examTypes}
        subjectLevels={subjectLevels}
      />

      {/* Action Buttons - Moved to Top */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Save Plan Dialog */}
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar Plano</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Salvar Plano de Estudos</DialogTitle>
                    <DialogDescription>
                      Digite um nome para salvar o plano atual.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="planName">Nome do Plano</Label>
                      <Input
                        id="planName"
                        value={savePlanName}
                        onChange={(e) => setSavePlanName(e.target.value)}
                        placeholder="Ex: Plano ENEM 2024"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePlan}>
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Manage Plans Dialog */}
              <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>Gerenciar Planos</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Planos de Estudos</DialogTitle>
                    <DialogDescription>
                      Carregue seus planos salvos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedPlans.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum plano salvo encontrado.</p>
                        <p className="text-sm">Salve um plano para começar!</p>
                      </div>
                    ) : (
                      savedPlans.map((plan) => (
                        <Card key={plan.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Criado em {new Date(plan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadPlan(plan.id)}
                            >
                              Carregar
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <PlanAdjustmentModal 
                studyPlan={studyPlan} 
                subjects={studyPlan.subjects} 
                subjectLevels={subjectLevels} 
                onUpdatePlan={onUpdatePlan}
              >
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4" />
                  <span>Ajustar Plano</span>
                </Button>
              </PlanAdjustmentModal>
              
              <Button 
                className="flex items-center space-x-2 bg-study-primary hover:bg-study-primary/90 w-full sm:w-auto" 
                onClick={handleStartStudy}
              >
                <Clock className="h-4 w-4" />
                <span>Começar Estudo</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={studyPlan.data} cx="50%" cy="50%" labelLine={false} label={({
                  name,
                  percentage
                }) => `${name}: ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey={studyPlan.type === 'cycle' ? 'percentage' : 'hours'}>
                    {studyPlan.data?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Progress Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progresso por Matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studyPlan.subjects?.map(subject => (
                <Card key={subject.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <h3 className="font-medium">{subject.name}</h3>
                    </div>
                    <Badge variant="outline">
                      {Math.round(getSubjectProgress(subject))}% concluído
                    </Badge>
                  </div>
                  <Progress value={getSubjectProgress(subject)} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    {subject.topics?.filter(t => t.completed).length || 0} de {subject.topics?.length || 0} tópicos concluídos
                  </div>
                </Card>
              )) || []}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Content - Simplified */}
      

    </div>;
};
export default StudyPlanDisplay;