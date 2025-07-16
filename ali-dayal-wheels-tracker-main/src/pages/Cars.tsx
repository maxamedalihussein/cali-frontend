import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Edit, Trash2, Calculator, FileSpreadsheet, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { authFetch } from "@/lib/utils";
import * as XLSX from "xlsx";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';
import { DatePicker } from '../components/DatePicker';

export interface Car {
  id?: string;
  _id?: string;
  carName: string;
  carBrand?: string;
  modelYear: number;
  datePurchased?: string;
  purchasePrice: number;
  sellerName?: string;
  repairCost: number;
  repairDescription?: string;
  repairStatus?: "Pending" | "Completed";
  governmentFees: number;
  shippingCost: number;
  totalCost: number;
  sellingPrice?: number;
  profit?: number;
  status: "available" | "sold";
  dateSold?: string;
  color?: string;
}

const Cars = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, carId: string | null }>({ open: false, carId: null });
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("datePurchased");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [formError, setFormError] = useState("");

  // Filtering and sorting logic (declare filteredCars first!)
  const filteredCars = cars.filter(car => {
    const matchesSearch =
      car.carName.toLowerCase().includes(search.toLowerCase()) ||
      (car.carBrand || "").toLowerCase().includes(search.toLowerCase()) ||
      (car.sellerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (car.modelYear ? car.modelYear.toString().includes(search) : false) ||
      (car.status || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter && statusFilter !== 'all' ? car.status === statusFilter : true;
    const matchesDateFrom = dateFrom ? new Date(car.datePurchased || 0) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(car.datePurchased || 0) <= new Date(dateTo) : true;
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => {
    let aValue = a[sortField] || 0;
    let bValue = b[sortField] || 0;
    if (sortField === "carName" || sortField === "carBrand" || sortField === "sellerName" || sortField === "status") {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    } else {
      // Numeric/date sort
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  // Bulk selection state and handlers
  const allSelected = filteredCars.length > 0 && filteredCars.every(car => selectedCars.includes(car._id || car.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCars([]);
    } else {
      setSelectedCars(filteredCars.map(car => car._id || car.id));
    }
  };
  const toggleSelectCar = (carId: string) => {
    setSelectedCars(selectedCars.includes(carId)
      ? selectedCars.filter(id => id !== carId)
      : [...selectedCars, carId]);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    for (const carId of selectedCars) {
      await authFetch(`http://localhost:5050/api/cars/${carId}`, { method: 'DELETE' });
    }
    setSelectedCars([]);
    setBulkDeleteConfirm(false);
    fetchCars();
  };

  // Bulk export
  const handleBulkExport = () => {
    const exportData = cars.filter(car => selectedCars.includes(car._id || car.id)).map(car => ({
      Name: car.carName,
      Brand: car.carBrand,
      Year: car.modelYear,
      "Buy Price": car.purchasePrice,
      "Repair Cost": car.repairCost,
      "Gov. Fees": car.governmentFees,
      Shipping: car.shippingCost,
      "Total Cost": car.totalCost,
      "Sell Price": car.sellingPrice,
      Profit: car.profit,
      Status: car.status,
      "Date Bought": car.datePurchased ? new Date(car.datePurchased).toLocaleDateString() : '',
      "Date Sold": car.dateSold ? new Date(car.dateSold).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cars");
    XLSX.writeFile(wb, "selected_cars.xlsx");
  };

  // Fetch cars from backend
  const fetchCars = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("http://localhost:5050/api/cars");
      const data = await res.json();
      setCars(data);
    } catch (err) {
      setError("Failed to load cars");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  // Change formData state to all strings
  const initialFormData = {
    carName: "",
    carBrand: "",
    modelYear: "",
    color: "",
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
  };
  const [formData, setFormData] = useState(initialFormData);

  const calculateTotalInvestment = () => {
    const purchasePrice = Number(formData.purchasePrice) || 0;
    const repairCost = Number(formData.repairCost) || 0;
    const governmentFees = Number(formData.governmentFees) || 0;
    const shippingCost = Number(formData.shippingCost) || 0;
    return purchasePrice + repairCost + governmentFees + shippingCost;
  };

  const handleInputChange = (field: keyof Car, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      carName: car.carName || "",
      carBrand: car.carBrand || "",
      modelYear: car.modelYear?.toString() || "",
      color: car.color || "",
      datePurchased: formatDateForInput(car.datePurchased) || "",
      purchasePrice: car.purchasePrice?.toString() || "",
      sellerName: car.sellerName || "",
      repairCost: car.repairCost?.toString() || "",
      repairStatus: car.repairStatus || "Pending",
      repairDescription: car.repairDescription || "",
      governmentFees: car.governmentFees?.toString() || "",
      shippingCost: car.shippingCost?.toString() || "",
      status: car.status || "available",
      totalCost: car.totalCost?.toString() || "",
      sellingPrice: car.sellingPrice?.toString() || "",
      profit: car.profit?.toString() || "",
      dateSold: formatDateForInput(car.dateSold) || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (carId: string) => {
    setDeleteConfirm({ open: true, carId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.carId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`http://localhost:5050/api/cars/${deleteConfirm.carId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete car');
      toast({ title: 'Car Deleted', description: 'Car has been removed from your inventory.' });
      setDeleteConfirm({ open: false, carId: null });
      fetchCars();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete car', variant: 'destructive' });
    }
    setDeleting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormError("");
    setLoading(true);
    // Validation for required fields
    if (!formData.carName || !formData.purchasePrice || !formData.sellerName || !formData.datePurchased) {
      setFormError("Car Name, Buy Price, Seller Name, and Date Bought are required.");
      setLoading(false);
      return;
    }
    // Map frontend fields to backend model fields
    const payload = {
      carName: formData.carName,
      carBrand: formData.carBrand,
      color: formData.color,
      purchasePrice: Number(formData.purchasePrice) || 0,
      repairCost: Number(formData.repairCost) || 0,
      governmentFees: Number(formData.governmentFees) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      totalCost: Number(formData.totalCost) || calculateTotalInvestment(),
      status: formData.status || "available",
      datePurchased: formatDateForInput(formData.datePurchased) || undefined,
      dateSold: formatDateForInput(formData.dateSold) || undefined,
      repairDescription: formData.repairDescription || "",
      sellerName: formData.sellerName || "",
      modelYear: Number(formData.modelYear) || "",
      sellingPrice: Number(formData.sellingPrice) || undefined,
      profit: Number(formData.profit) || undefined,
    };
    try {
      let res;
      if (editingCar && (editingCar._id || editingCar.id)) {
        // Edit mode
        res = await authFetch(`http://localhost:5050/api/cars/${editingCar._id || editingCar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Add mode
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
      toast({ title: editingCar ? "Car updated successfully" : "Car Added Successfully" });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      fetchCars(); // Fetch updated car list
    } catch (err: any) {
      setError(err.message || "Failed to save car");
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingCar(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!cars.length) return;
    const data = cars.map(car => ({
      Name: car.carName,
      Brand: car.carBrand,
      Year: car.modelYear,
      "Buy Price": car.purchasePrice,
      "Repair Cost": car.repairCost,
      "Gov. Fees": car.governmentFees,
      "Shipping": car.shippingCost,
      "Total Cost": car.totalCost,
      "Sell Price": car.sellingPrice,
      Profit: car.profit,
      Status: car.status,
      "Date Bought": car.datePurchased ? new Date(car.datePurchased).toLocaleDateString() : '',
      "Date Sold": car.dateSold ? new Date(car.dateSold).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cars");
    XLSX.writeFile(wb, "cars_inventory.xlsx");
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
  if (editingCar && editingCar.status === 'available' && editingCar.datePurchased) {
    const days = Math.floor((Date.now() - new Date(editingCar.datePurchased).getTime()) / (1000 * 60 * 60 * 24));
      suggestions.push({
        icon: '⏳',
        message: `Car has been unsold for ${days} days`,
        color: 'text-yellow-700'
      });
  }

  if (loading) {
    return <Loading />;
  }

  // Helper to format date for input type="date"
  const formatDateForInput = (date: string) => {
    if (!date) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <div className="space-y-6 bg-background min-h-screen pb-20 md:pb-0">
      {/* Header - move this above filters */}
      <div className="flex items-center justify-between mt-2 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cars Inventory</h1>
          <p className="text-muted-foreground">Manage your car inventory and track investments</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 text-white font-semibold px-2 py-1 rounded shadow hover:bg-green-700 hover:text-white transition text-xs md:px-6 md:py-3 md:rounded-lg md:text-base" onClick={handleExportExcel} disabled={loading}>
            {loading ? <MiniSpinner /> : (<><FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> <span className="md:inline">Export</span><span className="hidden md:inline"> to Excel</span></>)}
          </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white px-2 py-1 rounded shadow hover:bg-blue-700 hover:text-white transition text-xs md:px-6 md:py-3 md:rounded-lg md:text-base" onClick={handleAddNew}>
              <Plus className="mr-1 h-4 w-4 md:h-5 md:w-5" />
              Add Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle>
              <DialogDescription>
                {editingCar ? "Update the car details below" : "Enter all the details for the new car purchase"}
              </DialogDescription>
            </DialogHeader>
                {/* AI Suggestions */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="color">Car Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={e => handleInputChange("color", e.target.value)}
                  placeholder="Enter car color"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carName">Car Name</Label>
                  <Input
                    id="carName"
                      value={formData.carName}
                    onChange={(e) => handleInputChange("carName", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                      value={formData.carBrand}
                    onChange={(e) => handleInputChange("carBrand", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelYear">Model Year</Label>
                  <Input
                    id="modelYear"
                    type="number"
                      value={formData.modelYear}
                    onChange={(e) => handleInputChange("modelYear", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateBought">Date Bought</Label>
                  <Input
                    id="dateBought"
                    type="date"
                    value={formatDateForInput(formData.datePurchased)}
                    onChange={(e) => handleInputChange("datePurchased", e.target.value)}
                    required
                    placeholder="Select date bought"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Buy Price (USD)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                      value={formData.purchasePrice}
                    onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellerName">Seller Name</Label>
                  <Input
                    id="sellerName"
                      value={formData.sellerName}
                    onChange={(e) => handleInputChange("sellerName", e.target.value)}
                    required
                      placeholder="Enter seller name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repairCost">Repair Cost (USD)</Label>
                  <Input
                    id="repairCost"
                    type="number"
                      value={formData.repairCost}
                    onChange={(e) => handleInputChange("repairCost", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="repairStatus">Repair Status</Label>
                  <Select 
                      value={formData.repairStatus} 
                    onValueChange={(value) => handleInputChange("repairStatus", value)}
                  >
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
                <Textarea
                  id="repairDescription"
                    value={formData.repairDescription}
                  onChange={(e) => handleInputChange("repairDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="governmentFees">Government Fees (USD)</Label>
                <Input
                  id="governmentFees"
                  type="number"
                    value={formData.governmentFees}
                  onChange={(e) => handleInputChange("governmentFees", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingCost">Shipping Cost (USD)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                      value={formData.shippingCost}
                    onChange={(e) => handleInputChange("shippingCost", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Selling Price (USD)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                      value={formData.sellingPrice}
                    onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                  />
                </div>
              </div>

              {/* Total Investment Display */}
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Investment:</span>
                  <span className="text-lg font-bold text-green-600">
                    {calculateTotalInvestment().toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:to-red-600 text-white font-bold rounded-full shadow-2xl py-3 text-lg transition" disabled={loading}>
                      {loading ? <MiniSpinner className="text-white" /> : (editingCar ? 'Update Car' : 'Add Car')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      {/* Bulk Actions Bar */}
      {selectedCars.length > 0 && (
        <div className="fixed top-16 left-0 w-full z-30 flex items-center justify-between px-4 py-2 shadow-md animate-fade-in bg-white rounded-b-2xl border-b border-gray-200" style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}>
          <div className="text-gray-800 font-semibold">{selectedCars.length} selected</div>
          <div className="flex gap-2 md:gap-4">
            <Button onClick={() => setBulkDeleteConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow flex items-center gap-1 md:text-sm md:px-5 md:py-2 md:rounded-lg">
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Delete</span>
            </Button>
            <Button onClick={handleBulkExport} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow flex items-center gap-1 md:text-sm md:px-5 md:py-2 md:rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
            <Button variant="outline" onClick={() => setSelectedCars([])} className="bg-white text-gray-800 border border-gray-300 font-semibold text-xs px-3 py-2 rounded-lg shadow flex items-center gap-1 md:text-sm md:px-5 md:py-2 md:rounded-lg">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Clear</span>
            </Button>
          </div>
        </div>
      )}
      {/* Advanced Search & Filter Controls */}
      <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 items-start mb-4 mt-2 w-full">
        <div className="flex w-full gap-2 md:w-auto">
          <div className="flex-1 min-w-0">
            <Label htmlFor="search">Search</Label>
            <Input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Car, Brand, Seller, Year, Status..." className="w-full" />
          </div>
          <div className="w-32">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="flex-1 min-w-0">
            <Label htmlFor="dateFrom">From</Label>
            <DatePicker value={dateFrom ? new Date(dateFrom) : null} onChange={d => setDateFrom(d ? d.toISOString().slice(0,10) : '')} placeholder="From" />
          </div>
          <div className="flex-1 min-w-0">
            <Label htmlFor="dateTo">To</Label>
            <DatePicker value={dateTo ? new Date(dateTo) : null} onChange={d => setDateTo(d ? d.toISOString().slice(0,10) : '')} placeholder="To" />
          </div>
        </div>
        <div>
          <Label>Sort By</Label>
          <div className="flex gap-2">
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datePurchased">Purchase Date</SelectItem>
                <SelectItem value="purchasePrice">Buy Price</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="carName">Car Name</SelectItem>
                <SelectItem value="carBrand">Brand</SelectItem>
                <SelectItem value="sellerName">Seller</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>{sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}</Button>
          </div>
        </div>
      </div>

      {/* Car Cards */}
      <div className="overflow-x-auto space-y-8">
        {/* Available Cars Section */}
        {filteredCars.filter(car => car.status === 'available').length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-green-700">Available Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            <TooltipProvider>
                {filteredCars.filter(car => car.status === 'available').map((car) => (
                  <Card key={car.id || car._id} className="bg-white text-black rounded-2xl shadow p-6 border border-gray-200 relative overflow-visible">
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="w-9 h-9 bg-cyan-200 border-2 border-blue-500 rounded-2xl flex items-center justify-center text-blue-500 shadow-none" onClick={() => handleEdit(car)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" className="w-9 h-9 bg-red-200 border-2 border-red-500 rounded-2xl flex items-center justify-center text-red-500 shadow-none" onClick={() => handleDelete(car._id || car.id || "") }>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedCars.includes(car._id || car.id)}
                        onChange={() => toggleSelectCar(car._id || car.id)}
                        className="accent-blue-600 w-5 h-5"
                      />
                      <span className="text-xs font-semibold text-gray-500">{car.status === 'available' ? 'Available' : 'Sold'}</span>
                    </div>
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-1">{car.carName}</CardTitle>
                      <div className="flex flex-row gap-2 mb-1">
                        <Badge variant={car.status === "available" ? "default" : "secondary"} className={car.status === 'available' ? 'bg-blue-700 text-white' : 'bg-red-500 text-white'}>
                          {car.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-gray-500">{car.carBrand} • {car.modelYear}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Buy Price:</span><span className="font-semibold text-gray-900">{(car.purchasePrice ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Repair Cost:</span><span className="font-semibold text-gray-900">{(car.repairCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Shipping:</span><span className="font-semibold text-gray-900">{(car.shippingCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Government Fees:</span><span className="font-semibold text-gray-900">{(car.governmentFees ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-700 font-semibold">Total Investment:</span><span className="text-lg font-bold text-blue-700">{(car.totalCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Selling Price:</span><span className="font-semibold text-gray-900">{(car.sellingPrice ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-700 font-semibold">Profit:</span><span className={((car.sellingPrice ?? 0) - (car.totalCost ?? 0)) > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{((car.sellingPrice ?? 0) - (car.totalCost ?? 0)).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}
        {/* Sold Cars Section */}
        {filteredCars.filter(car => car.status === 'sold').length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-red-700">Sold Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              <TooltipProvider>
                {filteredCars.filter(car => car.status === 'sold').map((car) => (
                  <Card key={car.id || car._id} className="bg-white text-black rounded-2xl shadow p-6 border border-gray-200 relative overflow-visible">
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" className="w-9 h-9 bg-cyan-200 border-2 border-blue-500 rounded-2xl flex items-center justify-center text-blue-500 shadow-none" onClick={() => handleEdit(car)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" className="w-9 h-9 bg-red-200 border-2 border-red-500 rounded-2xl flex items-center justify-center text-red-500 shadow-none" onClick={() => handleDelete(car._id || car.id || "") }>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedCars.includes(car._id || car.id)}
                        onChange={() => toggleSelectCar(car._id || car.id)}
                        className="accent-blue-600 w-5 h-5"
                      />
                      <span className="text-xs font-semibold text-gray-500">{car.status === 'available' ? 'Available' : 'Sold'}</span>
                      </div>
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-1">{car.carName}</CardTitle>
                      <div className="flex flex-row gap-2 mb-1">
                        <Badge variant={car.status === "available" ? "default" : "secondary"} className={car.status === 'available' ? 'bg-blue-700 text-white' : 'bg-red-500 text-white'}>
                          {car.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-gray-500">{car.carBrand} • {car.modelYear}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Buy Price:</span><span className="font-semibold text-gray-900">{(car.purchasePrice ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Repair Cost:</span><span className="font-semibold text-gray-900">{(car.repairCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Shipping:</span><span className="font-semibold text-gray-900">{(car.shippingCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Government Fees:</span><span className="font-semibold text-gray-900">{(car.governmentFees ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-700 font-semibold">Total Investment:</span><span className="text-lg font-bold text-blue-700">{(car.totalCost ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Selling Price:</span><span className="font-semibold text-gray-900">{(car.sellingPrice ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-700 font-semibold">Profit:</span><span className={((car.sellingPrice ?? 0) - (car.totalCost ?? 0)) > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{((car.sellingPrice ?? 0) - (car.totalCost ?? 0)).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
            </div>
          </div>
          )}
        {/* If no cars at all */}
        {filteredCars.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No cars found matching your criteria.
        </div>
        )}
      </div>

      {/* Total Investment Summary */}
      {cars.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Total Investment</h3>
                  <p className="text-sm text-gray-600">Sum of all cars' purchase prices</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {cars.reduce((total, car) => total + (car.purchasePrice || 0), 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                </div>
                <div className="text-sm text-gray-500">
                  {cars.length} car{cars.length !== 1 ? 's' : ''} in inventory
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={open => setDeleteConfirm({ open, carId: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this car? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, carId: null })} disabled={deleting}>Cancel</Button>
            <Button onClick={confirmDelete} disabled={deleting} className="bg-red-600 text-white font-semibold">
              {deleting ? <MiniSpinner /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Cars</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selectedCars.length} selected cars? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleBulkDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cars;

