const axios = require('axios');

async function testOrder() {
  try {
    const payload = {
      shippingAddress: {
        phoneNumber: '0712345678',
        city: 'Nairobi',
        area: 'Westlands',
        detailedAddress: 'Test Address 123'
      },
      guestName: 'Guest User',
      guestEmail: 'guest@example.com',
      items: [
        {
          productId: '550e8400-e29b-41d4-a716-446655440000', // we will use slug if needed, wait, frontend sends item.product.id
          quantity: 1
        }
      ],
      paymentMethod: 'COD'
    };

    const response = await axios.post('http://localhost:5000/api/orders', payload, {
      headers: {
        'x-session-id': 'session_test123'
      }
    });
    console.log("SUCCESS:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("HTTP ERROR:", error.response.status);
      console.log("DATA:", error.response.data);
    } else {
      console.log("NETWORK ERROR:", error.message);
    }
  }
}

testOrder();
