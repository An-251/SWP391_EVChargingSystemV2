import { Card, Tag } from "antd";
import { CreditCardOutlined, CalendarOutlined } from "@ant-design/icons";

export default function PaymentInformation() {
  return (
    <>
      <div>
        <Card
          title={
            <div className="flex items-center gap-2">
              <CreditCardOutlined className="text-blue-500" />
              <span>Payment Information</span>
            </div>
          }
          className="shadow-md rounded-xl"
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <Tag color="green">Paid</Tag>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>Visa ending in 4567</span>
            </div>
            <div className="flex justify-between">
              <span>Invoice Number:</span>
              <span>INV-20230515-789</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span>TXN-78901234</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Date:</span>
              <span>
                <CalendarOutlined className="text-gray-500 mr-1" />
                May 15, 2023 - 11:16 AM
              </span>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>$45.34</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>$4.53</span>
              </div>
              <div className="flex justify-between text-lg font-semibold mt-2">
                <span>Total</span>
                <span className="text-green-600">$49.87</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
