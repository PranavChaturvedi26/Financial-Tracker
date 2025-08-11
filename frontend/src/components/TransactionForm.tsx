import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCategories } from "../hooks/useCategories";
import { X } from "lucide-react";
import "../styles/TransactionForm.css";

type TxType = "income" | "expense";

interface FormValues {
  type: TxType;
  amount: number | "";
  category_id: number | "";
  description: string;
  transaction_date: string;
}

interface TransactionFormProps {
  transaction?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: transaction || {
      type: "expense",
      amount: "",
      category_id: "",
      description: "",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const watchType = watch("type");
  const { data: categories } = useCategories(watchType);

  useEffect(() => {
    setValue("category_id", "");
  }, [watchType, setValue]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      amount: parseFloat(data.amount),
      category_id: parseInt(data.category_id),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="transaction-form"
        >
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select {...register("type", { required: "Type is required" })}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              {errors.type && (
                <span className="error">{errors.type.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                {...register("amount", {
                  required: "Amount is required",
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                })}
                placeholder="0.00"
              />
              {errors.amount && (
                <span className="error">{errors.amount.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                {...register("category_id", {
                  required: "Category is required",
                })}
              >
                <option value="">Select a category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="error">{errors.category_id.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                {...register("transaction_date", {
                  required: "Date is required",
                })}
              />
              {errors.transaction_date && (
                <span className="error">{errors.transaction_date.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register("description", {
                maxLength: { value: 500, message: "Description is too long" },
              })}
              placeholder="Enter description (optional)"
              rows={3}
            />
            {errors.description && (
              <span className="error">{errors.description.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {transaction ? "Update" : "Create"} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
