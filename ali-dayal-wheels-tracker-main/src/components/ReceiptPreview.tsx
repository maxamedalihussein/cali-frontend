import React, { forwardRef } from "react";

interface Buyer {
  buyerName?: string;
  phoneNumber?: string;
  address?: string;
}

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
  buyer?: Buyer;
  receiptNumber?: string;
  receiptDate?: string;
  color?: string;
}

interface ReceiptPreviewProps {
  car: Car;
  onClose?: () => void;
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(({ car }, ref) => {
  const receiptNumber = car.receiptNumber || `CAR-${car._id?.slice(-6) || Math.floor(Math.random() * 1000000)}`;
  const exportDate = car.receiptDate ? new Date(car.receiptDate).toLocaleDateString() : new Date().toLocaleDateString();
  const dateOfSale = car.dateSold ? new Date(car.dateSold).toLocaleDateString() : "Pending Sale";
  const buyer = car.buyer || {};

  return (
    <div
      ref={ref}
      className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 text-gray-800 font-sans relative print:max-w-full print:shadow-none print:border-0 overflow-hidden min-h-[600px]"
      style={{
        minHeight: '600px',
        backgroundImage: 'url("/watermark.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {/* White overlay for watermark filtering */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* All content should be above overlay (zIndex 2 or default) */}
      <div className="relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-4 z-10 relative">
          <img src="/publiccali-dayax-logo.png.jpg" alt="CALI DAYAX Logo" className="w-20 h-20 rounded-full mb-2 mx-auto" />
          <h2 className="text-2xl font-bold text-blue-900 mb-1 text-center">Vehicle Purchase & Sales Receipt</h2>
          <div className="text-xs text-gray-500 text-center">Receipt No: <span className="font-semibold">{receiptNumber}</span> &nbsp;|&nbsp; Export Date: <span className="font-semibold">{exportDate}</span></div>
        </div>

        {/* Seller & Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-semibold text-blue-900 mb-1">Seller</div>
            <div className="text-sm">CALI DAYAX MOTORS</div>
            <div className="text-xs text-gray-500">Mogadishu, Somalia</div>
            <div className="text-xs text-gray-500">Phone: +252 61 2345678</div>
          </div>
          <div>
            <div className="font-semibold text-blue-900 mb-1">Buyer</div>
            <div className="text-sm">{buyer.buyerName || <span className="italic text-gray-400">Pending Sale</span>}</div>
            <div className="text-xs text-gray-500">Phone: {buyer.phoneNumber || <span className="italic text-gray-400">-</span>}</div>
            <div className="text-xs text-gray-500">Address: {buyer.address || <span className="italic text-gray-400">-</span>}</div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mb-4">
          <div className="font-semibold text-blue-900 mb-1">Vehicle Information</div>
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <tbody>
              <tr>
                <td className="font-medium">Car Name</td>
                <td className="text-right">{car.carName}</td>
              </tr>
              <tr>
                <td className="font-medium">Brand</td>
                <td className="text-right">{car.carBrand || '-'}</td>
              </tr>
              <tr>
                <td className="font-medium">Year</td>
                <td className="text-right">{car.modelYear || '-'}</td>
              </tr>
              <tr>
                <td className="font-medium">Chassis Number</td>
                <td className="text-right text-gray-400 italic">(optional)</td>
              </tr>
              <tr>
                <td className="font-medium">Color</td>
                <td className="text-right">{car.color || <span className="text-gray-400 italic">(optional)</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown */}
        <div className="mb-4">
          <div className="font-semibold text-blue-900 mb-1">Financial Breakdown</div>
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <tbody>
              <tr>
                <td>Purchase Price</td>
                <td className="text-right">${car.purchasePrice?.toLocaleString() || '-'}</td>
              </tr>
              <tr>
                <td>Repair Cost</td>
                <td className="text-right">${car.repairCost?.toLocaleString() || '-'}</td>
              </tr>
              <tr>
                <td>Government Tax</td>
                <td className="text-right">${car.governmentFees?.toLocaleString() || '-'}</td>
              </tr>
              <tr>
                <td>Import / Shipping Cost</td>
                <td className="text-right">${car.shippingCost?.toLocaleString() || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="font-semibold">Total Investment</td>
                <td className="text-right font-semibold">${car.totalCost?.toLocaleString() || '-'}</td>
              </tr>
              <tr>
                <td>Selling Price</td>
                <td className="text-right">${car.sellingPrice?.toLocaleString() || '-'}</td>
              </tr>
              <tr>
                <td className="font-semibold text-blue-900">Profit</td>
                <td className={`text-right font-bold ${car.profit && car.profit > 0 ? 'text-green-700' : 'text-red-700'}`}>{car.profit !== undefined ? (car.profit > 0 ? '+' : '') + car.profit.toLocaleString() : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer: Signatures and Contact */}
        <div className="mt-8 grid grid-cols-2 gap-8 items-end">
          <div>
            <div className="h-12 border-b border-gray-400 w-40 mb-1" />
            <div className="text-xs text-gray-500">Seller Signature</div>
          </div>
          <div>
            <div className="h-12 border-b border-gray-400 w-40 mb-1" />
            <div className="text-xs text-gray-500">Buyer Signature</div>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          CALI DAYAX MOTORS &bull; Mogadishu, Somalia &bull; +252 61 2345678
        </div>
      </div>
    </div>
  );
});

export default ReceiptPreview; 