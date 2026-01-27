import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
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
import { Card } from '@/app/components/ui/card';
import { Quote, QuoteLineItem, Person } from '@/types';
import {
  Plus,
  Trash2,
  Calculator,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuoteFormProps {
  quote: Quote | null;
  people: Person[];
  customers: string[];
  onClose: () => void;
  onSave: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void;
}

export function QuoteForm({ quote, people, customers, onClose, onSave }: QuoteFormProps) {
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
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    onSave(quoteData);
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {quote ? 'Edit Quote' : 'Create New Quote'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Customer Information</h3>
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
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quote Details</h3>

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
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Line Items</h3>
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
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
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
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>

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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {quote ? 'Update Quote' : 'Create Quote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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