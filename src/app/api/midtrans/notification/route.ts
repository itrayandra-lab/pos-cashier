import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Verifikasi notifikasi dari Midtrans
    const statusResponse = await apiClient.transaction.notification(body);

    const orderId: string = statusResponse.order_id;
    const transactionStatus: string = statusResponse.transaction_status;
    const fraudStatus: string = statusResponse.fraud_status;

    let paymentStatus: "PAID" | "UNPAID" | "FAILED" = "UNPAID";
    let orderStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" =
      "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        paymentStatus = "PAID";
        orderStatus = "PROCESSING";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "PAID";
      orderStatus = "PROCESSING";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      paymentStatus = "FAILED";
      orderStatus = "CANCELLED";
    } else if (transactionStatus === "pending") {
      paymentStatus = "UNPAID";
      orderStatus = "PENDING";
    }

    await prisma.order.update({
      where: { orderNumber: orderId },
      data: { paymentStatus, status: orderStatus },
    });

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Notification failed" }, { status: 500 });
  }
}
