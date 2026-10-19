import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllTransactions, 
  getAllUsers, 
  extendUserSubscription, 
  revokeUserSubscription 
} from '@/lib/payment-store';
import { getAllAccounts } from '@/lib/account-store';

export async function GET() {
  try {
    const transactions = await getAllTransactions();
    const rawUsers = await getAllUsers();
    const accounts = await getAllAccounts();

    // Map each user with decoded password from account-store or default
    const users = rawUsers.map(u => {
      const acc = accounts.find(a => a.email.toLowerCase() === u.email.toLowerCase() || a.id === u.id);
      let plainPassword = u.password || '';
      if (!plainPassword && acc?.passwordHash) {
        try {
          plainPassword = Buffer.from(acc.passwordHash, 'base64').toString('utf-8');
        } catch {
          plainPassword = acc.passwordHash;
        }
      }
      if (!plainPassword) {
        plainPassword = 'password123'; // Default testing password for seeded mock users
      }
      return {
        ...u,
        fullName: acc?.fullName || u.fullName,
        password: plainPassword,
      };
    });

    const totalRevenue = transactions
      .filter(t => t.transaction_status === 'settlement')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeUsers = users.filter(u => u.subscription_status === 'active').length;
    const pendingTransactions = transactions.filter(t => t.transaction_status === 'pending').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        activeUsers,
        totalUsers: users.length,
        totalTransactions: transactions.length,
        pendingTransactions,
      },
      transactions,
      users,
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pembayaran' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, days } = body;

    if (action === 'extend') {
      const updatedUser = await extendUserSubscription(userId, days || 30);
      if (!updatedUser) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Masa aktif berhasil ditambah ${days || 30} hari`, user: updatedUser });
    }

    if (action === 'revoke') {
      const updatedUser = await revokeUserSubscription(userId);
      if (!updatedUser) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Langganan berhasil dicabut/dinonaktifkan', user: updatedUser });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error managing user subscription:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi user' }, { status: 500 });
  }
}

