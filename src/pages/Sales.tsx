import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, FileSpreadsheet, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/utils";
import * as XLSX from "xlsx";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';
import { TooltipProvider } from "@/components/ui/tooltip";
import SellCarForm from "./SellCarForm";
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
    buyerName: string;
    phoneNumber: string;
    email?: string;
  };
}

const Sales = () => {
  const [sales, setSales] = useState<SaleCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("dateSold");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableCars, setAvailableCars] = useState<SaleCar[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const allSelected = sales.length > 0 && sales.every(sale => selectedSales.includes(sale._id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSales([]);
    } else {
      setSelectedSales(sales.map(sale => sale._id));
    }
  };
  const toggleSelectSale = (saleId: string) => {
    setSelectedSales(selectedSales.includes(saleId)
      ? selectedSales.filter(id => id !== saleId)
      : [...selectedSales, saleId]);
  };

  // Bulk delete
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const handleBulkDelete = async () => {
    for (const saleId of selectedSales) {
              await authFetch(`http://localhost:5050/api/buyers/${saleId}`, { method: 'DELETE' });
    }
    setSelectedSales([]);
    setBulkDeleteConfirm(false);
    fetchSales();
  };

  // Bulk export
  const handleBulkExport = () => {
    const exportData = sales.filter(sale => selectedSales.includes(sale._id)).map(sale => ({
      Name: sale.carName,
      Brand: sale.carBrand,
      Model: sale.modelYear,
      "Sell Price": sale.sellingPrice,
      Profit: sale.profit,
      Buyer: sale.buyer?.buyerName || '',
      Phone: sale.buyer?.phoneNumber || '',
      "Date Sold": sale.dateSold ? new Date(sale.dateSold).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "selected_sales.xlsx");
  };

  const fetchSales = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("http://localhost:5050/api/cars/sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setError("Failed to load sales");
    }
    setLoading(false);
  };

  // Fetch available cars for sale
  const fetchAvailableCars = async () => {
    try {
      const res = await authFetch("http://localhost:5050/api/cars?status=available");
      const data = await res.json();
      setAvailableCars(data);
    } catch (err) {
      setAvailableCars([]);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchAvailableCars();
  }, []);

  // Filtering and sorting logic
  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      sale.carName.toLowerCase().includes(search.toLowerCase()) ||
      (sale.carBrand || "").toLowerCase().includes(search.toLowerCase()) ||
      (sale.modelYear ? sale.modelYear.toString().includes(search) : false) ||
      (sale.buyer?.buyerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (sale.buyer?.phoneNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (sale.status || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter && statusFilter !== 'all' ? sale.status === statusFilter : true;
    const matchesDateFrom = dateFrom ? new Date(sale.dateSold || 0) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(sale.dateSold || 0) <= new Date(dateTo) : true;
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => {
    let aValue = a[sortField] || 0;
    let bValue = b[sortField] || 0;
    if (sortField === "dateSold" || sortField === "sellingPrice" || sortField === "profit" || sortField === "purchasePrice" || sortField === "repairCost" || sortField === "governmentFees" || sortField === "shippingCost") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    if (sortField === "carName" || sortField === "carBrand" || sortField === "status" || sortField === "buyerName" || sortField === "phoneNumber") {
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

  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalSales = filteredSales.length;

  // Find selected car details
  const selectedCar = availableCars.find(car => car._id === selectedCarId);

  // Calculate total cost for selected car
  const totalCost = selectedCar ?
    (selectedCar.purchasePrice || 0) + (selectedCar.repairCost || 0) + (selectedCar.governmentFees || 0) + (selectedCar.shippingCost || 0)
    : 0;
  // Calculate profit/loss
  const profitLoss = sellingPrice ? Number(sellingPrice) - totalCost : 0;

  // Handle Record Sale submit
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!selectedCarId || !buyerName || !buyerPhone || !sellingPrice || !saleDate) {
      setFormError("All fields are required.");
      return;
    }
    try {
      const payload = {
        buyerName,
        phoneNumber: buyerPhone,
        email: buyerEmail,
        carBought: selectedCarId,
        sellingPrice: Number(sellingPrice),
        dateSold: saleDate
      };
      const res = await authFetch("http://localhost:5050/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record sale");
      }
      setIsDialogOpen(false);
      setSelectedCarId("");
      setBuyerName("");
      setBuyerPhone("");
      setBuyerEmail("");
      setSellingPrice("");
      setSaleDate("");
      fetchSales();
      fetchAvailableCars();
    } catch (err: any) {
      setFormError(err.message || "Failed to record sale");
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!sales.length) return;
    const data = sales.map(sale => ({
      Name: sale.carName,
      Brand: sale.carBrand,
      Model: sale.modelYear,
      "Sell Price": sale.sellingPrice,
      Profit: sale.profit,
      Buyer: sale.buyer?.buyerName || '',
      Phone: sale.buyer?.phoneNumber || '',
      "Date Sold": sale.dateSold ? new Date(sale.dateSold).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "sales_records.xlsx");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Bulk Actions Bar */}
      {selectedSales.length > 0 && (
        <div className="fixed top-0 left-0 w-full z-30 bg-blue-700 text-white flex items-center justify-between px-4 py-2 shadow-md animate-fade-in">
          <div>{selectedSales.length} selected</div>
          <div className="flex gap-2">
            <Button onClick={() => setBulkDeleteConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold">Delete Selected</Button>
            <Button onClick={handleBulkExport} className="bg-green-600 hover:bg-green-700 text-white font-semibold">Export Selected</Button>
            <Button variant="outline" onClick={() => setSelectedSales([])} className="text-white border-white">Clear</Button>
          </div>
        </div>
      )}
      {/* Header - move this above filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>
          <p className="text-muted-foreground">Track car sales and profit margins</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg text-base md:px-6 md:py-3 md:rounded-lg md:text-base px-3 py-2 rounded-md text-sm" onClick={handleExportExcel} disabled={loading}>
            {loading ? <MiniSpinner /> : (<><FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Excel</>)}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark rounded-tr-[20px] rounded-br-[20px] rounded-tl-none rounded-bl-none" >Record Sale</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
              </DialogHeader>
              <SellCarForm
                availableCars={availableCars}
                selectedCarId={selectedCarId}
                setSelectedCarId={setSelectedCarId}
                selectedCar={selectedCar}
                totalCost={totalCost}
                profitLoss={profitLoss}
                buyerName={buyerName}
                setBuyerName={setBuyerName}
                buyerPhone={buyerPhone}
                setBuyerPhone={setBuyerPhone}
                buyerEmail={buyerEmail}
                setBuyerEmail={setBuyerEmail}
                sellingPrice={sellingPrice}
                setSellingPrice={setSellingPrice}
                saleDate={saleDate}
                setSaleDate={setSaleDate}
                formError={formError}
                setFormError={setFormError}
                handleRecordSale={handleRecordSale}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Advanced Search & Filter Controls */}
      <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 items-start mb-4 mt-0 w-full">
        <div className="flex w-full gap-2 md:w-auto">
          <div className="flex-1 min-w-0">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
            <Input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Car, Brand, Model, Buyer, Phone, Status..." className="w-full" />
          </div>
          <div className="w-32">
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="flex-1 min-w-0">
            <label htmlFor="dateFrom" className="block text-sm font-medium mb-1">From</label>
            <DatePicker value={dateFrom ? new Date(dateFrom) : null} onChange={d => setDateFrom(d ? d.toISOString().slice(0,10) : '')} placeholder="From" />
          </div>
          <div className="flex-1 min-w-0">
            <label htmlFor="dateTo" className="block text-sm font-medium mb-1">To</label>
            <DatePicker value={dateTo ? new Date(dateTo) : null} onChange={d => setDateTo(d ? d.toISOString().slice(0,10) : '')} placeholder="To" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <div className="flex gap-2">
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateSold">Sale Date</SelectItem>
                <SelectItem value="sellingPrice">Sell Price</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="carName">Car Name</SelectItem>
                <SelectItem value="carBrand">Brand</SelectItem>
                <SelectItem value="modelYear">Model</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="buyerName">Buyer</SelectItem>
                <SelectItem value="phoneNumber">Phone</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>{sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border border-blue-500 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-700">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalSales}</div>
            <p className="text-sm text-blue-600">Cars sold</p>
          </CardContent>
        </Card>
        <Card className={`${totalProfit >= 0 ? 'bg-green-50 border border-green-500' : 'bg-red-50 border border-red-500'} rounded-lg shadow-sm`}>
          <CardHeader>
            <CardTitle className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>+{totalProfit.toLocaleString()} <span className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>USD</span></div>
            <p className={`text-sm ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>Net profit earned</p>
          </CardContent>
        </Card>
      </div>

          <div className="overflow-x-auto">
        <table className="w-full text-sm">
              <thead>
            <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Car Name</th>
              <th className="text-left p-3 font-medium">Brand</th>
              <th className="text-left p-3 font-medium">Model</th>
                  <th className="text-left p-3 font-medium">Sell Price</th>
                  <th className="text-left p-3 font-medium">Profit</th>
              <th className="text-left p-3 font-medium">Buyer</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Date Sold</th>
                </tr>
              </thead>
              <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center p-6">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center text-red-500 p-6">{error}</td></tr>
            ) : filteredSales.length === 0 ? (
              <tr><td colSpan={8} className="text-center p-6">No sales found.</td></tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale._id} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="p-3 font-semibold">{sale.carName}</td>
                  <td className="p-3">{sale.carBrand || '-'}</td>
                  <td className="p-3">{sale.modelYear || '-'}</td>
                  <td className="p-3 font-semibold">{(sale.sellingPrice ?? 0).toLocaleString()} USD</td>
                  <td className={`p-3 font-semibold ${sale.profit && sale.profit >= 0 ? "text-success" : "text-destructive"}`}>{(sale.profit ?? 0).toLocaleString()} USD</td>
                  <td className="p-3">{sale.buyer?.buyerName || '-'}</td>
                  <td className="p-3">{sale.buyer?.phoneNumber || '-'}</td>
                  <td className="p-3">{sale.dateSold ? new Date(sale.dateSold).toLocaleDateString() : '-'}</td>
                  </tr>
              ))
            )}
          </tbody>
        </table>
            </div>
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Sales</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selectedSales.length} selected sales? This action cannot be undone.</DialogDescription>
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

export default Sales;