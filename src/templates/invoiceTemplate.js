const invoiceTemplate = (order) => {

    const products = order.items.map((item) => `
        <tr>
            <td>${item.product.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join("");

    return `
<!DOCTYPE html>
<html>
<head>

<style>

body{
    font-family: Arial, sans-serif;
    margin:40px;
}

table{
    width:100%;
    border-collapse:collapse;
}

th,td{
    border:1px solid #ddd;
    padding:10px;
    text-align:left;
}

th{
    background:#f4f4f4;
}

.header{
    text-align:center;
}

.total{
    text-align:right;
    margin-top:20px;
    font-size:18px;
    font-weight:bold;
}

</style>

</head>

<body>

<div class="header">

<h1>E-Commerce Store</h1>

<h3>Invoice</h3>

</div>

<p><strong>Order ID:</strong> ${order._id}</p>

<p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>

<p><strong>Customer:</strong> ${order.user.name}</p>

<p><strong>Email:</strong> ${order.user.email}</p>

<h3>Shipping Address</h3>

<p>

${order.shippingAddress.address}<br>

${order.shippingAddress.city}<br>

${order.shippingAddress.postalCode}<br>

${order.shippingAddress.country}

</p>

<table>

<thead>

<tr>

<th>Product</th>

<th>Quantity</th>

<th>Price</th>

<th>Total</th>

</tr>

</thead>

<tbody>

${products}

</tbody>

</table>

<div class="total">

Grand Total : ₹${order.totalPrice.toFixed(2)}

</div>

<br>

<hr>

<p style="text-align:center">

Thank you for shopping with us ❤️

</p>

</body>

</html>

`;

}

module.exports = invoiceTemplate;