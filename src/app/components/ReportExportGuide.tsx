import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Download, FileText, FileSpreadsheet, Mail, Printer, Info } from 'lucide-react';

interface ReportExportGuideProps {
  onClose?: () => void;
}

export function ReportExportGuide({ onClose }: ReportExportGuideProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Export Options</h3>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to share or save this report
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">PDF Export</p>
            <p className="text-sm text-muted-foreground">
              Professional document format, ideal for presentations and archiving
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Excel Export</p>
            <p className="text-sm text-muted-foreground">
              Spreadsheet format with formulas, perfect for further analysis
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <Download className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">CSV Export</p>
            <p className="text-sm text-muted-foreground">
              Raw data format, compatible with any data analysis tool
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Email Report</p>
            <p className="text-sm text-muted-foreground">
              Send the report directly to stakeholders via email
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Print</p>
            <p className="text-sm text-muted-foreground">
              Print a hard copy for physical distribution or filing
            </p>
          </div>
        </div>
      </div>

      {onClose && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Got it
          </Button>
        </div>
      )}
    </Card>
  );
}
