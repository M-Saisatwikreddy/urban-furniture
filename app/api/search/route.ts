import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({
        results: [],
      });
    }

    const [invoices, customers, products, vendors, accounts] =
      await Promise.all([
        prisma.invoice.findMany({
          where: {
            invoiceNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          select: {
            invoiceNumber: true,
            id: true,
          },
          take: 5,
        }),

        prisma.customer.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          select: {
            name: true,
            id: true,
          },
          take: 5,
        }),

        prisma.product.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          select: {
            name: true,
            id: true,
          },
          take: 5,
        }),

        prisma.vendor.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          select: {
            name: true,
            id: true,
          },
          take: 5,
        }),

        prisma.account.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            name: true,
            code: true,
            id: true,
          },
          take: 5,
        }),
      ]);

    const results = [
      ...invoices.map((invoice) => ({
        type: "Invoice" as const,
        name: invoice.invoiceNumber,
        href: `/invoices`,
      })),

      ...customers.map((customer) => ({
        type: "Customer" as const,
        name: customer.name,
        href: `/customers`,
      })),

      ...products.map((product) => ({
        type: "Product" as const,
        name: product.name,
        href: `/products`,
      })),

      ...vendors.map((vendor) => ({
        type: "Vendor" as const,
        name: vendor.name,
        href: `/vendors`,
      })),

      ...accounts.map((account) => ({
        type: "Account" as const,
        name: `${account.code} — ${account.name}`,
        href: `/accounts`,
      })),
    ];

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      {
        results: [],
        error: "Search failed",
      },
      {
        status: 500,
      }
    );
  }
}