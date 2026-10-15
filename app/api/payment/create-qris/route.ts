import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, email } = body;

    const orderId = `KH-10K-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const amount = 10000; // Rp10.000 flat (QRIS & E-Wallet only)

    // Jika server key Midtrans telah diisi, panggil Snap / Core API Midtrans Sandbox
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isMidtransConfigured = Boolean(serverKey && !serverKey.includes('your-key'));

    if (isMidtransConfigured) {
      const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
      
      const midtransPayload = {
        payment_type: 'qris',
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        qris: {
          acquirer: 'gopay',
        },
        customer_details: {
          first_name: 'Pencari Kost',
          email: email || 'user@kosthunt.id',
        },
        item_details: [
          {
            id: 'sub-kost-30d',
            price: 10000,
            quantity: 1,
            name: 'Akses Penuh Kost 30 Hari',
          },
        ],
      };

      try {
        const midtransRes = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(midtransPayload),
        });

        const midtransData = await midtransRes.json();
        if (midtransRes.ok && midtransData.actions) {
          const qrAction = midtransData.actions.find((a: { name: string }) => a.name === 'generate-qr-code');
          return NextResponse.json({
            success: true,
            orderId,
            amount,
            qrString: midtransData.qr_string || '',
            qrImageUrl: qrAction ? qrAction.url : null,
            expiryTime: midtransData.expiry_time,
            isSandbox: true,
          });
        }
      } catch {
        // Fallback ke sandbox simulation jika sandbox midtrans tidak merespon
      }
    }

    // Sandbox / Mock QRIS generator untuk validasi MVP langsung di iFrame
    return NextResponse.json({
      success: true,
      orderId,
      amount,
      qrString: `00020101021226600016ID.CO.QRIS.WWW01189360001400000000000215${orderId}5204581253033605405100005802ID5917KOSTHUNT SURABAYA6008SURABAYA62070703A016304C4F2`,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KOSTHUNT-QRIS-${orderId}`,
      expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      isSandbox: true,
      message: 'Mode Sandbox: Scan dengan GoPay, OVO, ShopeePay, DANA atau klik tombol simulasi bayar',
    });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat tagihan QRIS' }, { status: 500 });
  }
}
