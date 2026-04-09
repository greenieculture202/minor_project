const express = require('express');
const Faq = require('../models/Faq');
const router = express.Router();

// Get all FAQs; seed if empty
router.get('/', async (req, res) => {
  try {
    const count = await Faq.countDocuments();
    if (count < 5) {
      if (count > 0) await Faq.deleteMany({}); // Clear existing partial seed
      const initialFaqs = [
        { question: 'Do you deliver only within India or overseas?', answer: 'Currently, we only ship within India to ensure plant health. We are working on international shipping compliance.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'Can I choose the delivery time?', answer: 'Standard delivery is between 9 AM and 9 PM. You can choose a preferred date at checkout, but specific time slots are only available for "Express" orders.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'Can I get my order delivered at midnight?', answer: 'Yes, midnight delivery is available for special occasions depending on your city. Extra charges apply.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'Do you deliver on Sundays and Public Holidays?', answer: 'Yes, we deliver on Sundays and most public holidays. However, delivery availability depends on the courier partners.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'What constitutes a flexible delivery charge?', answer: 'Flexible charges apply when you choose specific time slots like Midnight or Fixed Time delivery.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'How are the plants packaged for delivery?', answer: 'We use specially designed ventilated boxes that keep the plant upright and secure during transit.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'What if I am not at home when the delivery arrives?', answer: 'Our partner will call you. They may leave it with a neighbor or security, or re-attempt the next day.', category: 'Delivery Information', updatedAt: new Date('2026-01-24') },
        { question: 'How do I cancel my order?', answer: 'You can cancel from "My Orders" within 2 hours of placement. After that, please contact support.', category: 'Order Modification', updatedAt: new Date('2026-01-24') },
        { question: 'Can I change my delivery address?', answer: 'Address changes are possible if the order has not been dispatched yet. Contact support immediately.', category: 'Order Modification', updatedAt: new Date('2026-01-24') },
        { question: 'Can I change the message on the gift card?', answer: 'Yes, if the order isn\'t packed, you can update the message by contacting Customer Support.', category: 'Order Modification', updatedAt: new Date('2026-01-24') },
        { question: 'Can I add more items to my existing order?', answer: 'No, you must place a new order for additional items.', category: 'Order Modification', updatedAt: new Date('2026-01-24') },
        { question: 'What is your return policy?', answer: 'If damaged, send a photo within 24h for replacement. We don\'t accept returns for healthy plants.', category: 'Return and Refund', updatedAt: new Date('2026-01-24') },
        { question: 'When will I get my refund?', answer: 'Refunds are processed within 5-7 business days to the original payment method.', category: 'Return and Refund', updatedAt: new Date('2026-01-24') },
        { question: 'What if I receive a different product?', answer: 'Apologies for the mix-up. Share a picture, and we will dispatch the correct item immediately.', category: 'Return and Refund', updatedAt: new Date('2026-01-24') },
        { question: 'The pot is broken, but the plant is fine. What do I do?', answer: 'Send us a picture of the broken pot, and we will ship a replacement pot immediately.', category: 'Return and Refund', updatedAt: new Date('2026-01-24') },
        { question: 'What payment methods do you accept?', answer: 'We accept Credit/Debit cards, UPI, Net Banking, and Wallets.', category: 'Payment Related', updatedAt: new Date('2026-01-24') },
        { question: 'Is Cash on Delivery (COD) available?', answer: 'Yes, COD is available for most locations for orders up to ₹5000.', category: 'Payment Related', updatedAt: new Date('2026-01-24') },
        { question: 'Is it safe to use my credit card?', answer: 'Absolutely. We use industry-standard SSL encryption to protect your information.', category: 'Payment Related', updatedAt: new Date('2026-01-24') },
        { question: 'Do you offer EMI options?', answer: 'Yes, EMI is available for orders above ₹3000 on select credit cards.', category: 'Payment Related', updatedAt: new Date('2026-01-24') },
        { question: 'Which plant should a beginner buy?', answer: 'We recommend Snake Plants, ZZ Plants, or Pothos for their minimal care needs.', category: 'Plant Care Queries', updatedAt: new Date('2026-01-24') },
        { question: 'Is the plant delivered with the pot?', answer: 'Yes, all plants come potted in either a nursery pot or your selected premium pot.', category: 'Plant Care Queries', updatedAt: new Date('2026-01-24') },
        { question: 'Are indoor plants safe for pets?', answer: 'Some are toxic. Check our "Pet Friendly" category for safe options like Spider Plants.', category: 'Plant Care Queries', updatedAt: new Date('2026-01-24') },
        { question: 'Can I send a plant anonymously?', answer: 'Yes! Just mention it in the special instructions during checkout.', category: 'Gifting & Corporate', updatedAt: new Date('2026-01-24') },
        { question: 'Do you handle corporate bulk orders?', answer: 'Yes, we specialize in corporate gifting. Email corporate@greenie.com for a quote.', category: 'Gifting & Corporate', updatedAt: new Date('2026-01-24') }
      ];
      await Faq.insertMany(initialFaqs);
    }
    const faqs = await Faq.find().sort({ updatedAt: -1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create an FAQ
router.post('/', async (req, res) => {
  try {
    const newFaq = new Faq(req.body);
    const savedFaq = await newFaq.save();
    res.json(savedFaq);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an FAQ
router.put('/:id', async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFaq);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an FAQ
router.delete('/:id', async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
