import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Car as CarIcon, DollarSign, TrendingUp, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Cars from "./Cars";
import Sales from "./Sales";
import { authFetch } from "@/lib/utils";
import Loading from '../components/Loading';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import SellCarForm from "./SellCarForm";
import CarForm from "../components/CarForm";
import { Car } from "./Cars";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ActivityLog {
  _id: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  timestamp: string;
}

const Dashboard = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [sales, setSales] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [showAddCar, setShowAddCar] = useState(false);
  const [showSellCar, setShowSellCar] = useState(false);
  const [availableCars, setAvailableCars] = useState<any[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch available cars for sale
  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        const res = await authFetch("http://localhost:5050/api/cars?status=available");
        const data = await res.json();
        setAvailableCars(data);
      } catch (err) {
        setAvailableCars([]);
      }
    };
    if (showSellCar) fetchAvailableCars();
  }, [showSellCar]);

  const selectedCar = availableCars.find(car => car._id === selectedCarId);
  const totalCost = selectedCar ?
    (selectedCar.purchasePrice || 0) + (selectedCar.repairCost || 0) + (selectedCar.governmentFees || 0) + (selectedCar.shippingCost || 0)
    : 0;
  const profitLoss = sellingPrice ? Number(sellingPrice) - totalCost : 0;

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
      setShowSellCar(false);
      setSelectedCarId("");
      setBuyerName("");
      setBuyerPhone("");
      setBuyerEmail("");
      setSellingPrice("");
      setSaleDate("");
    } catch (err: any) {
      setFormError(err.message || "Failed to record sale");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const carsRes = await authFetch("http://localhost:5050/api/cars");
        const carsData = await carsRes.json();
        setCars(carsData);
                  const salesRes = await authFetch("http://localhost:5050/api/cars/sales");
        const salesData = await salesRes.json();
        setSales(salesData);
        // Fetch recent activity logs
                  const activityRes = await authFetch("http://localhost:5050/api/activity-log?limit=10");
        const activityData = await activityRes.json();
        setActivity(activityData);
      } catch (err) {
        setError("Failed to load dashboard data");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalCarsBought = cars.length;
  const totalCarsSold = sales.length;
  const totalProfit = sales.reduce((sum, car) => sum + (car.profit || 0), 0);

  // Chart Data Preparation
  const salesByMonth: { [key: string]: { profit: number; count: number } } = {};
  sales.forEach((sale) => {
    if (!sale || !sale.dateSold) return;
    const date = new Date(sale.dateSold);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!salesByMonth[month]) salesByMonth[month] = { profit: 0, count: 0 };
    salesByMonth[month].profit += sale.profit || 0;
    salesByMonth[month].count += 1;
  });
  const months = Object.keys(salesByMonth).sort();
  const salesCounts = months.map((m) => salesByMonth[m].count);
  const profits = months.map((m) => salesByMonth[m].profit);

  const salesLineData = {
    labels: months,
    datasets: [
      {
        label: 'Cars Sold',
        data: salesCounts,
        borderColor: '#2563eb', // CALI DAYAX blue
        backgroundColor: 'rgba(37,99,235,0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
  const profitLineData = {
    labels: months,
    datasets: [
      {
        label: 'Profit (USD)',
        data: profits,
        borderColor: profits.every(p => p >= 0) ? '#22c55e' : '#dc2626', // green if all profit, red if any loss
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: profits.map(p => p >= 0 ? '#22c55e' : '#dc2626'),
        pointBorderColor: profits.map(p => p >= 0 ? '#22c55e' : '#dc2626'),
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e5e7eb' } },
    },
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header - move this above filters */}
      <div className="flex items-center justify-between mt-2 mb-4">
        <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="text-sm text-muted-foreground">Welcome to CALI DAYAX Car Sales Dashboard</div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddCar} onOpenChange={setShowAddCar}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition" onClick={() => setShowAddCar(true)}>
                <Plus className="w-4 h-4" /> Add Car
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-full overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
              </DialogHeader>
              <CarForm mode="add" onSuccess={() => { setShowAddCar(false); /* Optionally refresh car list here */ }} onCancel={() => setShowAddCar(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={showSellCar} onOpenChange={setShowSellCar}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition" onClick={() => setShowSellCar(true)}>
                <Users className="w-4 h-4" /> Sell Car
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>Sell Car</DialogTitle>
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
                onClose={() => setShowSellCar(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border border-blue-500 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-blue-700">Total Cars Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalCarsSold}</div>
            <p className="text-sm text-blue-600">Successfully sold</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border border-blue-500 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-blue-700">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{cars.filter(car => car.status !== 'sold').length}</div>
            <p className="text-sm text-blue-600">Cars in inventory</p>
          </CardContent>
        </Card>
        <Card className={`${totalProfit >= 0 ? 'bg-green-50 border border-green-500' : 'bg-red-50 border border-red-500'} rounded-lg shadow-sm`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()} <span className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>USD</span></div>
            <p className={`text-sm ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{totalProfit >= 0 ? 'You are in profit!' : 'You are in loss.'}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-500 rounded-lg shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-black">Total Investment:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${cars.reduce((total, car) => total + (car.purchasePrice || 0), 0).toLocaleString()} USD</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={salesLineData} options={chartOptions} height={220} />
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Profit by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={profitLineData} options={{
              ...chartOptions,
              elements: { line: { borderWidth: 2 }, point: { radius: 3 } },
              plugins: {
                ...chartOptions.plugins,
                legend: { display: true, position: 'top' },
              },
              scales: chartOptions.scales,
            }} height={220} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="text-muted-foreground">No recent activity.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activity.map((log) => (
                <li key={log._id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-medium text-blue-700">{log.user}</span> 
                    <span className="text-gray-700">{log.action}</span> 
                    <span className="font-medium text-red-700">{log.entity}</span>
                    {log.details && log.details.carName && (
                      <span className="ml-1 text-gray-500">({log.details.carName})</span>
                    )}
                    {log.details && log.details.buyerName && (
                      <span className="ml-1 text-gray-500">({log.details.buyerName})</span>
                    )}
                    {log.details && log.details.newEmail && (
                      <span className="ml-1 text-gray-500">(new email: {log.details.newEmail})</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 md:mt-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;