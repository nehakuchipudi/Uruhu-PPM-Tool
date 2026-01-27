import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Quote, QuoteLineItem, Person } from '@/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  DollarSign,
  Save,
  Send,
  Mail,
  MessageSquare,
  Download,
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Edit,
  Eye,
  Clock,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuotePageProps {
  quote: Quote | null;
  people: Person[];
  customers: string[];
  mode: 'create' | 'edit' | 'view';
  onBack: () => void;
  onSave: (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Quote>) => void;
  onSendEmail?: (quote: Quote) => void;
  onSendText?: (quote: Quote) => void;
  onExportPDF?: (quote: Quote) => void;
  onConvertToProject?: (quoteId: string) => void;
  onConvertToWorkOrder?: (quoteId: string) => void;
}

export function QuotePage({
  quote,
  people,
  customers,
  mode,
  onBack,
  onSave,
  onUpdate,
  onSendEmail,
  onSendText,
  onExportPDF,
  onConvertToProject,
  onConvertToWorkOrder,
}: QuotePageProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [formData, setFormData] = useState({
    customerName: quote?.customerName || '',
    customerEmail: quote?.customerEmail || '',
    customerPhone: quote?.customerPhone || '',
    customerAddress: quote?.customerAddress || '',
    title: quote?.title || '',
    description: quote?.description || '',
    status: quote?.status || ('draft' as const),
    priority: quote?.priority || ('medium' as const),
    taxRate: quote?.taxRate || 0,
    discountRate: quote?.discountRate || 0,
    validUntil: quote?.validUntil
      ? new Date(quote.validUntil).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: quote?.notes || '',
    termsAndConditions: quote?.termsAndConditions || getDefaultTerms(),
    createdBy: quote?.createdBy || people[0]?.id || '',
  });

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    quote?.lineItems || [
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        total: 0,
      },
    ]
  );

  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Calculate totals
  const calculations = React.useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
      return sum + (itemSubtotal - itemDiscount);
    }, 0);

    const discountAmount = subtotal * ((formData.discountRate || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((formData.taxRate || 0) / 100);
    const totalAmount = afterDiscount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  }, [lineItems, formData.taxRate, formData.discountRate]);

  // Update line item totals
  useEffect(() => {
    setLineItems((items) =>
      items.map((item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscount = itemSubtotal * ((item.discount || 0) / 100);
        const total = itemSubtotal - itemDiscount;
        return { ...item, total };
      })
    );
  }, []);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.error('Quote must have at least one line item');
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof QuoteLineItem, value: any) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, [field]: value };

        // Recalculate total
        const itemSubtotal = updatedItem.quantity * updatedItem.unitPrice;
        const itemDiscount = itemSubtotal * ((updatedItem.discount || 0) / 100);
        updatedItem.total = itemSubtotal - itemDiscount;

        return updatedItem;
      })
    );
  };

  const handleSave = () => {
    // Validation
    if (!formData.customerName) {
      toast.error('Please select or enter a customer name');
      return;
    }
    if (!formData.title) {
      toast.error('Please enter a quote title');
      return;
    }
    if (lineItems.some((item) => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Please fill in all line item details');
      return;
    }

    const quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'> = {
      instanceId: quote?.instanceId || 'default-instance',
      customerName: formData.customerName,
      customerEmail: formData.customerEmail || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerAddress: formData.customerAddress || undefined,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      lineItems,
      subtotal: calculations.subtotal,
      taxRate: formData.taxRate,
      taxAmount: calculations.taxAmount,
      discountRate: formData.discountRate,
      discountAmount: calculations.discountAmount,
      totalAmount: calculations.totalAmount,
      validUntil: formData.validUntil,
      notes: formData.notes || undefined,
      termsAndConditions: formData.termsAndConditions || undefined,
      createdBy: formData.createdBy,
      sentAt: quote?.sentAt,
      approvedAt: quote?.approvedAt,
      rejectedAt: quote?.rejectedAt,
    };

    if (quote && onUpdate) {
      onUpdate(quote.id, {
        ...quoteData,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Quote updated successfully');
      setIsEditing(false);
    } else {
      onSave(quoteData);
      toast.success('Quote saved successfully');
      onBack();
    }
  };

  const handleSendEmail = () => {
    if (!quote) {
      toast.error('Please save the quote first');
      return;
    }
    if (!formData.customerEmail) {
      toast.error('Customer email is required');
      return;
    }
    if (onSendEmail) {
      onSendEmail(quote);
    } else {
      toast.success(`Quote sent via email to ${formData.customerEmail}`);
    }
  };

  const handleSendText = () => {
    if (!quote) {
      toast.error('Please save the quote first');
      return;
    }
    if (!formData.customerPhone) {
      toast.error('Customer phone number is required');
      return;
    }
    if (onSendText) {
      onSendText(quote);
    } else {
      toast.success(`Quote sent via text to ${formData.customerPhone}`);
    }
  };

  const handleAIGenerate = () => {
    toast.info('AI-assisted quote generation coming soon');
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

  const isExpired = quote && new Date(quote.validUntil) < new Date();
  const isExpiringSoon =
    quote &&
    new Date(quote.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    quote.status === 'sent';
  const creator = quote && people.find((p) => p.id === quote.createdBy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create'
                  ? 'New Quote'
                  : quote
                  ? `Quote ${quote.quoteNumber}`
                  : 'Quote'}
              </h1>
              {quote && (
                <>
                  <Badge className={`${getStatusColor(quote.status)} border`}>
                    {quote.status.toUpperCase()}
                  </Badge>
                  {quote.priority && (
                    <Badge className={`${getPriorityColor(quote.priority)} text-white`}>
                      {quote.priority.toUpperCase()}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {quote && (
              <p className="text-gray-600 mt-1">
                {quote.title}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isEditing && quote && (
            <>
              {onExportPDF && (
                <Button variant="outline" onClick={() => onExportPDF(quote)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </>
          )}
          {isEditing && (
            <>
              {mode !== 'create' && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Quote
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert for expiring/expired quotes */}
      {(isExpired || isExpiringSoon) && quote && quote.status === 'sent' && !isEditing && (
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

      {isEditing ? (
        /* EDIT/CREATE MODE */
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomerForm(!showCustomerForm)}
              >
                {showCustomerForm ? 'Select Existing' : 'New Customer'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Name *</Label>
                {showCustomerForm ? (
                  <Input
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Enter customer name"
                    required
                  />
                ) : (
                  <Select
                    value={formData.customerName}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customerName: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer} value={customer}>
                          {customer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={formData.customerAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, customerAddress: e.target.value })
                  }
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
            </div>
          </Card>

          {/* Quote Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Website Development Services"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of services or products..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valid Until *</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Created By</Label>
                <Select
                  value={formData.createdBy}
                  onValueChange={(value) => setFormData({ ...formData, createdBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIGenerate}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-4">
                    <Label className="text-xs">Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, 'description', e.target.value)
                      }
                      placeholder="Service or product description"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)
                      }
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <Label className="text-xs">Disc %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={item.discount || 0}
                      onChange={(e) =>
                        updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="h-10 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center font-semibold text-gray-900">
                      {formatCurrency(item.total)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pricing Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Pricing Summary
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Discount</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discountRate}
                    onChange={(e) =>
                      setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 h-8"
                  />
                  <span className="text-gray-700">%</span>
                </div>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(calculations.discountAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Tax</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 h-8"
                  />
                  <span className="text-gray-700">%</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(calculations.taxAmount)}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-gray-300 flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

            <div className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes (not visible to customer)"
                  rows={3}
                />
              </div>

              <div>
                <Label>Terms and Conditions</Label>
                <Textarea
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, termsAndConditions: e.target.value })
                  }
                  placeholder="Payment terms, delivery conditions, etc."
                  rows={5}
                />
              </div>
            </div>
          </Card>

          {/* Bottom Action Bar */}
          <Card className="p-4 sticky bottom-0 bg-white border-t-2 border-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onBack}>
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSendText}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send via Text
                </Button>
                <Button variant="outline" onClick={handleSendEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Quote
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* VIEW MODE */
        quote && (
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
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
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.description}</p>
              </Card>
            )}

            {/* Line Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
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
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
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
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(quote.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
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
              <Card className="p-6 bg-amber-50 border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </Card>
            )}

            {/* Terms and Conditions */}
            {quote.termsAndConditions && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms and Conditions</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {quote.termsAndConditions}
                </p>
              </Card>
            )}

            {/* Bottom Action Bar */}
            <Card className="p-4 sticky bottom-0 bg-white border-t-2 border-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onExportPDF && (
                    <Button variant="outline" onClick={() => onExportPDF(quote)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
                  <Button variant="outline" onClick={handleSendText}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send via Text
                  </Button>
                  <Button variant="outline" onClick={handleSendEmail}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Quote
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

function getDefaultTerms(): string {
  return `1. Payment Terms: Net 30 days from date of invoice
2. Quote Validity: This quote is valid for 30 days from the date of issue
3. Pricing: All prices are in USD and subject to applicable taxes
4. Cancellation: Customer may cancel within 48 hours of acceptance
5. Warranty: Services/products are warranted for 90 days from delivery
6. Liability: Our liability is limited to the total value of this quote`;
}
