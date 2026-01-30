import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { virtualCardService, VirtualCard } from "@/services/virtualCardService";
import { 
  CreditCard, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Clock, 
  Snowflake, 
  Ban,
  AlertCircle,
  Filter,
  Search
} from "lucide-react";

export default function VirtualCardsFixed() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'decline'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  // Filters - using simple dropdown instead of Select component
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('');

  // Helper function to safely format currency
  const formatCurrency = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cards, statusFilter, customerFilter]);

  const fetchCards = async () => {
    try {
      setError(null);
      const data = await virtualCardService.getAll();
      console.log('Fetched virtual cards:', data);
      setCards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to fetch virtual cards", error);
      setError(error.message || 'Failed to load virtual cards');
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = cards;

    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    if (customerFilter) {
      filtered = filtered.filter(card => 
        (card.customer_name || '').toLowerCase().includes(customerFilter.toLowerCase()) ||
        (card.customer_email || '').toLowerCase().includes(customerFilter.toLowerCase())
      );
    }

    setFilteredCards(filtered);
  };

  const handleApproval = async () => {
    if (!selectedCard) return;

    setActionLoading(selectedCard.id);
    try {
      await virtualCardService.processApplication(selectedCard.id, {
        action: approvalAction,
        admin_notes: adminNotes
      });
      
      setIsApprovalDialogOpen(false);
      setAdminNotes('');
      fetchCards();
    } catch (error: any) {
      console.error("Failed to process application", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateNotes = async (card: VirtualCard, notes: string) => {
    try {
      await virtualCardService.updateNotes(card.id, notes);
      fetchCards();
    } catch (error) {
      console.error("Failed to update notes", error);
    }
  };

  const openApprovalDialog = (card: VirtualCard, action: 'approve' | 'decline') => {
    setSelectedCard(card);
    setApprovalAction(action);
    setAdminNotes(card.admin_notes || '');
    setIsApprovalDialogOpen(true);
  };

  const openDetailsDialog = (card: VirtualCard) => {
    setSelectedCard(card);
    setIsDetailsDialogOpen(true);
  };

  const toggleCardDetails = (cardId: number) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
        return <CreditCard className="h-4 w-4" />;
      case 'FROZEN':
        return <Snowflake className="h-4 w-4" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <Ban className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'FROZEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Virtual Cards</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCards}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Virtual Cards Management</h1>
          <p className="text-muted-foreground">Manage virtual card applications and settings</p>
        </div>
      </div>

      {/* Filters - Using native select instead of shadcn Select */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="FROZEN">Frozen</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div>
              <Label htmlFor="customer-filter">Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-filter"
                  placeholder="Search by name or email"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('ALL');
                  setCustomerFilter('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Cards ({filteredCards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Virtual Cards</h3>
              <p className="text-muted-foreground">
                {cards.length === 0 
                  ? "No virtual card applications have been submitted yet."
                  : "No cards match the current filters."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Card Type</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{card.customer_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{card.customer_email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{card.card_type_display || card.card_type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showCardDetails[card.id] ? (card.card_number || 'N/A') : (card.masked_number || 'N/A')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardDetails(card.id)}
                        >
                          {showCardDetails[card.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(card.status || 'PENDING')}>
                        {getStatusIcon(card.status || 'PENDING')}
                        <span className="ml-1">{card.status_display || card.status || 'N/A'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Daily: ${formatCurrency(card.daily_limit)}</div>
                        <div>Monthly: ${formatCurrency(card.monthly_limit)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsDialog(card)}
                        >
                          View
                        </Button>
                        {card.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApprovalDialog(card, 'approve')}
                              disabled={actionLoading === card.id}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApprovalDialog(card, 'decline')}
                              disabled={actionLoading === card.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Card Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Virtual Card Details</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-6">
              {/* Card Visual */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm opacity-80">{selectedCard.card_type_display || selectedCard.card_type}</div>
                  <div className="text-sm font-semibold">VISA</div>
                </div>
                <div className="text-xl font-mono tracking-wider mb-6">
                  {selectedCard.card_number || 'N/A'}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-80">EXPIRES</div>
                    <div className="text-sm">
                      {selectedCard.expiry_month && selectedCard.expiry_year 
                        ? `${selectedCard.expiry_month.toString().padStart(2, '0')}/${selectedCard.expiry_year}`
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">CVV</div>
                    <div className="text-sm">{selectedCard.cvv || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Card Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedCard.customer_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedCard.customer_email || 'N/A'}</div>
                    <div><strong>Account:</strong> {selectedCard.account_number || 'N/A'}</div>
                    <div><strong>Balance:</strong> ${formatCurrency(selectedCard.account_balance)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Card Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Daily Limit:</strong> ${formatCurrency(selectedCard.daily_limit)}</div>
                    <div><strong>Monthly Limit:</strong> ${formatCurrency(selectedCard.monthly_limit)}</div>
                    <div><strong>Online:</strong> {selectedCard.is_online_enabled ? 'Enabled' : 'Disabled'}</div>
                    <div><strong>Contactless:</strong> {selectedCard.is_contactless_enabled ? 'Enabled' : 'Disabled'}</div>
                    <div><strong>International:</strong> {selectedCard.is_international_enabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={selectedCard.admin_notes || ''}
                  onChange={(e) => {
                    const updatedCard = { ...selectedCard, admin_notes: e.target.value };
                    setSelectedCard(updatedCard);
                  }}
                  onBlur={(e) => handleUpdateNotes(selectedCard, e.target.value)}
                  placeholder="Add admin notes..."
                  rows={3}
                />
              </div>

              {/* Approval Information */}
              {selectedCard.approved_by && (
                <div>
                  <h4 className="font-semibold mb-2">Approval Information</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Approved by:</strong> Admin #{selectedCard.approved_by}</div>
                    <div><strong>Approved at:</strong> {selectedCard.approved_at ? new Date(selectedCard.approved_at).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Decline'} Virtual Card Application
            </DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div>
                <p><strong>Customer:</strong> {selectedCard.customer_name || 'N/A'}</p>
                <p><strong>Card Type:</strong> {selectedCard.card_type_display || selectedCard.card_type || 'N/A'}</p>
                <p><strong>Daily Limit:</strong> ${formatCurrency(selectedCard.daily_limit)}</p>
                <p><strong>Monthly Limit:</strong> ${formatCurrency(selectedCard.monthly_limit)}</p>
              </div>
              
              <div>
                <Label htmlFor="approval-notes">
                  {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Decline Reason (Required)'}
                </Label>
                <Textarea
                  id="approval-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Add any notes about the approval...' 
                      : 'Please provide a reason for declining...'
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApproval}
                  disabled={actionLoading === selectedCard.id || (approvalAction === 'decline' && !adminNotes.trim())}
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {actionLoading === selectedCard.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : approvalAction === 'approve' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {approvalAction === 'approve' ? 'Approve' : 'Decline'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}