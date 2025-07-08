import { useState, useEffect } from "react";
import { CustomerForm } from "@/components/customer-form";
import type {
  OldCustomer,
  NewCustomer,
  CreateOldCustomer,
  CreateNewCustomer,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export const Route = createFileRoute({
  component: CustomersPage,
});

type TabType = "v1" | "v2";

function CustomersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("v1");
  const [oldCustomers, setOldCustomers] = useState<OldCustomer[]>([]);
  const [newCustomers, setNewCustomers] = useState<NewCustomer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<
    OldCustomer | NewCustomer | null
  >(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Load customers on component mount and tab change
  useEffect(() => {
    loadCustomers();
  }, [activeTab]);

  const loadCustomers = async () => {
    setIsLoadingList(true);
    try {
      if (activeTab === "v1") {
        await loadOldCustomers();
      } else {
        await loadNewCustomers();
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadOldCustomers = async () => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "v1/customers",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const customers = await response.json();
      setOldCustomers(customers);
    } else {
      throw new Error("Failed to fetch v1 customers");
    }
  };

  const loadNewCustomers = async () => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "v2/customers",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const customers = await response.json();
      setNewCustomers(customers);
    } else {
      throw new Error("Failed to fetch v2 customers");
    }
  };

  const handleCreateCustomer = async (
    customerData: CreateOldCustomer | CreateNewCustomer
  ) => {
    setIsLoadingForm(true);
    try {
      const endpoint = activeTab === "v1" ? "v1/customers" : "v2/customers";
      const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        if (activeTab === "v1") {
          setOldCustomers((prev) => [...prev, newCustomer]);
        } else {
          setNewCustomers((prev) => [...prev, newCustomer]);
        }
        setEditingCustomer(null);
      } else {
        throw new Error("Failed to create customer");
      }
    } catch (error) {
      console.error("Create customer error:", error);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleUpdateCustomer = async (
    customerData: CreateOldCustomer | CreateNewCustomer
  ) => {
    if (!editingCustomer) return;

    setIsLoadingForm(true);
    try {
      const endpoint =
        activeTab === "v1"
          ? `v1/customers/${editingCustomer.customerId}`
          : `v2/customers/${editingCustomer.customerId}`;

      const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
        }),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        if (activeTab === "v1") {
          setOldCustomers((prev) =>
            prev.map((c) =>
              c.customerId === editingCustomer.customerId ? updatedCustomer : c
            )
          );
        } else {
          setNewCustomers((prev) =>
            prev.map((c) =>
              c.customerId === editingCustomer.customerId ? updatedCustomer : c
            )
          );
        }
        setEditingCustomer(null);
      } else {
        throw new Error("Failed to update customer");
      }
    } catch (error) {
      console.error("Update customer error:", error);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const endpoint =
        activeTab === "v1"
          ? `v1/customers/${customerId}`
          : `v2/customers/${customerId}`;

      const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        if (activeTab === "v1") {
          setOldCustomers((prev) =>
            prev.filter((c) => c.customerId !== customerId)
          );
        } else {
          setNewCustomers((prev) =>
            prev.filter((c) => c.customerId !== customerId)
          );
        }
        // Clear editing state if we're deleting the customer being edited
        if (editingCustomer?.customerId === customerId) {
          setEditingCustomer(null);
        }
      } else {
        console.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Delete customer error:", error);
    }
  };

  const handleEditCustomer = (customer: OldCustomer | NewCustomer) => {
    setEditingCustomer(customer);
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
  };

  const handleSubmit = (
    customerData: CreateOldCustomer | CreateNewCustomer
  ) => {
    if (editingCustomer) {
      handleUpdateCustomer(customerData);
    } else {
      handleCreateCustomer(customerData);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setEditingCustomer(null); // Clear editing state when switching tabs
  };

  const currentCustomers = activeTab === "v1" ? oldCustomers : newCustomers;
  const formTitle = editingCustomer
    ? `Edit ${activeTab.toUpperCase()} Customer`
    : `Create New ${activeTab.toUpperCase()} Customer`;

  return (
    <div className="max-w-6xl mx-auto">
      <Typography
        variant="4xl/normal"
        color="secondary"
        as="h1"
        className="mb-6"
      >
        Customer Management
      </Typography>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === "v1" ? "secondary" : "outline"}
          onClick={() => handleTabChange("v1")}
          disabled={isLoadingList}
        >
          V1 Customers (Old)
        </Button>
        <Button
          variant={activeTab === "v2" ? "secondary" : "outline"}
          onClick={() => handleTabChange("v2")}
          disabled={isLoadingList}
        >
          V2 Customers (New)
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left side - Customer list */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <Typography variant="xl/normal">
            {`${activeTab.toUpperCase()} Customers`}:
          </Typography>
          <div className="border rounded-lg p-4 h-full bg-gray-50">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-8">
                <Typography variant="md/thin">Loading customers...</Typography>
              </div>
            ) : currentCustomers && currentCustomers.length > 0 ? (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {currentCustomers.map((customer) => (
                  <li
                    key={customer.customerId}
                    className="flex items-center justify-between p-3 bg-white rounded border"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <div className="text-gray-900 font-medium">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {customer.customerId}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(customer.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {customer.updatedAt !== customer.createdAt && (
                        <div className="text-xs text-gray-500">
                          Updated:{" "}
                          {new Date(customer.updatedAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeleteCustomer(customer.customerId)
                        }
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

        {/* Right side - Customer form */}
        <CustomerForm
          customer={editingCustomer || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          title={formTitle}
          isLoading={isLoadingForm}
        />
      </div>
    </div>
  );
}
