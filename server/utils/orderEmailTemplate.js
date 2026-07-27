export const orderEmailTemplate = (order, user) => {
  // Generate a mock delivery date (e.g. 5 days from now)
  const deliveryDate = new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString('en-GB');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; background-color: #ffffff;">
      <!-- Top indigo border -->
      <div style="height: 4px; background-color: #4F46E5; width: 100%;"></div>
      
      <div style="padding: 30px 40px;">
        <h1 style="font-size: 24px; font-weight: normal; margin-top: 0; margin-bottom: 25px; color: #111;">
          Yay! Your Order Is Confirmed
        </h1>
        
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #111;">
          Hi ${user.username}
        </h2>
        
        <p style="font-size: 14px; line-height: 1.5; color: #333; margin-bottom: 35px;">
          Thank you for your order. We will send you a confirmation when your
          order ships. Please find below the receipt of your purchase.
        </p>

        <!-- Table Header -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; padding-bottom: 15px; border-bottom: 1px solid #eaeaea; font-weight: normal; font-size: 14px; color: #555;">Order Details</th>
              <th style="text-align: center; padding-bottom: 15px; border-bottom: 1px solid #eaeaea; font-weight: normal; font-size: 14px; color: #555;">Delivery By</th>
              <th style="text-align: right; padding-bottom: 15px; border-bottom: 1px solid #eaeaea; font-weight: normal; font-size: 14px; color: #555;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item) => {
              // Extract Color and Size from variant attributes if they exist
              let color = '';
              let size = '';
              
              if (item.variant && item.variant.attributes) {
                item.variant.attributes.forEach(attr => {
                  if (attr.attribute?.name?.toLowerCase() === 'color') {
                    color = attr.option?.displayName || color;
                  }
                  if (attr.attribute?.name?.toLowerCase() === 'size') {
                    size = attr.option?.displayName || size;
                  }
                });
              }

              return `
              <tr>
                <td style="padding: 25px 0; vertical-align: top;">
                  <div style="font-weight: 600; font-size: 14px; color: #111; margin-bottom: 8px;">${item.product.title}</div>
                  <div style="font-size: 13px; color: #555; margin-bottom: 4px;">Quantity : ${item.quantity}</div>
                  ${color ? `<div style="font-size: 13px; color: #555; margin-bottom: 4px;">Color : ${color}</div>` : ''}
                  ${size ? `<div style="font-size: 13px; color: #555;">Size : ${size}</div>` : ''}
                </td>
                <td style="padding: 25px 0; text-align: center; vertical-align: middle; font-size: 14px; color: #111; font-weight: 600;">
                  ${deliveryDate}
                </td>
                <td style="padding: 25px 0; text-align: right; vertical-align: middle; font-size: 14px; color: #111; font-weight: 600;">
                  ₹ ${Number(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div style="border-top: 1px dashed #cccccc; padding-top: 25px; margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 60%;"></td>
              <td style="width: 40%;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="text-align: right; padding: 5px 15px 5px 0; font-size: 14px; color: #555;">Total :</td>
                    <td style="text-align: right; padding: 5px 0; font-size: 14px; font-weight: 600; color: #111;">₹ ${Number(order.subtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align: right; padding: 5px 15px 5px 0; font-size: 14px; color: #555;">Shipping Charges :</td>
                    <td style="text-align: right; padding: 5px 0; font-size: 14px; font-weight: 600; color: #111;">₹ 0.00</td>
                  </tr>
                  ${order.discountAmount > 0 ? `
                  <tr>
                    <td style="text-align: right; padding: 5px 15px 5px 0; font-size: 14px; color: #555;">Discount :</td>
                    <td style="text-align: right; padding: 5px 0; font-size: 14px; font-weight: 600; color: #03a685;">- ₹ ${Number(order.discountAmount).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="text-align: right; padding: 10px 15px 0 0; font-size: 15px; font-weight: 600; color: #111;">Grand Total :</td>
                    <td style="text-align: right; padding: 10px 0 0 0; font-size: 15px; font-weight: 600; color: #111;">₹ ${Number(order.totalAmount).toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- Addresses Section -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <tr>
            <td style="width: 48%; vertical-align: top; background-color: #f9f9fb; padding: 20px; border-radius: 4px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #111;">Shipping Address:</div>
              <div style="font-size: 13px; color: #555; line-height: 1.6;">
                ${order.shippingAddress.name}<br/>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}<br/>
                Phone: ${order.shippingAddress.phone}
              </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; vertical-align: top; background-color: #f9f9fb; padding: 20px; border-radius: 4px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #111;">Billing Address:</div>
              <div style="font-size: 13px; color: #555; line-height: 1.6;">
                ${order.shippingAddress.name}<br/>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}<br/>
                Phone: ${order.shippingAddress.phone}
              </div>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="font-size: 14px; color: #555; line-height: 1.6;">
          Hope to see you soon,<br/>
          <strong style="color: #111;">Vyntra Team</strong>
        </div>

      </div>
    </div>
  `;
};
