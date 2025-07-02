import type { OldCustomer, NewCustomer } from "../types";
import { Button } from "./ui/button";
import { Typography } from "./ui/typography";

type Customer = OldCustomer | NewCustomer;

export const CustomerList = ({
  customers,
  onDelete,
  onEdit,
  title,
}: {
  customers: Customer[];
  onDelete: (customerId: string) => void;
  onEdit: (customer: Customer) => void;
  title: string;
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full md:w-1/2 mb-6 md:mb-0">
      <Typography variant="xl/normal">{title}:</Typography>
      <div className="border rounded-lg p-4 h-full bg-gray-50">
        {customers && customers.length > 0 ? (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {customers.map((customer) => (
              <li
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onEdit(customer)}
                >
                  <div className="text-gray-900 font-medium">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                  <div className="text-xs text-gray-500">
                    ID: {customer.customerId}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatTime(customer.createdAt)}
                  </div>
                  {customer.updatedAt !== customer.createdAt && (
                    <div className="text-xs text-gray-500">
                      Updated: {formatTime(customer.updatedAt)}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(customer.customerId)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="md/thin">No customers found.</Typography>
        )}
      </div>
    </div>
  );
};
