import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CycleConfiguration from '@/components/study/CycleConfiguration';
import StudyPlanManager from '@/components/study/StudyPlanManager';
import { useStudyContext } from '@/contexts/StudyContext';
import { StudyPlan } from '@/types/study';

const Configuration = () => {
  const navigate = useNavigate();
  const { studyPlan, setStudyPlan, subjects } = useStudyContext();
  const [subjectLevels] = useState<Record<string, string>>({});

  const handleBack = () => {
    navigate('/');
  };

  const handleUpdatePlan = (updatedPlan: StudyPlan) => {
    setStudyPlan(updatedPlan);
  };

  const handleRegenerateCycle = () => {
    // Implementar lógica de regeneração se necessário
    console.log('Regenerating cycle...');
  };

  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhum plano de estudo encontrado</p>
          <Button onClick={handleBack}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-2xl font-bold text-study-primary">Configurações</h1>
        </div>

        <div className="space-y-6">
          {/* Plan Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ajustar Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Deseja criar um novo plano? Isso substituirá o plano atual.')) {
                      window.location.reload();
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Novo Plano
                </Button>
                
                <StudyPlanManager 
                  currentPlan={studyPlan}
                  onPlanLoaded={handleUpdatePlan}
                  onPlanSaved={(planId) => console.log('Plan saved:', planId)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cycle Configuration Section */}
          {studyPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Ciclo</CardTitle>
              </CardHeader>
              <CardContent>
                <CycleConfiguration
                  studyPlan={studyPlan}
                  subjects={studyPlan.subjects}
                  subjectLevels={subjectLevels}
                  onUpdatePlan={handleUpdatePlan}
                  onRegenerateCycle={handleRegenerateCycle}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;