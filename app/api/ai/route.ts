import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured",
        },
        { status: 500 }
      );
    }

    const normalizedMessage = message.toLowerCase();

    let databaseContext = "";

    // 1. Total sales
    if (
      normalizedMessage.includes("total sales") ||
      normalizedMessage.includes("total sale")
    ) {
      const result = await prisma.invoice.aggregate({
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      });

      const totalSales = result._sum.totalAmount ?? 0;
      const invoiceCount = result._count.id;

      databaseContext = `
Actual accounting data from Urban Furniture:

Total sales: ₹${Number(totalSales).toLocaleString("en-IN")}
Number of invoices: ${invoiceCount}
`;
    }

    // 2. Customer outstanding / accounts receivable
    else if (
      normalizedMessage.includes("owe") ||
      normalizedMessage.includes("outstanding") ||
      normalizedMessage.includes("receivable") ||
      normalizedMessage.includes("due from customers") ||
      normalizedMessage.includes("customers owe")
    ) {
      const invoices = await prisma.invoice.findMany({
        select: {
          totalAmount: true,
          paidAmount: true,
        },
      });

      const totalInvoiced = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalAmount),
        0
      );

      const totalPaid = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.paidAmount),
        0
      );

      const outstanding = totalInvoiced - totalPaid;

      databaseContext = `
Actual accounting data from Urban Furniture:

Total invoiced: ₹${totalInvoiced.toLocaleString("en-IN")}
Total paid: ₹${totalPaid.toLocaleString("en-IN")}
Outstanding amount customers owe: ₹${outstanding.toLocaleString("en-IN")}
`;
    }

    // 3. Overdue invoices
    else if (
      normalizedMessage.includes("overdue") ||
      normalizedMessage.includes("over due") ||
      normalizedMessage.includes("late invoice") ||
      normalizedMessage.includes("late invoices")
    ) {
      const now = new Date();

      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            notIn: ["PAID", "CANCELLED"],
          },
        },
        select: {
          invoiceNumber: true,
          dueDate: true,
          totalAmount: true,
          paidAmount: true,
          status: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      if (overdueInvoices.length === 0) {
        databaseContext = `
Actual accounting data from Urban Furniture:

There are currently no overdue invoices.
`;
      } else {
        const overdueDetails = overdueInvoices
          .map((invoice) => {
            const outstanding =
              Number(invoice.totalAmount) - Number(invoice.paidAmount);

            const dueDate = invoice.dueDate
              ? invoice.dueDate.toLocaleDateString("en-IN")
              : "No due date";

            return `
Invoice: ${invoice.invoiceNumber}
Customer: ${invoice.customer.name}
Due date: ${dueDate}
Invoice amount: ₹${Number(invoice.totalAmount).toLocaleString("en-IN")}
Paid: ₹${Number(invoice.paidAmount).toLocaleString("en-IN")}
Outstanding: ₹${outstanding.toLocaleString("en-IN")}
Status: ${invoice.status}
`;
          })
          .join("\n");

        databaseContext = `
Actual accounting data from Urban Furniture:

Number of overdue invoices: ${overdueInvoices.length}

${overdueDetails}
`;
      }
    }

    // 4. Low-stock products
    else if (
      normalizedMessage.includes("low stock") ||
      normalizedMessage.includes("low in stock") ||
      normalizedMessage.includes("low inventory") ||
      normalizedMessage.includes("low on stock") ||
      normalizedMessage.includes("running low") ||
      normalizedMessage.includes("inventory")
    ) {
      const products = await prisma.product.findMany({
        select: {
          name: true,
          sku: true,
          stock: true,
          reorderLevel: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      const lowStockProducts = products
        .filter((product) => product.stock <= product.reorderLevel)
        .sort((a, b) => a.stock - b.stock);

      if (lowStockProducts.length === 0) {
        databaseContext = `
Actual inventory data from Urban Furniture:

There are currently no products with low stock.
`;
      } else {
        const productDetails = lowStockProducts
          .map(
            (product) => `
Product: ${product.name}
SKU: ${product.sku}
Category: ${product.category.name}
Current stock: ${product.stock}
Reorder level: ${product.reorderLevel}
`
          )
          .join("\n");

        databaseContext = `
Actual inventory data from Urban Furniture:

Number of low-stock products: ${lowStockProducts.length}

${productDetails}
`;
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are the AI accounting and inventory assistant for Urban Furniture.

Answer the user's question clearly and briefly.

User question:
${message}

${databaseContext || "No relevant accounting data was found for this question."}

Important:
- Use the provided database data when available.
- Never invent numbers, products, SKUs, customers, dates, or statuses.
- If there are multiple records, summarize them clearly using bullet points.
- If there are no matching records, say so clearly.
- If the requested feature is not supported, say so clearly.
- Keep the answer concise and professional.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      success: true,
      response: response.text,
    });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}