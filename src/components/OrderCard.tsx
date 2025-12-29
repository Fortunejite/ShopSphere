import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package,
  Calendar,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  X,
  Users,
  DollarSign,
  Edit,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderWithProducts } from '@/models/Order';
import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { useAppSelector } from '@/hooks/redux.hook';


export default function OrderCard({ 
  order,
  onStatusUpdate,
  onViewDetails
}: {
  order: OrderWithProducts;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
  onViewDetails: () => void;
}) {
  const shop = useAppSelector(state => state.shop.shop);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning text-warning-foreground',
      confirmed: 'bg-info text-info-foreground',
      processing: 'bg-secondary text-secondary-foreground',
      shipped: 'bg-info text-info-foreground',
      delivered: 'bg-success text-success-foreground',
      cancelled: 'bg-error text-error-foreground',
      refunded: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: X,
      refunded: DollarSign
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="w-3 h-3" />;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning text-warning-foreground',
      paid: 'bg-success text-success-foreground',
      failed: 'bg-error text-error-foreground',
      refunded: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const handleSaveStatus = () => {
    onStatusUpdate(order.tracking_id, newStatus, adminNotes);
    setIsEditingStatus(false);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
              <div className="flex-1">
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    Order #{order.tracking_id}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditingStatus ? (
                      <Badge className={cn('flex items-center gap-1 text-xs', getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    ) : (
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                        className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    )}
                    <Badge className={cn('text-xs', getPaymentStatusColor(order.payment_status))}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="truncate">{order.shipping_address?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 xs:gap-4">
                    <span className="font-medium">{formatCurrency(order.final_amount, shop!.currency)}</span>
                    <span>{order.total_items} items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <div className="relative w-10 h-10 bg-card rounded overflow-hidden border border-border">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex items-center justify-center p-2 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground">
                    +{order.items.length - 3} more
                  </span>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            {isEditingStatus && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this order..."
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            
            {!isEditingStatus ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingStatus(true)}
                className="flex items-center gap-2"
                disabled={order.payment_status === 'pending'}
              >
                <Edit className="w-4 h-4" />
                Update Status
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveStatus}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingStatus(false);
                    setNewStatus(order.status);
                    setAdminNotes(order.admin_notes || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
