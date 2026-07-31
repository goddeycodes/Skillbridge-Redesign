const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');

// GET /api/credits  — full ledger for current user
exports.getLedger = async (req, res) => {
  try {
    const [transactions, user] = await Promise.all([
      CreditTransaction.findAll({
        where:  { userId: req.user.id },
        order:  [['createdAt', 'DESC']],
        limit:  100,
      }),
      User.findByPk(req.user.id, { attributes: ['credits'] }),
    ]);

    // Running balance from oldest to newest, then reverse for display
    let running = 0;
    const withBalance = [...transactions].reverse().map(t => {
      running += t.amount;
      return { ...t.toJSON(), runningBalance: running };
    });
    withBalance.reverse();

    // Summary stats
    const earned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const spent  = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    res.json({
      success: true,
      balance: user.credits,
      summary: { earned, spent, transactions: transactions.length },
      transactions: withBalance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
