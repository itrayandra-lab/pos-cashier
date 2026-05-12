import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, image, isAvailable, categoryId } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseInt(price),
        image: image || null,
        isAvailable: isAvailable ?? true,
        categoryId: parseInt(categoryId),
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal membuat produk" },
      { status: 500 },
    );
  }
}
