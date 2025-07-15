import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MiniSpinner from "../components/MiniSpinner";
import { authFetch } from "@/lib/utils";
import { DatePicker } from '../components/DatePicker';

interface AddCarFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddCarForm = ({ onSuccess, onCancel }: AddCarFormProps) => {
  const [formData, setFormData] = useState({
    carName: "",
    carBrand: "",
    modelYear: "",
    purchasePrice: "",
    sellerName: "",
    repairCost: "",
    repairStatus: "Pending",
    repairDescription: "",
    governmentFees: "",
    shippingCost: "",
    status: "available",
    datePurchased: "",
    dateSold: "",
    sellingPrice: "",
    profit: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotalInvestment = () => {
    const purchasePrice = Number(formData.purchasePrice) || 0;
    const repairCost = Number(formData.repairCost) || 0;
    const governmentFees = Number(formData.governmentFees) || 0;
    const shippingCost = Number(formData.shippingCost) || 0;
    return purchasePrice + repairCost + governmentFees + shippingCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!formData.carName || !formData.purchasePrice) {
      setError("Car Name and Buy Price are required.");
      setLoading(false);
      return;
    }
    const payload = {
      carName: formData.carName,
      carBrand: formData.carBrand,
      purchasePrice: Number(formData.purchasePrice),
      repairCost: Number(formData.repairCost) || 0,
      governmentFees: Number(formData.governmentFees) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      totalCost: calculateTotalInvestment(),
      status: formData.status || "available",
      datePurchased: formData.datePurchased || undefined,
      dateSold: formData.dateSold || undefined,
      repairDescription: formData.repairDescription || "",
      sellerName: formData.sellerName || "",
      modelYear: formData.modelYear || "",
      sellingPrice: formData.sellingPrice || undefined,
      profit: formData.profit || undefined,
    };
    try {
      const res = await authFetch("http://localhost:5050/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save car");
      }
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save car");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="p-4 bg-accent rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Investment:</span>
          <span className="text-lg font-bold text-primary">{calculateTotalInvestment().toLocaleString()} USD</span>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-semibold" disabled={loading}>
          {loading ? <MiniSpinner /> : 'Add Car'}
        </Button>
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </form>
  );
};

export default AddCarForm; 