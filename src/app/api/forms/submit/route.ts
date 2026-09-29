import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getTransporter } from '@/lib/email';
import { logActivity } from '@/lib/activity-logger';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { formSubmissionSchema } from '@/lib/validations/submissions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const rateLimit = checkRateLimit(`form_submit:${clientIp}`, 10, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parseResult = formSubmissionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Valid formId and data required' }, { status: 400 });
        }

        const { formId, data } = parseResult.data;
        if (!formId) {
            return NextResponse.json({ error: 'Form ID required' }, { status: 400 });
        }

        // 1. Get Form Details
        const form = await prisma.customForm.findUnique({
            where: { id: formId }
        });

        if (!form || !form.isActive) {
            return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
        }

        // 2. Create Submission Record
        const submission = await prisma.formSubmission.create({
            data: {
                formId,
                data: JSON.stringify(data),
                ipAddress: clientIp,
            }
        });

        // 3. Send Email Notification (Async)
        if (form.submitEmail) {
            try {
                const subject = `New Form Submission: ${form.name}`;
                const html = `
                    <h2 style="color: #1B365D;">${form.name}</h2>
                    <p>New submission received from ${req.headers.get('x-forwarded-for') || 'client'}.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        ${Object.entries(data).map(([label, val]) => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #EEE; font-weight: bold; width: 30%;">${label}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #EEE;">${Array.isArray(val) ? val.join(', ') : val}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <p style="margin-top: 30px; font-size: 12px; color: #999;">IP: ${req.headers.get('x-forwarded-for') || 'N/A'} • UserAgent: ${req.headers.get('user-agent') || 'N/A'}</p>
                `;

                await sendEmail(form.submitEmail, subject, html);
            } catch (emailError) {
                console.error("Email notification failed for form submission:", emailError);
            }
        }

        return NextResponse.json({ success: true, submissionId: submission.id });
    } catch (error: any) {
        console.error("Form Submission Error:", error);
        return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    }
}

