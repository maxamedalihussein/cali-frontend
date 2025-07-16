import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MiniSpinner from "../components/MiniSpinner";
import React from "react";
import { DatePicker } from '../components/DatePicker';

interface SaleCar {
  _id: string;
  carName: string;
  carBrand?: string;
  modelYear?: number;
  purchasePrice?: number;
  repairCost?: number;
  governmentFees?: number;
  shippingCost?: number;
  sellingPrice?: number;
  profit?: number;
  totalCost?: number;
  status: string;
  dateSold?: string;
  buyer?: {
    phoneNumber: string;
    email?: string;
  };
  color?: string;
}

interface SellCarFormProps {
  availableCars: SaleCar[];
  selectedCarId: string;
  setSelectedCarId: (id: string) => void;
  selectedCar?: SaleCar;
  totalCost: number;
  profitLoss: number;
  color?: string;
  buyerName: string;
  setBuyerName: (name: string) => void;
  buyerPhone: string;
  setBuyerPhone: (phone: string) => void;
  buyerEmail: string;
  setBuyerEmail: (email: string) => void;
  sellingPrice: string;
  setSellingPrice: (price: string) => void;
  saleDate: string;
  setSaleDate: (date: string) => void;
  formError: string;
  setFormError: (err: string) => void;
  handleRecordSale: (e: React.FormEvent) => void;
  onClose: () => void;
}

const SellCarForm: React.FC<SellCarFormProps> = ({
  availableCars,
  selectedCarId,
  setSelectedCarId,
  selectedCar,
  totalCost,
  profitLoss,
  buyerName,
  setBuyerName,
  buyerPhone,
  setBuyerPhone,
  buyerEmail,
  setBuyerEmail,
  sellingPrice,
  setSellingPrice,
  saleDate,
  setSaleDate,
  formError,
  setFormError,
  handleRecordSale,
}) => {
  const [loading, setLoading] = React.useState(false);

  // Optionally, you can pass loading as a prop if needed

  return (
    <form onSubmit={handleRecordSale} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Car</label>
        <select
          className="w-full border rounded p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all max-w-full"
          value={selectedCarId}
          onChange={e => setSelectedCarId(e.target.value)}
          required
        >
          <option value="">Choose a car...</option>
          {availableCars.map(car => (
            <option key={car._id} value={car._id}>
              {car.carName} ({car.carBrand || "-"}, {car.modelYear || "-"}, {car.color || '-'})
            </option>
          ))}
        </select>
      </div>
      {selectedCar && (
        <div className="bg-muted p-3 rounded space-y-2">
          <div className="font-semibold">{selectedCar.carName}</div>
          <div className="text-sm text-muted-foreground">Brand: {selectedCar.carBrand || "-"}, Model: {selectedCar.modelYear || "-"}, Color: {selectedCar.color || '-'}</div>
          <div className="text-sm">Total Cost: <span className="font-bold">${totalCost.toLocaleString()}</span></div>
          <div className="text-sm">
            Profit/Loss: <span className={profitLoss > 0 ? "text-green-600 font-bold" : profitLoss < 0 ? "text-red-600 font-bold" : "font-bold"}>
              {profitLoss > 0 ? "+" : ""}{profitLoss.toLocaleString()} USD
            </span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Buyer Name</label>
          <Input value={buyerName} onChange={e => setBuyerName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <Input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} type="email" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Selling Price (USD)</label>
          <Input value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} type="number" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sale Date</label>
          <DatePicker value={saleDate ? new Date(saleDate) : null} onChange={d => setSaleDate(d ? d.toISOString().slice(0,10) : '')} placeholder="Sale Date" />
        </div>
      </div>
      {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition" disabled={loading}>
        {loading ? <MiniSpinner className="text-white" /> : 'Save Sale'}
      </Button>
    </form>
  );
};

export default SellCarForm; 