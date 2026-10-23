import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllTransactions, 
  getAllUsers, 
  extendUserSubscription, 
  revokeUserSubscription 
} from '@/lib/payment-store';
import { getAllAccounts } from '@/lib/account-store';
import { getAdminSessionFromReq } from '@/lib/admin-session';

export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  try {
    const transactions = await getAllTransactions();
    const rawUsers = await getAllUsers();
    const accounts = await getAllAccounts();

    // Kata sandi tidak pernah dikirim ke browser
    const users = rawUsers.map(u => {
      const acc = accounts.find(a => a.email.toLowerCase() === u.email.toLowerCase() || a.id === u.id);
      return {
        ...u,
        fullName: acc?.fullName || u.fullName,
        password: '••••••••',
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
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
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
