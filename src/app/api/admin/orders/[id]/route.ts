import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        orderItems: { include: { product: true } },
        table: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal update pesanan" },
      { status: 500 },
    );
  }
}
