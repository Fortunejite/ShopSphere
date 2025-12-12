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
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderWithProducts } from '@/models/Order';
import { useState } from 'react';


export default function OrderCard({ 
  order, 
  onStatusUpdate, 
  onPaymentUpdate, 
  onViewDetails 
}: {
  order: OrderWithProducts;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
  onPaymentUpdate: (id: string, status: string) => void;
  onViewDetails: () => void;
}) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">
                    Order #{order.tracking_id}
                  </h3>
                  {!isEditingStatus ? (
                    <Badge className={cn('flex items-center gap-1', getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  ) : (
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  )}
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{order.shipping_address?.name || 'N/A'}</span>
                  </div>
                  <span>${order.final_amount.toFixed(2)}</span>
                  <span>{order.total_items} items</span>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="relative w-10 h-10 bg-white rounded overflow-hidden">
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
                    <p className="text-xs text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">
                    +{order.items.length - 3} more
                  </span>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            {isEditingStatus && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {order.payment_status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaymentUpdate(order.tracking_id, 'paid')}
                className="text-green-600 hover:text-green-700"
              >
                Mark Paid
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
