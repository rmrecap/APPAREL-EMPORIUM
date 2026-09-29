import { NextResponse } from 'next/server';
import { generateCompanyProfilePDF } from '@/lib/company-profile-pdf';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const isDownload = url.searchParams.get('download') === 'true';

        const pdfBuffer = await generateCompanyProfilePDF();

        const filename = `Apparel_Emporium_Company_Profile_${new Date().toISOString().split('T')[0]}.pdf`;

        return new Response(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': isDownload
                    ? `attachment; filename="${filename}"`
                    : `inline; filename="${filename}"`,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
        });
    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to dynamically generate company profile PDF', details: error?.message },
            { status: 500 }
        );
    }
}
