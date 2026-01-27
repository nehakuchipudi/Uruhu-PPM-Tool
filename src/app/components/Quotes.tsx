import React, { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Quote, Person } from '@/types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  X,
  MoreVertical,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuotesProps {
  quotes: Quote[];
  people: Person[];
  onCreateQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateQuote: (id: string, quote: Partial<Quote>) => void;
  onDeleteQuote: (id: string) => void;
  onConvertToProject?: (quoteId: string) => void;
  onConvertToWorkOrder?: (quoteId: string) => void;
  onViewQuote: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onNewQuote: () => void;
}

export function Quotes({
  quotes,
  people,
  onCreateQuote,
  onUpdateQuote,
  onDeleteQuote,
  onConvertToProject,
  onConvertToWorkOrder,
  onViewQuote,
  onEditQuote,
  onNewQuote,
}: QuotesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          quote.quoteNumber.toLowerCase().includes(query) ||
          quote.title.toLowerCase().includes(query) ||
          quote.customerName.toLowerCase().includes(query) ||
          (quote.description && quote.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && quote.priority !== priorityFilter) return false;

      // Customer filter
      if (customerFilter !== 'all' && quote.customerName !== customerFilter) return false;

      return true;
    });
  }, [quotes, searchQuery, statusFilter, priorityFilter, customerFilter]);

  // Get unique customers
  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    quotes.forEach((q) => customers.add(q.customerName));
    return Array.from(customers).sort();
  }, [quotes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = quotes.length;
    const draft = quotes.filter((q) => q.status === 'draft').length;
    const sent = quotes.filter((q) => q.status === 'sent').length;
    const approved = quotes.filter((q) => q.status === 'approved').length;
    const totalValue = quotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const approvedValue = quotes
      .filter((q) => q.status === 'approved')
      .reduce((sum, q) => sum + q.totalAmount, 0);

    return { total, draft, sent, approved, totalValue, approvedValue };
  }, [quotes]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCustomerFilter('all');
    toast.success('Filters cleared');
  };

  const handleDuplicateQuote = (quote: Quote) => {
    const duplicatedQuote = {
      ...quote,
      quoteNumber: '', // Will be auto-generated
      title: `${quote.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
    };
    // Remove id and other auto-generated fields
    const { id, quoteNumber, createdAt, updatedAt, ...quoteData } = duplicatedQuote;
    onCreateQuote(quoteData);
    toast.success('Quote duplicated successfully');
  };

  const handleSendQuote = (quote: Quote) => {
    onUpdateQuote(quote.id, {
      status: 'sent',
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Quote ${quote.quoteNumber} sent to ${quote.customerName}`);
  };

  const handleApproveQuote = (quote: Quote) => {
    onUpdateQuote(quote.id, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Quote ${quote.quoteNumber} approved`);
  };

  const handleRejectQuote = (quote: Quote) => {
    onUpdateQuote(quote.id, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.info(`Quote ${quote.quoteNumber} rejected`);
  };

  const handleDeleteQuote = (quote: Quote) => {
    if (confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      onDeleteQuote(quote.id);
      toast.success('Quote deleted successfully');
    }
  };

  const handleExportPDF = (quote: Quote) => {
    toast.success(`Exporting quote ${quote.quoteNumber} to PDF...`);
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

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-3 h-3" />;
      case 'sent':
        return <Send className="w-3 h-3" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      case 'expired':
        return <Clock className="w-3 h-3" />;
      case 'converted':
        return <ArrowUpRight className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Quotes
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage customer quotations and estimates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.info('AI insights coming soon')}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </Button>
          <Button onClick={onNewQuote}>
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quotes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.approvedValue)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by quote number, title, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {uniqueCustomers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3 flex items-center justify-end">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredQuotes.length}</span> of{' '}
              <span className="font-semibold">{quotes.length}</span> quotes
            </p>
          </div>
        </div>
      </Card>

      {/* Quotes Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Quote #
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Title
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Customer
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Priority
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Valid Until
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Created
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No quotes found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || customerFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first quote to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const creator = people.find((p) => p.id === quote.createdBy);
                  const isExpiringSoon =
                    new Date(quote.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    quote.status === 'sent';

                  return (
                    <tr
                      key={quote.id}
                      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => onViewQuote(quote)}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-blue-600">{quote.quoteNumber}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{quote.title}</div>
                        {quote.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {quote.description}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.customerName}
                        </div>
                        {quote.customerEmail && (
                          <div className="text-xs text-gray-500">{quote.customerEmail}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(quote.status)} border flex items-center gap-1 w-fit`}>
                          {getStatusIcon(quote.status)}
                          {quote.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        {isExpiringSoon && (
                          <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expiring soon
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {quote.priority && (
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getPriorityColor(quote.priority)}`}
                            />
                            <span className="text-sm text-gray-700 capitalize">
                              {quote.priority}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(quote.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quote.lineItems.length} item{quote.lineItems.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700">
                          {new Date(quote.validUntil).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700">
                          {new Date(quote.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        {creator && (
                          <div className="text-xs text-gray-500">{creator.name}</div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleViewQuote(quote);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuote(quote);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateQuote(quote);
                            }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleExportPDF(quote);
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            {quote.status === 'draft' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleSendQuote(quote);
                              }}>
                                <Send className="w-4 h-4 mr-2" />
                                Send to Customer
                              </DropdownMenuItem>
                            )}
                            {quote.status === 'sent' && (
                              <>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveQuote(quote);
                                }}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Approved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectQuote(quote);
                                }}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Mark as Rejected
                                </DropdownMenuItem>
                              </>
                            )}
                            {quote.status === 'approved' && onConvertToProject && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onConvertToProject(quote.id);
                              }}>
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Convert to Project
                              </DropdownMenuItem>
                            )}
                            {quote.status === 'approved' && onConvertToWorkOrder && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onConvertToWorkOrder(quote.id);
                              }}>
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Convert to Work Order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuote(quote);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}