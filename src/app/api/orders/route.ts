import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

type OrderItemInput = {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, paymentMethod, notes, items } = body as {
      tableNumber: number;
      paymentMethod: "CASH" | "QRIS";
      notes?: string;
      items: OrderItemInput[];
    };

    // Validasi input
    if (!tableNumber || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Cari atau buat data meja
    let table = await prisma.table.findUnique({
      where: { number: tableNumber },
    });

    if (!table) {
      table = await prisma.table.create({
        data: { number: tableNumber },
      });
    }

    // Hitung total
    const totalAmount = items.reduce(
      (sum: number, item: OrderItemInput) => sum + item.price * item.quantity,
      0,
    );

    const orderNumber = generateOrderNumber();

    // Buat order di database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        paymentMethod: paymentMethod === "QRIS" ? "QRIS" : "CASH",
        totalAmount,
        notes: notes || null,
        orderItems: {
          create: items.map((item: OrderItemInput) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        table: true,
      },
    });

    // Jika CASH, langsung return tanpa Midtrans
    if (paymentMethod === "CASH") {
      return NextResponse.json({ order }, { status: 201 });
    }

    // Jika QRIS/E-Wallet, buat Midtrans Snap Token
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const snapParameter = {
      transaction_details: {
        order_id: orderNumber,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: `Meja ${tableNumber}`,
      },
      item_details: items.map((item: OrderItemInput) => ({
        id: String(item.productId),
        price: item.price,
        quantity: item.quantity,
        name: item.name || `Produk #${item.productId}`,
      })),
      enabled_payments: ["qris", "gopay", "shopeepay", "dana", "ovo"],
    };

    const snapResponse = await snap.createTransaction(snapParameter);

    // Simpan snap token ke order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: snapResponse.token,
        snapRedirectUrl: snapResponse.redirect_url,
      },
    });

    return NextResponse.json(
      {
        order,
        snapToken: snapResponse.token,
        snapRedirectUrl: snapResponse.redirect_url,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 },
    );
  }
}
