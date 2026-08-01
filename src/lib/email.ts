import nodemailer from "nodemailer";

// SMTP configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || '"Atelier Concierge" <concierge@atelierstore.com>';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

// Initialize transporter with fallback to Ethereal for local testing
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Email for auto-generated test accounts
  if (!transporterPromise) {
    transporterPromise = (async () => {
      console.log("No SMTP credentials found in environment. Generating Ethereal test account...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        console.log(`Generated Ethereal Email Account:`);
        console.log(`  User: ${testAccount.user}`);
        console.log(`  Pass: ${testAccount.pass}`);
        
        return nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.error("Failed to generate Ethereal email account, falling back to mock logger transporter:", err);
        // Returns a dummy/mock transporter that just logs the email to console
        return {
          sendMail: async (mailOptions: any) => {
            console.log("================= MOCK EMAIL SENT =================");
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
            console.log("====================================================");
            return { messageId: `mock-${Date.now()}` };
          }
        } as any;
      }
    })();
  }
  return transporterPromise;
}

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const transporter = await getTransporter();
    const recipient = order.shippingAddress.email;
    const itemsHtml = order.items
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; color: #1f2937;">${item.productName}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
              ${item.size ? `Size: ${item.size}` : ""} ${item.color ? `• Color: ${item.color}` : ""}
            </div>
          </td>
          <td style="padding: 12px 0; text-align: center; color: #4b5563;">x${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #111827;">PKR ${item.price * item.quantity}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
        <div style="max-w: 600px; margin: 0 auto; bg-color: #ffffff; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background-color: #111827; padding: 32px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Atelier</h1>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; letter-spacing: 0.05em;">ORDER CONFIRMED</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151; line-height: 1.5;">
              Thank you for shopping with us, <strong>${order.shippingAddress.fullName}</strong>. We've received your order and are preparing it with care.
            </p>
            
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; padding-bottom: 4px;">Order Number</td>
                  <td style="color: #6b7280; padding-bottom: 4px; text-align: right;">Order Date</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #111827; font-size: 13px;">${order.id}</td>
                  <td style="font-weight: 700; color: #111827; font-size: 13px; text-align: right;">${order.date}</td>
                </tr>
              </table>
            </div>
            
            <h3 style="font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #374151; margin: 0 0 12px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Items Purchased</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af;">
                  <th style="text-align: left; padding-bottom: 8px; font-weight: 600;">Product</th>
                  <th style="text-align: center; padding-bottom: 8px; font-weight: 600;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <!-- Summary -->
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #4b5563; margin-bottom: 32px;">
              <tr>
                <td style="padding: 4px 0;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right; color: #111827;">PKR ${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Shipping Charges</td>
                <td style="padding: 4px 0; text-align: right; color: #111827;">${order.shipping === 0 ? "Free" : `PKR ${order.shipping.toFixed(2)}`}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb; font-weight: 700; font-size: 14px; color: #111827;">
                <td style="padding: 12px 0 0 0;">Grand Total</td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #111827;">PKR ${order.total.toFixed(2)}</td>
              </tr>
            </table>

            <!-- Shipping Address -->
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; font-size: 13px;">
              <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #374151;">Shipping Address</h4>
              <p style="margin: 0; color: #4b5563; line-height: 1.5;">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">You can track your order using your reference number on our website.</p>
              <p style="font-size: 12px; color: #111827; font-weight: 600; margin: 0;">Order Reference: ${order.id}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.5;">
            &copy; 2026 Atelier Store. All rights reserved.<br>
            New York, NY 10013
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipient,
      subject: `Order Confirmed: ${order.id}`,
      html: htmlContent,
    });

    console.log(`Order confirmation email sent successfully for ${order.id}:`, info.messageId);
    if (info.messageId.startsWith("mock-") === false && SMTP_HOST === "") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Preview email at Ethereal: ${previewUrl}`);
    }
  } catch (error) {
    console.error(`Error sending order confirmation email for ${order.id}:`, error);
  }
}

export async function sendOrderStatusUpdateEmail(order: any) {
  try {
    const transporter = await getTransporter();
    const recipient = order.shippingAddress.email;
    
    let statusTitle = "Order Updated";
    let statusDesc = `Your order status has been updated to <strong>${order.status}</strong>.`;
    
    if (order.status === "Shipped") {
      statusTitle = "Order Shipped";
      statusDesc = `Good news! Your order has been packed and handed over to our shipping courier. It is now on its way to you!`;
    } else if (order.status === "Delivered") {
      statusTitle = "Order Delivered";
      statusDesc = `Your package has been successfully delivered to your shipping address. Thank you for shopping with us!`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${statusTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background-color: #111827; padding: 32px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Atelier</h1>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; letter-spacing: 0.05em;">STATUS UPDATE</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${statusTitle}</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
              Hi ${order.shippingAddress.fullName},<br><br>
              ${statusDesc}
            </p>
            
            <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse; line-height: 1.5;">
                <tr>
                  <td style="color: #6b7280; width: 40%;">Order Reference:</td>
                  <td style="font-weight: 700; color: #111827;">${order.id}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;">New Status:</td>
                  <td style="font-weight: 700; color: #111827;">
                    <span style="background-color: ${order.status === 'Delivered' ? '#d1fae5' : '#dbeafe'}; color: ${order.status === 'Delivered' ? '#065f46' : '#1e40af'}; padding: 2px 8px; border-radius: 9999px; font-size: 11px; text-transform: uppercase; font-weight: bold;">
                      ${order.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="color: #6b7280;">Grand Total:</td>
                  <td style="font-weight: 700; color: #111827;">PKR ${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping Destination -->
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; font-size: 13px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #374151;">Delivery Address</h4>
              <p style="margin: 0; color: #4b5563; line-height: 1.5;">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <p style="font-size: 12px; color: #9ca3af;">Thank you for shopping with the Atelier.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.5;">
            &copy; 2026 Atelier Store. All rights reserved.<br>
            New York, NY 10013
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: recipient,
      subject: `Atelier Order Update: ${order.id} is now ${order.status}`,
      html: htmlContent,
    });

    console.log(`Order status update email sent successfully for ${order.id}:`, info.messageId);
    if (info.messageId.startsWith("mock-") === false && SMTP_HOST === "") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Preview email at Ethereal: ${previewUrl}`);
    }
  } catch (error) {
    console.error(`Error sending order status update email for ${order.id}:`, error);
  }
}
