import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface Statement {
  id: number;
  period_start: string;
  period_end: string;
  generated_at: string | null;
  status: string;
  content: string;
}

const Statements = () => {
  const { t } = useLanguage();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [year, setYear] = useState<string>('2024');

  const loadStatements = () => {
    apiRequest<Statement[]>('/statements').then(setStatements);
  };

  useEffect(() => {
    loadStatements();
  }, []);

  const years = useMemo(() => Array.from(new Set(statements.map((s) => s.period_start.slice(0, 4)))), [statements]);

  const filteredStatements = statements.filter((statement) => statement.period_start.startsWith(year));

  const handleGenerate = async () => {
    try {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      await apiRequest('/statements/generate', {
        method: 'POST',
        body: JSON.stringify({
          period_start: start.toISOString().slice(0, 10),
          period_end: end.toISOString().slice(0, 10),
        }),
      });
      toast({ title: t('common.success'), description: t('statements.generated') });
      loadStatements();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('nav.statements')}
        </h1>
        <p className="text-muted-foreground mt-1">Review your monthly statements</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded border border-border bg-background px-3 py-2 text-sm"
        >
          {(years.length ? years : ['2024']).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Button onClick={handleGenerate}>{t('statements.generate')}</Button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {filteredStatements.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No statements found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredStatements.map((statement) => (
              <div key={statement.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {statement.period_start} - {statement.period_end}
                    </p>
                    <p className="text-xs text-muted-foreground">{statement.status}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" disabled={statement.status !== 'READY'}>
                  {statement.status === 'READY' ? t('statements.download') : t('statements.pending')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statements;
