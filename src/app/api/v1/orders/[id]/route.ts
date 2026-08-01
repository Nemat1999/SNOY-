import { NextResponse } from "next/server";
import db from "../../../../../lib/db";
import { authGuard } from "../../../../../lib/authGuard";
import { sendOrderStatusUpdateEmail } from "../../../../../lib/email";

// GET /api/v1/orders/[id] - Retrieve single order (Publicly readable for tracking)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!db?.Order) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const order = await db.Order.findByPk(id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("GET Single Order Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT /api/v1/orders/[id] - Update order status (Admin secure route)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard(req, "basic");
    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;

    if (!db?.Order) {
      return NextResponse.json(
        { error: "Database service unavailable" },
        { status: 500 }
      );
    }

    const order = await db.Order.findByPk(id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["Processing", "Shipped", "Delivered"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Allowed: 'Processing', 'Shipped', 'Delivered'" },
        { status: 400 }
      );
    }

    // Update status in PostgreSQL
    await order.update({ status });

    // Send status update notification email asynchronously
    sendOrderStatusUpdateEmail(order.toJSON()).catch((emailErr) => {
      console.error("Background status update email trigger failed:", emailErr);
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("PUT Order Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: error?.message },
      { status: 500 }
    );
  }
}
