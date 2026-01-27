import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Quote, Person } from '@/types';
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Download,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface QuoteDetailsProps {
  quote: Quote;
  people: Person[];
  onClose: () => void;
  onEdit: () => void;
  onSend?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onExportPDF?: () => void;
  onConvertToProject?: (quoteId: string) => void;
  onConvertToWorkOrder?: (quoteId: string) => void;
}

export function QuoteDetails({
  quote,
  people,
  onClose,
  onEdit,
  onSend,
  onApprove,
  onReject,
  onExportPDF,
  onConvertToProject,
  onConvertToWorkOrder,
}: QuoteDetailsProps) {
  const creator = people.find((p) => p.id === quote.createdBy);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'expired':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'converted':
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'bg-gray-500';
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = new Date(quote.validUntil) < new Date();
  const isExpiringSoon =
    new Date(quote.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    quote.status === 'sent';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span>Quote {quote.quoteNumber}</span>
                <Badge className={`${getStatusColor(quote.status)} border`}>
                  {quote.status.toUpperCase()}
                </Badge>
                {quote.priority && (
                  <Badge className={`${getPriorityColor(quote.priority)} text-white`}>
                    {quote.priority.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-normal text-gray-500 mt-1">{quote.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert for expiring/expired quotes */}
          {(isExpired || isExpiringSoon) && quote.status === 'sent' && (
            <div
              className={`p-4 rounded-lg border ${
                isExpired
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-amber-50 border-amber-300 text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">
                  {isExpired ? 'This quote has expired' : 'This quote is expiring soon'}
                </span>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Customer Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {quote.customerName}
                  </p>
                </div>
              </div>

              {quote.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {quote.customerEmail}
                    </p>
                  </div>
                </div>
              )}

              {quote.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {quote.customerPhone}
                    </p>
                  </div>
                </div>
              )}

              {quote.customerAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Address</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {quote.customerAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quote Details */}
          {quote.description && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.description}</p>
            </Card>
          )}

          {/* Line Items */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Unit Price
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Discount
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-700">
                        {item.discount ? `${item.discount}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pricing Summary */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 mb-4">Pricing Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(quote.subtotal)}
                </span>
              </div>

              {quote.discountRate && quote.discountAmount && quote.discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Discount ({quote.discountRate}%)</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(quote.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tax ({quote.taxRate}%)</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(quote.taxAmount)}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-gray-300 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(quote.totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Dates and Timeline */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Created</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatDate(quote.createdAt)}
                  </p>
                  {creator && <p className="text-xs text-gray-500 mt-1">by {creator.name}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Valid Until</p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-gray-900'
                    }`}
                  >
                    {formatDate(quote.validUntil)}
                  </p>
                </div>
              </div>

              {quote.sentAt && (
                <div className="flex items-start gap-3">
                  <Send className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Sent</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatDate(quote.sentAt)}
                    </p>
                  </div>
                </div>
              )}

              {quote.approvedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Approved</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatDate(quote.approvedAt)}
                    </p>
                  </div>
                </div>
              )}

              {quote.rejectedAt && (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Rejected</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatDate(quote.rejectedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-2">Internal Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </Card>
          )}

          {/* Terms and Conditions */}
          {quote.termsAndConditions && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Terms and Conditions</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {quote.termsAndConditions}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onExportPDF && (
                <Button variant="outline" onClick={onExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {quote.status === 'draft' && onSend && (
                <Button onClick={onSend}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              )}

              {quote.status === 'sent' && (
                <>
                  {onReject && (
                    <Button variant="outline" onClick={onReject}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {onApprove && (
                    <Button onClick={onApprove}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </>
              )}

              {quote.status === 'approved' && (
                <>
                  {onConvertToWorkOrder && (
                    <Button
                      variant="outline"
                      onClick={() => onConvertToWorkOrder(quote.id)}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Convert to Work Order
                    </Button>
                  )}
                  {onConvertToProject && (
                    <Button onClick={() => onConvertToProject(quote.id)}>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Convert to Project
                    </Button>
                  )}
                </>
              )}

              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}