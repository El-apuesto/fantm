const { Client, Environment } = require('square');
const { v4: uuidv4 } = require('uuid');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox';

const client = new Client({
  accessToken: SQUARE_ACCESS_TOKEN,
  environment: SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox
});

const paymentsApi = client.paymentsApi;
const ordersApi = client.ordersApi;

// Pricing configuration
const PRICING = {
  novella: {
    normal: 1300, // $13.00 in cents
    premium: 1500
  },
  novel: {
    normal: 2100,
    premium: 2300
  },
  memoir: {
    normal: 1700,
    premium: 1900
  },
  autobiography: {
    normal: 2600,
    premium: 2800
  },
  bundles: {
    two_premium_novels: 3900,
    three_premium_novels: 6300
  }
};

class SquareService {
  /**
   * Get pricing for a story type and package
   */
  getPricing(storyType, packageType) {
    const type = storyType.toLowerCase();
    
    if (PRICING[type] && PRICING[type][packageType]) {
      return {
        amount: PRICING[type][packageType],
        currency: 'USD',
        displayAmount: `$${(PRICING[type][packageType] / 100).toFixed(2)}`
      };
    }
    
    throw new Error(`Invalid pricing for ${storyType} ${packageType}`);
  }

  /**
   * Get bundle pricing
   */
  getBundlePricing(bundleType) {
    if (PRICING.bundles[bundleType]) {
      return {
        amount: PRICING.bundles[bundleType],
        currency: 'USD',
        displayAmount: `$${(PRICING.bundles[bundleType] / 100).toFixed(2)}`
      };
    }
    
    throw new Error(`Invalid bundle type: ${bundleType}`);
  }

  /**
   * Create a payment
   */
  async createPayment(nonce, amount, storyId, userId, metadata = {}) {
    const idempotencyKey = uuidv4();

    try {
      const response = await paymentsApi.createPayment({
        sourceId: nonce,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amount),
          currency: 'USD'
        },
        referenceId: storyId,
        note: `fantm.ink - Story generation: ${metadata.storyType} (${metadata.packageType})`,
        buyerEmailAddress: metadata.email
      });

      return {
        success: true,
        paymentId: response.result.payment.id,
        status: response.result.payment.status,
        receiptUrl: response.result.payment.receiptUrl,
        amount: response.result.payment.amountMoney.amount,
        createdAt: response.result.payment.createdAt
      };
    } catch (error) {
      console.error('Square payment error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Create an order for tracking
   */
  async createOrder(items, metadata = {}) {
    const idempotencyKey = uuidv4();

    const lineItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity || '1',
      basePriceMoney: {
        amount: BigInt(item.amount),
        currency: 'USD'
      }
    }));

    try {
      const response = await ordersApi.createOrder({
        idempotencyKey,
        order: {
          locationId: process.env.SQUARE_LOCATION_ID,
          lineItems,
          metadata
        }
      });

      return {
        orderId: response.result.order.id,
        total: response.result.order.totalMoney.amount
      };
    } catch (error) {
      console.error('Square order error:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId, amount) {
    const idempotencyKey = uuidv4();

    try {
      const response = await client.refundsApi.refundPayment({
        idempotencyKey,
        paymentId,
        amountMoney: {
          amount: BigInt(amount),
          currency: 'USD'
        }
      });

      return {
        refundId: response.result.refund.id,
        status: response.result.refund.status,
        amount: response.result.refund.amountMoney.amount
      };
    } catch (error) {
      console.error('Square refund error:', error);
      throw error;
    }
  }

  /**
   * Get all pricing options
   */
  getAllPricing() {
    return {
      novella: {
        normal: { amount: 1300, display: '$13.00' },
        premium: { amount: 1500, display: '$15.00' }
      },
      novel: {
        normal: { amount: 2100, display: '$21.00' },
        premium: { amount: 2300, display: '$23.00' }
      },
      memoir: {
        normal: { amount: 1700, display: '$17.00' },
        premium: { amount: 1900, display: '$19.00' }
      },
      autobiography: {
        normal: { amount: 2600, display: '$26.00' },
        premium: { amount: 2800, display: '$28.00' }
      },
      bundles: {
        two_premium_novels: { amount: 3900, display: '$39.00', savings: '$7.00' },
        three_premium_novels: { amount: 6300, display: '$63.00', savings: '$6.00' }
      }
    };
  }
}

module.exports = new SquareService();
