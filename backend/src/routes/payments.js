const express = require('express');
const { supabase } = require('../utils/supabase');
const squareService = require('../services/squareService');
const router = express.Router();

// Middleware to verify auth token
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get pricing information
router.get('/pricing', async (req, res) => {
  try {
    const pricing = squareService.getAllPricing();
    res.json({ pricing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process payment
router.post('/process', requireAuth, async (req, res) => {
  try {
    const {
      nonce,
      storyType,
      packageType,
      storyId,
      bundleType
    } = req.body;

    // Get pricing
    let pricing;
    if (bundleType) {
      pricing = squareService.getBundlePricing(bundleType);
    } else {
      pricing = squareService.getPricing(storyType, packageType);
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', req.user.id)
      .single();

    // Process payment
    const payment = await squareService.createPayment(
      nonce,
      pricing.amount,
      storyId,
      req.user.id,
      {
        storyType,
        packageType,
        bundleType,
        email: profile?.email
      }
    );

    // Record payment in database
    await supabase.from('payments').insert([{
      user_id: req.user.id,
      story_id: storyId,
      payment_id: payment.paymentId,
      amount: pricing.amount,
      currency: 'USD',
      status: payment.status,
      story_type: storyType,
      package_type: packageType,
      bundle_type: bundleType,
      receipt_url: payment.receiptUrl
    }]);

    // Update story payment status
    if (storyId) {
      await supabase
        .from('stories')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId);
    }

    res.json({
      success: true,
      payment: {
        id: payment.paymentId,
        status: payment.status,
        amount: pricing.displayAmount,
        receiptUrl: payment.receiptUrl
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get payment history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        stories (title, story_type, package_type)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ payments: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request refund
router.post('/refund/:paymentId', requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    // Verify payment belongs to user
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Process refund
    const refund = await squareService.refundPayment(paymentId, amount || payment.amount);

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_id: refund.refundId,
        refunded_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    res.json({
      success: true,
      refund: {
        id: refund.refundId,
        status: refund.status,
        amount: refund.amount
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
