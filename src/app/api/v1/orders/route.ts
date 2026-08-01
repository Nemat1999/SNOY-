import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { authGuard } from "../../../../lib/authGuard";
import { sendOrderConfirmationEmail } from "../../../../lib/email";

// GET /api/v1/orders - Retrieve all orders (Admin secure route)
export async function GET(req: Request) {
  try {
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    if (!db?.Order) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const orders = await db.Order.findAll({
      order: [["createdAt", "DESC"]]
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/orders - Create a new order (public client checkout)
export async function POST(req: Request) {
  try {
    if (!db?.Order) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      id,
      date,
      items,
      subtotal,
      shipping,
      total,
      shippingAddress
    } = body;

    // Validate fields
    if (!id || !items || !shippingAddress || subtotal === undefined || total === undefined) {
      return NextResponse.json(
        { error: "Missing required order parameters" },
        { status: 400 }
      );
    }

    // Create the order record in PostgreSQL
    const newOrder = await db.Order.create({
      id,
      date: date || new Date().toISOString().split("T")[0],
      items,
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      total: parseFloat(total),
      shippingAddress,
      status: "Processing"
    });

    // Send order confirmation email asynchronously
    // Using simple async function invocation to not block API response
    sendOrderConfirmationEmail(newOrder.toJSON()).catch((emailErr) => {
      console.error("Background confirmation email trigger failed:", emailErr);
    });

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error?.message },
      { status: 500 }
    );
  }
}
