import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-guards';
import { sendEmail, getTransporter } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    try {
        const { to } = await req.json();
        if (!to) return NextResponse.json({ error: 'Target email required' }, { status: 400 });

        // First attempt a hard verify of the connection
        const transporter = await getTransporter();
        await transporter.verify();

        const subject = "APPAREL EMPORIUM: SMTP Connection Successful";
        const html = `
            <h2>System Test Passed</h2>
            <p>Your SMTP credentials configured via the Admin panel are working correctly.</p>
            <hr />
            <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        `;

        await sendEmail(to, subject, html);
        return NextResponse.json({ success: true, message: "Connection verified and test email dispatched." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
