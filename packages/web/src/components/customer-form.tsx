import React, { useState, useEffect } from "react";
import type {
  OldCustomer,
  NewCustomer,
  CreateOldCustomer,
  CreateNewCustomer,
} from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Typography } from "./ui/typography";

type Customer = OldCustomer | NewCustomer;
type CreateCustomer = CreateOldCustomer | CreateNewCustomer;

export const CustomerForm = ({
  customer,
  onSubmit,
  onCancel,
  title,
  isLoading = false,
}: {
  customer?: Customer;
  onSubmit: (customerData: CreateCustomer) => void;
  onCancel: () => void;
  title: string;
  isLoading?: boolean;
}) => {
  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    customerId: "",
    name: "",
    email: "",
  });

  // Populate form when editing existing customer
  useEffect(() => {
    if (customer) {
      setFormData({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
      });
    } else {
      setFormData({
        customerId: "",
        name: "",
        email: "",
      });
    }
    setErrors({ customerId: "", name: "", email: "" });
  }, [customer]);

  const validateForm = () => {
    const newErrors = {
      customerId: "",
      name: "",
      email: "",
    };

    if (!formData.customerId.trim()) {
      newErrors.customerId = "Customer ID is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      customerId: formData.customerId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
    });
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const handleCancel = () => {
    setFormData({ customerId: "", name: "", email: "" });
    setErrors({ customerId: "", name: "", email: "" });
    onCancel();
  };

  return (
    <div className="w-full md:w-1/2">
      <Typography variant="xl/normal" className="mb-2">
        {title}
      </Typography>
      <div className="border rounded-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Customer ID *
            </Label>
            <Input
              type="text"
              value={formData.customerId}
              onChange={handleInputChange("customerId")}
              placeholder="e.g., cust_123"
              disabled={!!customer || isLoading} // Disable when editing
              className={errors.customerId ? "border-red-500" : ""}
            />
            {errors.customerId && (
              <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
            )}
            {customer && (
              <p className="text-gray-500 text-xs mt-1">
                Customer ID cannot be changed when editing
              </p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder="e.g., John Doe"
              disabled={isLoading}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="e.g., john@example.com"
              disabled={isLoading}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? "Saving..."
                : customer
                  ? "Update Customer"
                  : "Create Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>

        {customer && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Typography variant="sm/thin" className="text-gray-600">
              <strong>Created:</strong>{" "}
              {new Date(customer.createdAt).toLocaleString()}
            </Typography>
            {customer.updatedAt !== customer.createdAt && (
              <Typography variant="sm/thin" className="text-gray-600">
                <strong>Last Updated:</strong>{" "}
                {new Date(customer.updatedAt).toLocaleString()}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
