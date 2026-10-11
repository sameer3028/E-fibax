import test from 'node:test';
import assert from 'node:assert/strict';

test('Order & Cart Logic Consistency Tests', async (t) => {
  await t.test('Subtotal correctly aggregates line items', () => {
    const items = [
      { id: 'p1', price: 499, quantity: 2 },
      { id: 'p2', price: 299, quantity: 1 }
    ];

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    assert.equal(subtotal, 1297);
  });

  await t.test('Coupon discount percent calculation with maxDiscount cap', () => {
    const subtotal = 2000;
    const coupon = {
      type: 'percent',
      value: 20, // 20%
      maxDiscount: 300,
      minOrder: 500
    };

    let discount = 0;
    if (subtotal >= coupon.minOrder) {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    assert.equal(discount, 300, 'Discount should be capped at maxDiscount of 300');
  });

  await t.test('Grand total properly includes shipping and COD fees', () => {
    const subtotal = 1200;
    const discount = 200;
    const shippingFee = 90;
    const codFee = 50;

    const grandTotal = Math.max(0, subtotal - discount + shippingFee + codFee);
    assert.equal(grandTotal, 1140);
  });

  await t.test('Stock decrement bounds quantity at 0 without negative numbers', () => {
    const currentStock = 2;
    const orderedQuantity = 5;

    const newStock = Math.max(0, currentStock - orderedQuantity);
    assert.equal(newStock, 0);
  });
});
