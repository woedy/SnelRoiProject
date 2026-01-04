import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { demoStatements } from '@/data/demoData';
import { FileText, Download, Eye, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const Statements = () => {
  const { t } = useLanguage();
  const [year, setYear] = useState('2024');
  const [selectedStatement, setSelectedStatement] = useState<typeof demoStatements[0] | null>(null);

  const years = ['2024', '2023', '2022'];
  const filteredStatements = demoStatements.filter(s => s.year.toString() === year);

  const handleDownload = (statement: typeof demoStatements[0]) => {
    toast({
      title: 'Download Started',
      description: `${statement.month} ${statement.year} statement is being downloaded.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            {t('statements.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('statements.monthly')}
          </p>
        </div>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t('statements.year')} />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statements Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStatements.map((statement) => (
          <div
            key={statement.id}
            className="bg-card rounded-2xl p-5 shadow-card hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{statement.month}</p>
                <p className="text-sm text-muted-foreground">{statement.year}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opening</span>
                <span className="font-medium">${statement.openingBalance.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closing</span>
                <span className="font-medium">${statement.closingBalance.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-medium">{statement.transactionCount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedStatement(statement)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('statements.view')}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(statement)}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Detail Modal */}
      <Dialog open={!!selectedStatement} onOpenChange={() => setSelectedStatement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selectedStatement?.month} {selectedStatement?.year} Statement
            </DialogTitle>
          </DialogHeader>

          {selectedStatement && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Opening Balance</p>
                  <p className="text-xl font-semibold">
                    ${selectedStatement.openingBalance.toLocaleString('en-US')}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Closing Balance</p>
                  <p className="text-xl font-semibold">
                    ${selectedStatement.closingBalance.toLocaleString('en-US')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Credits</span>
                  <span className="font-medium text-success">
                    +${selectedStatement.totalCredits.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Debits</span>
                  <span className="font-medium text-destructive">
                    -${selectedStatement.totalDebits.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Net Change</span>
                  <span className="font-semibold">
                    ${(selectedStatement.totalCredits - selectedStatement.totalDebits).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium">{selectedStatement.transactionCount}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  handleDownload(selectedStatement);
                  setSelectedStatement(null);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('statements.download')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statements;
