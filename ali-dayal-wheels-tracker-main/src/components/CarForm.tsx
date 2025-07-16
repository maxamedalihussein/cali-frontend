import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MiniSpinner from "../components/MiniSpinner";
import { authFetch } from "@/lib/utils";
import { DatePicker } from './DatePicker';

export interface CarFormProps {
  mode: "add" | "edit";
  initialValues?: any;
  editingCar?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const CarForm = ({ mode, initialValues, editingCar, onSuccess, onCancel }: CarFormProps) => {
  const [formData, setFormData] = useState(initialValues || {
    carName: "",
    carBrand: "",
    modelYear: "",
    datePurchased: "",
    purchasePrice: "",
    sellerName: "",
    repairCost: "",
    repairStatus: "Pending",
    repairDescription: "",
    governmentFees: "",
    shippingCost: "",
    status: "available",
    totalCost: "",
    sellingPrice: "",
    profit: "",
    dateSold: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (editingCar) {
      setFormData({
        carName: editingCar.carName || "",
        carBrand: editingCar.carBrand || "",
        modelYear: editingCar.modelYear?.toString() || "",
        datePurchased: editingCar.datePurchased || "",
        purchasePrice: editingCar.purchasePrice?.toString() || "",
        sellerName: editingCar.sellerName || "",
        repairCost: editingCar.repairCost?.toString() || "",
        repairStatus: editingCar.repairStatus || "Pending",
        repairDescription: editingCar.repairDescription || "",
        governmentFees: editingCar.governmentFees?.toString() || "",
        shippingCost: editingCar.shippingCost?.toString() || "",
        status: editingCar.status || "available",
        totalCost: editingCar.totalCost?.toString() || "",
        sellingPrice: editingCar.sellingPrice?.toString() || "",
        profit: editingCar.profit?.toString() || "",
        dateSold: editingCar.dateSold || "",
      });
    }
  }, [editingCar]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const calculateTotalInvestment = () => {
    const purchasePrice = Number(formData.purchasePrice) || 0;
    const repairCost = Number(formData.repairCost) || 0;
    const governmentFees = Number(formData.governmentFees) || 0;
    const shippingCost = Number(formData.shippingCost) || 0;
    return purchasePrice + repairCost + governmentFees + shippingCost;
  };

  // AI-powered suggestions
  const suggestions: { icon: string; message: string; color: string }[] = [];
  const totalCost = calculateTotalInvestment();
  const sellingPrice = Number(formData.sellingPrice) || 0;
  if (sellingPrice && sellingPrice < totalCost) {
    suggestions.push({
      icon: '⚠️',
      message: 'Selling below cost!',
      color: 'text-red-600'
    });
  }
  if (totalCost && (!sellingPrice || sellingPrice < totalCost * 1.1)) {
    suggestions.push({
      icon: '💡',
      message: `Suggested Price: $${(totalCost * 1.1).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      color: 'text-blue-700'
    });
  }
  if (formData.shippingCost && formData.purchasePrice && Number(formData.shippingCost) > 0.3 * Number(formData.purchasePrice)) {
    suggestions.push({
      icon: '🚢',
      message: 'Warning: High shipping vs car price',
      color: 'text-orange-600'
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    if (!formData.carName || !formData.purchasePrice || !formData.sellerName || !formData.datePurchased) {
      setFormError("Car Name, Buy Price, Seller Name, and Date Bought are required.");
      setLoading(false);
      return;
    }
    const payload = {
      carName: formData.carName,
      carBrand: formData.carBrand,
      purchasePrice: Number(formData.purchasePrice) || 0,
      repairCost: Number(formData.repairCost) || 0,
      governmentFees: Number(formData.governmentFees) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      totalCost: calculateTotalInvestment(),
      status: formData.status || "available",
      datePurchased: formData.datePurchased || undefined,
      dateSold: formData.dateSold || undefined,
      repairDescription: formData.repairDescription || "",
      sellerName: formData.sellerName || "",
      modelYear: Number(formData.modelYear) || "",
      sellingPrice: Number(formData.sellingPrice) || undefined,
      profit: Number(formData.profit) || undefined,
    };
    try {
      let res;
      if (mode === "edit" && editingCar && (editingCar._id || editingCar.id)) {
        res = await authFetch(`http://localhost:5050/api/cars/${editingCar._id || editingCar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch("http://localhost:5050/api/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save car");
      }
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setFormError(err.message || "Failed to save car");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {suggestions.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 my-2 space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 font-medium ${s.color}`}>
              <span className="text-xl">{s.icon}</span> {s.message}
            </div>
          ))}
        </div>
      )}
      {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="carName">Car Name</Label>
          <Input id="carName" value={formData.carName} onChange={e => handleInputChange("carName", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" value={formData.carBrand} onChange={e => handleInputChange("carBrand", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="modelYear">Model Year</Label>
          <Input id="modelYear" type="number" value={formData.modelYear} onChange={e => handleInputChange("modelYear", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="dateBought">Date Bought</Label>
          <DatePicker value={formData.datePurchased ? new Date(formData.datePurchased) : null} onChange={d => handleInputChange('datePurchased', d ? d.toISOString().slice(0,10) : '')} placeholder="Date Bought" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchasePrice">Buy Price (USD)</Label>
          <Input id="purchasePrice" type="number" value={formData.purchasePrice} onChange={e => handleInputChange("purchasePrice", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="sellerName">Seller Name</Label>
          <Input id="sellerName" value={formData.sellerName} onChange={e => handleInputChange("sellerName", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="repairCost">Repair Cost (USD)</Label>
          <Input id="repairCost" type="number" value={formData.repairCost} onChange={e => handleInputChange("repairCost", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="repairStatus">Repair Status</Label>
          <Select value={formData.repairStatus} onValueChange={value => handleInputChange("repairStatus", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="repairDescription">Repair Description</Label>
        <Textarea id="repairDescription" value={formData.repairDescription} onChange={e => handleInputChange("repairDescription", e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="governmentFees">Government Fees (USD)</Label>
          <Input id="governmentFees" type="number" value={formData.governmentFees} onChange={e => handleInputChange("governmentFees", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="shippingCost">Shipping Cost (USD)</Label>
          <Input id="shippingCost" type="number" value={formData.shippingCost} onChange={e => handleInputChange("shippingCost", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sellingPrice">Selling Price (USD)</Label>
          <Input id="sellingPrice" type="number" value={formData.sellingPrice} onChange={e => handleInputChange("sellingPrice", e.target.value)} />
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Investment:</span>
          <span className="text-lg font-bold text-green-600">{calculateTotalInvestment().toLocaleString()} USD</span>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition" disabled={loading}>
          {loading ? <MiniSpinner className="text-white" /> : (mode === "edit" ? 'Update Car' : 'Add Car')}
        </Button>
      </div>
    </form>
  );
};

export default CarForm; 