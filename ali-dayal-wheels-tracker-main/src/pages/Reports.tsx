import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ReceiptPublic from "@/components/ReceiptPublic";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { authFetch } from "@/lib/utils";
import Loading from '../components/Loading';
import MiniSpinner from '../components/MiniSpinner';

interface Car {
  _id: string;
  carName: string;
  carBrand?: string;
  modelYear?: number;
  purchasePrice?: number;
  repairCost?: number;
  governmentFees?: number;
  shippingCost?: number;
  totalCost?: number;
  sellingPrice?: number;
  profit?: number;
  status: string;
  datePurchased?: string;
  dateSold?: string;
  buyer?: {
    buyerName: string;
    phoneNumber: string;
    email?: string;
  };
}

const Reports = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [summary, setSummary] = useState({ totalCarsSold: 0, totalCarsBought: 0, totalProfit: 0, totalInvestment: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCar, setPreviewCar] = useState<Car | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);



  const downloadReceiptAsPDF = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const carsRes = await authFetch("http://localhost:5050/api/cars");
      const carsData = await carsRes.json();
      setCars(carsData);
              const summaryRes = await authFetch("http://localhost:5050/api/reports/summary");
      const summaryData = await summaryRes.json();
      setSummary({
        totalCarsSold: summaryData.totalCarsSold,
        totalCarsBought: summaryData.totalCarsBought,
        totalProfit: summaryData.totalProfit,
        totalInvestment: carsData.reduce((sum: number, car: Car) => sum + (car.totalCost || 0), 0)
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering
  const filteredCars = cars.filter(car => {
    const matchesStatus = statusFilter === "all" || car.status === statusFilter;
    const matchesSearch =
      car.carName.toLowerCase().includes(search.toLowerCase()) ||
      (car.carBrand?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (car.buyer?.buyerName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-100 border-l-4 border-blue-700">
          <CardHeader>
            <CardTitle>Total Cars Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{summary.totalCarsSold}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle>Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{summary.totalCarsBought - summary.totalCarsSold}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-100 border-l-4 border-red-700">
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">+{summary.totalProfit.toLocaleString()} USD</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle>Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">${summary.totalInvestment.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="available">Available</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search by car, brand, or buyer"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {/* Optional: Export all filtered as PDF/CSV */}
        {/* <Button className="bg-blue-700 text-white">Export All as PDF</Button> */}
      </div>

      {/* Table of Cars */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-blue-50">
              <th className="text-left p-3 font-medium">Car Name</th>
              <th className="text-left p-3 font-medium">Brand</th>
              <th className="text-left p-3 font-medium">Year</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Buyer</th>
              <th className="text-left p-3 font-medium">Total Cost</th>
              <th className="text-left p-3 font-medium">Profit</th>
              <th className="text-left p-3 font-medium">Sale Date</th>
              <th className="text-left p-3 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center p-6">Loading...</td></tr>
            ) : filteredCars.length === 0 ? (
              <tr><td colSpan={9} className="text-center p-6">No cars found.</td></tr>
            ) : (
              filteredCars.map(car => (
                <tr key={car._id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="p-3 font-semibold">{car.carName}</td>
                  <td className="p-3">{car.carBrand || '-'}</td>
                  <td className="p-3">{car.modelYear || '-'}</td>
                  <td className="p-3">{car.status === 'sold' ? <span className="text-red-700 font-bold">Sold</span> : <span className="text-blue-700 font-bold">Available</span>}</td>
                  <td className="p-3">{car.buyer?.buyerName || '-'}</td>
                  <td className="p-3">${car.totalCost?.toLocaleString() || '-'}</td>
                  <td className={`p-3 font-semibold ${car.profit && car.profit >= 0 ? "text-green-700" : "text-red-700"}`}>{car.profit !== undefined ? (car.profit > 0 ? "+" : "") + car.profit.toLocaleString() : '-'}</td>
                  <td className="p-3">{car.dateSold ? new Date(car.dateSold).toLocaleDateString() : '-'}</td>
                  <td className="p-3">
                      <Button size="sm" className="bg-blue-700 text-white px-3 py-1 text-sm" onClick={() => setPreviewCar(car)}>
                        Preview
                      </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Receipt Preview Modal for Sold Cars */}
      <Dialog open={!!previewCar} onOpenChange={open => !open && setPreviewCar(null)}>
        <DialogContent className="max-w-2xl w-full p-0 bg-transparent shadow-none border-0 overflow-y-auto transition-all duration-300 ease-in-out transform-gpu">
          {previewCar && (
            <div className="bg-white rounded-xl shadow-lg p-4 relative min-h-[600px] max-h-[90vh] overflow-y-auto animate-fade-in">
              <ReceiptPublic car={previewCar} ref={receiptRef} />
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8 pt-4 border-t border-gray-200">
                {/* @ts-ignore: react-to-print types may be outdated or missing */}
                <Button
                  className="bg-blue-700 text-white w-full sm:w-auto"
                  onClick={() => downloadReceiptAsPDF(receiptRef, `Receipt_${previewCar.carName}.pdf`)}
                >
                  Download Receipt as PDF
                </Button>
                <Button className="bg-red-600 text-white w-full sm:w-auto" onClick={() => setPreviewCar(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports; 