import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

/* ─────────────────────────────────────────────────────────────
   Color Palette: Warm Luxury Linen / Clay (Light Mode Brand)
───────────────────────────────────────────────────────────────── */
const PALETTE = {
    canvasBg: [250, 247, 242] as [number, number, number],       // #FAF7F2 Soft Linen
    cardBg: [255, 255, 255] as [number, number, number],         // #FFFFFF Pure Card
    cardBorder: [230, 224, 214] as [number, number, number],     // #E6E0D6 Subtle Border
    badgeBg: [237, 231, 220] as [number, number, number],        // #EDE7DC Clay Badge
    goldPrimary: [184, 138, 30] as [number, number, number],     // #B88A1E Royal Gold
    navyPrimary: [19, 34, 56] as [number, number, number],       // #132238 Deep Navy
    textDark: [24, 28, 32] as [number, number, number],          // #181C20 Obsidian Dark
    textMuted: [71, 85, 105] as [number, number, number],        // #475569 Slate Muted
    textLight: [120, 130, 145] as [number, number, number],      // #788291 Light Slate
    highlightGreen: [16, 149, 106] as [number, number, number],  // #10956A Verified Green
};

/* ─────────────────────────────────────────────────────────────
   Helper: Extract image dimensions from PNG or JPEG buffer
───────────────────────────────────────────────────────────────── */
function getImageDimensions(buffer: Buffer): { width: number; height: number } | null {
    try {
        // PNG Header
        if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return {
                width: buffer.readUInt32BE(16),
                height: buffer.readUInt32BE(20)
            };
        }
        // JPEG Header
        if (buffer.length > 4 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
            let offset = 2;
            while (offset < buffer.length - 8) {
                if (buffer[offset] !== 0xFF) {
                    offset++;
                    continue;
                }
                const marker = buffer[offset + 1];
                if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
                    return {
                        height: buffer.readUInt16BE(offset + 5),
                        width: buffer.readUInt16BE(offset + 7)
                    };
                }
                offset += 2 + buffer.readUInt16BE(offset + 2);
            }
        }
    } catch { }
    return null;
}

/* ─────────────────────────────────────────────────────────────
   Helper: Safely load image as base64 string with dimensions
───────────────────────────────────────────────────────────────── */
function getLocalImageBase64(imgUrl: string | null | undefined): { format: 'JPEG' | 'PNG'; data: string; width?: number; height?: number } | null {
    if (!imgUrl) return null;

    try {
        let cleanPath = imgUrl.trim();
        if (cleanPath.startsWith('[') && cleanPath.endsWith(']')) {
            try {
                const parsed = JSON.parse(cleanPath);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    cleanPath = parsed[0];
                }
            } catch { }
        }

        cleanPath = cleanPath.split('?')[0].replace(/^["']|["']$/g, '');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

        const localPath = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(localPath)) {
            const ext = path.extname(localPath).toLowerCase();
            const format: 'JPEG' | 'PNG' = ext === '.png' ? 'PNG' : 'JPEG';
            const buf = fs.readFileSync(localPath);
            const dims = getImageDimensions(buf);
            const base64 = buf.toString('base64');
            return {
                format,
                data: `data:image/${ext === '.png' ? 'png' : 'jpeg'};base64,${base64}`,
                width: dims?.width,
                height: dims?.height
            };
        }
    } catch (e) {
        console.error('Failed to load image for PDF:', imgUrl, e);
    }
    return null;
}

/* ─────────────────────────────────────────────────────────────
   Main Generator Function
───────────────────────────────────────────────────────────────── */
export async function generateCompanyProfilePDF(): Promise<Buffer> {
    // 1. Fetch site settings
    const settingsList = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach(s => { settings[s.key] = s.value; });

    // 2. Fetch all active categories
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });

    // 3. Fetch all active products
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
    });

    // 4. Dynamic strings from settings with sanitized buyer-centric fallbacks
    const companyName = settings.company_name || 'Apparel Emporium';
    const companyTagline = settings.company_tagline || '100% Export Oriented Readymade Garments Buying House';
    const address = settings.contact_address || 'House-74, Road-13, Sector-10, Uttara Model Town, Dhaka-1230, Bangladesh';
    const email = settings.contact_email || 'info@apparelemporium.net';
    const phone = settings.contact_phone || '+88 01670 15 46 46';
    const website = settings.site_url || 'https://www.apparelemporium.net';

    const aboutParagraph = settings.about_paragraph ||
        'Apparel Emporium is a premier 100% export-oriented garments buying house headquartered in Bangladesh. We specialize in B2B corporate sourcing, design, manufacturing supervision, and global logistics for readymade garments, knitwear, woven fashion, sweaters, home textiles, and accessories.';

    const ceoHeading = settings.ceo_heading || "CEO'S STRATEGIC MESSAGE";
    const ceoP1 = settings.ceo_p1 && !/AQL/i.test(settings.ceo_p1) ? settings.ceo_p1 :
        'Our unwavering mission is delivering reliable apparel sourcing aligned strictly with buyer-defined quality specifications and ethical supply chains.';
    const ceoP2 = settings.ceo_p2 && !/AQL/i.test(settings.ceo_p2) ? settings.ceo_p2 :
        'With over 15 years of industry leadership, our dedicated merchandising and quality assurance teams guarantee total production transparency and buyer satisfaction.';
    const ceoSignoff = settings.ceo_signoff || 'Managing Director & CEO, Apparel Emporium';

    const vision = settings.vision_text || 'To be the most trusted, socially compliant, and quality-driven garments buying house in South Asia for world-class fashion brands.';
    const mission = settings.mission_text || 'To engineer sustainable garment manufacturing partnerships, offering complete end-to-end merchandising from design to FOB shipment.';
    const values = settings.value_text && !/AQL/i.test(settings.value_text) ? settings.value_text :
        'Uncompromised Integrity, Buyer-Aligned Quality Standards, Environmental Stewardship, and Transparent On-Time Global Deliveries.';

    // Current generation date
    const generatedDateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Initialize jsPDF (A4 portrait: 210mm x 297mm)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2); // 182mm

    /* ── Helper: Paint Page Canvas Background ── */
    const paintBackground = () => {
        doc.setFillColor(...PALETTE.canvasBg);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    /* ── Helper: Header on Inner Pages ── */
    const drawInnerHeader = (sectionTitle: string) => {
        doc.setFillColor(...PALETTE.cardBg);
        doc.roundedRect(margin, 8, contentWidth, 14, 3, 3, 'F');
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, 8, contentWidth, 14, 3, 3, 'S');

        // Brand & Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text('APPAREL EMPORIUM', margin + 6, 16.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...PALETTE.goldPrimary);
        doc.text('•  ' + sectionTitle.toUpperCase(), margin + 45, 16.5);

        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.textLight);
        doc.text('100% EXPORT ORIENTED BUYING HOUSE', pageWidth - margin - 6, 16.5, { align: 'right' });
    };

    /* ═════════════════════════════════════════════════════════════════════════
       PAGE 1: EDITORIAL LUXURY COVER PAGE
    ═════════════════════════════════════════════════════════════════════════════ */
    paintBackground();

    // Outer Decorative Gold Frame
    doc.setDrawColor(...PALETTE.goldPrimary);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8, 4, 4, 'S');

    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin * 2) + 4, 3, 3, 'S');

    // Top Badge Banner (Clean ASCII without broken characters)
    doc.setFillColor(...PALETTE.navyPrimary);
    doc.roundedRect(margin + 16, 20, contentWidth - 32, 9, 4.5, 4.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('BANGLADESH EXPORT SECTOR   |   GOVERNMENT RECOGNIZED BUYING HOUSE', pageWidth / 2, 25.5, { align: 'center' });

    // Official Logo Rendering with Perfect Aspect Ratio (No Distortion)
    const logoImg = getLocalImageBase64('images/logo_light.png') || getLocalImageBase64('logo.jpg') || getLocalImageBase64('images/ae-emblem-clean-light.png');
    if (logoImg) {
        try {
            const maxLogoW = 86;
            const maxLogoH = 15;
            let logoW = maxLogoW;
            let logoH = maxLogoH;

            if (logoImg.width && logoImg.height) {
                const aspect = logoImg.width / logoImg.height;
                if (aspect > maxLogoW / maxLogoH) {
                    logoW = maxLogoW;
                    logoH = maxLogoW / aspect;
                } else {
                    logoH = maxLogoH;
                    logoW = maxLogoH * aspect;
                }
            }

            const logoX = (pageWidth - logoW) / 2;
            const logoY = 34 + (maxLogoH - logoH) / 2;
            doc.addImage(logoImg.data, logoImg.format, logoX, logoY, logoW, logoH);
        } catch { }
    } else {
        // Fallback Monogram
        doc.setFillColor(...PALETTE.goldPrimary);
        doc.roundedRect(pageWidth / 2 - 16, 34, 32, 16, 4, 4, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('AE', pageWidth / 2, 45, { align: 'center' });
    }

    // Secondary Sourcing Tagline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text('YOUR TRUSTED GARMENTS SOURCING PARTNER IN BANGLADESH', pageWidth / 2, 54, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PALETTE.textMuted);
    doc.text('100% Export-Oriented Garments Buying House  |  Dhaka, Bangladesh', pageWidth / 2, 60, { align: 'center' });

    // Thin golden line
    doc.setDrawColor(...PALETTE.goldPrimary);
    doc.setLineWidth(0.6);
    doc.line(pageWidth / 2 - 35, 65, pageWidth / 2 + 35, 65);

    // Document Subtitle Card
    doc.setFillColor(...PALETTE.cardBg);
    doc.roundedRect(margin + 8, 70, contentWidth - 16, 38, 5, 5, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 8, 70, contentWidth - 16, 38, 5, 5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(...PALETTE.textDark);
    doc.text('OFFICIAL CORPORATE PROFILE & PRODUCT SOURCING CATALOGUE', pageWidth / 2, 81, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PALETTE.textMuted);
    doc.text('Comprehensive Overview of Sourcing Capabilities, Buyer-Driven Standards & Live Product Lines', pageWidth / 2, 88, { align: 'center' });

    // Live Generation Badge inside card
    doc.setFillColor(...PALETTE.badgeBg);
    doc.roundedRect(margin + 24, 94, contentWidth - 48, 8.5, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text(`LIVE VERIFIED EDITION   |   GENERATED ON: ${generatedDateStr.toUpperCase()}`, pageWidth / 2, 99.5, { align: 'center' });

    // 4 Key Pillars (2x2 Grid) - Completely buyer-demand focused
    const pillars = [
        {
            title: 'BUYER-SPECIFIED QUALITY ASSURANCE',
            desc: 'Multi-stage quality controls customized strictly to buyer demands, tech packs, and factory inspection benchmarks.'
        },
        {
            title: 'ETHICAL EXPORT COMPLIANCE',
            desc: 'Audited partner manufacturing facilities adhering strictly to global social, safety, and environmental standards.'
        },
        {
            title: '15+ YEARS SOURCING EXPERTISE',
            desc: 'Serving premier retail chains, fashion brands, and corporate importers across European, American, and global markets.'
        },
        {
            title: 'END-TO-END MERCHANDISING',
            desc: 'Fabric R&D, customized proto sampling tailored to buyer tech pack & material availability, and punctual FOB/CIF shipments.'
        },
    ];

    const pCardW = (contentWidth - 8) / 2;
    const pCardH = 34;
    pillars.forEach((p, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + (col * (pCardW + 8));
        const y = 116 + (row * (pCardH + 6));

        doc.setFillColor(...PALETTE.cardBg);
        doc.roundedRect(x, y, pCardW, pCardH, 4, 4, 'F');
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.4);
        doc.roundedRect(x, y, pCardW, pCardH, 4, 4, 'S');

        // Gold indicator bar on left of each pillar
        doc.setFillColor(...PALETTE.goldPrimary);
        doc.rect(x, y + 6, 2.5, pCardH - 12, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.2);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text(p.title, x + 7, y + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...PALETTE.textMuted);
        const descLines = doc.splitTextToSize(p.desc, pCardW - 12);
        doc.text(descLines, x + 7, y + 16.5);
    });

    // Cover Page Bottom Card: Contact & Registered Headquarters
    const bCardY = 206;
    doc.setFillColor(...PALETTE.navyPrimary);
    doc.roundedRect(margin, bCardY, contentWidth, 68, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text('GLOBAL HEADQUARTERS & MERCHANDISING CONTACT', pageWidth / 2, bCardY + 13, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(240, 243, 246);
    doc.text(address, pageWidth / 2, bCardY + 23, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(200, 210, 225);
    doc.text(`Official Email: ${email}   |   Hotline: ${phone}   |   Web: ${website.replace(/^https?:\/\//, '')}`, pageWidth / 2, bCardY + 32, { align: 'center' });

    // Live Catalog notice
    doc.setFillColor(30, 48, 76);
    doc.roundedRect(margin + 16, bCardY + 41, contentWidth - 32, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text(`CURRENT ACTIVE DATABASE PORTFOLIO: ${products.length} PRODUCTS INCLUDED IN THIS LIVE PDF`, pageWidth / 2, bCardY + 49.5, { align: 'center' });


    /* ═════════════════════════════════════════════════════════════════════════
       PAGE 2: EXECUTIVE SUMMARY, CEO MESSAGE & STRATEGIC VISION
    ═════════════════════════════════════════════════════════════════════════════ */
    doc.addPage();
    paintBackground();
    drawInnerHeader('Executive Summary & Leadership');

    let currentY = 28;

    // Card 1: About Us
    doc.setFillColor(...PALETTE.cardBg);
    doc.roundedRect(margin, currentY, contentWidth, 48, 4, 4, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 48, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('01. CORPORATE PROFILE & INDUSTRY STANDING', margin + 8, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PALETTE.textMuted);
    const aboutLines = doc.splitTextToSize(aboutParagraph, contentWidth - 16);
    doc.text(aboutLines, margin + 8, currentY + 19);

    currentY += 56;

    // Card 2: CEO & Leadership Message
    doc.setFillColor(...PALETTE.cardBg);
    doc.roundedRect(margin, currentY, contentWidth, 68, 4, 4, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 68, 4, 4, 'S');

    // Quote bar
    doc.setFillColor(...PALETTE.goldPrimary);
    doc.rect(margin + 8, currentY + 10, 3, 48, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text(ceoHeading.toUpperCase(), margin + 16, currentY + 14);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...PALETTE.textMuted);
    const ceoP1Lines = doc.splitTextToSize(`"${ceoP1}"`, contentWidth - 28);
    doc.text(ceoP1Lines, margin + 16, currentY + 23);

    const ceoP2Lines = doc.splitTextToSize(ceoP2, contentWidth - 28);
    doc.text(ceoP2Lines, margin + 16, currentY + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text(`— ${ceoSignoff}`, margin + 16, currentY + 56);

    currentY += 76;

    // Card 3: Vision, Mission & Values (3 Cards side-by-side)
    const vCardW = (contentWidth - 8) / 3;
    const vCardH = 72;

    const vmvItems = [
        { label: 'OUR VISION', text: vision },
        { label: 'OUR MISSION', text: mission },
        { label: 'CORE VALUES', text: values },
    ];

    vmvItems.forEach((vmv, idx) => {
        const vx = margin + (idx * (vCardW + 4));
        doc.setFillColor(...PALETTE.cardBg);
        doc.roundedRect(vx, currentY, vCardW, vCardH, 4, 4, 'F');
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.4);
        doc.roundedRect(vx, currentY, vCardW, vCardH, 4, 4, 'S');

        // Header pill inside card
        doc.setFillColor(...PALETTE.badgeBg);
        doc.roundedRect(vx + 4, currentY + 6, vCardW - 8, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text(vmv.label, vx + (vCardW / 2), currentY + 11.5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.textMuted);
        const vmvLines = doc.splitTextToSize(vmv.text, vCardW - 10);
        doc.text(vmvLines, vx + 5, currentY + 20);
    });

    currentY += vCardH + 10;

    // Bottom Commitment Banner (Replaces the removed fixed 4-stats bar)
    doc.setFillColor(...PALETTE.navyPrimary);
    doc.roundedRect(margin, currentY, contentWidth, 34, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text('COMMITTED TO EXCELLENCE IN GLOBAL APPAREL MERCHANDISING', pageWidth / 2, currentY + 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(230, 238, 248);
    const commLines = doc.splitTextToSize('Providing international retail brands with dependable supply chain solutions tailored strictly to buyer technical specifications, ethical factory audits, and reliable global shipment execution.', contentWidth - 24);
    doc.text(commLines, pageWidth / 2, currentY + 20, { align: 'center' });


    /* ═════════════════════════════════════════════════════════════════════════
       PAGE 3: SOURCING DIVISIONS, QUALITY WORKFLOW & COMPLIANCE
    ═════════════════════════════════════════════════════════════════════════════ */
    doc.addPage();
    paintBackground();
    drawInnerHeader('Manufacturing Divisions & Quality Control');

    currentY = 28;

    // 4 Sourcing Divisions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('02. CORE MANUFACTURING DIVISIONS', margin, currentY);

    currentY += 5;
    const divW = (contentWidth - 6) / 2;
    const divH = 46;

    const divisions = [
        {
            title: '1. WOVEN WEAR DIVISION',
            desc: 'Casual & Formal Shirts, Denim Jeans, Chinos, Cargo Pants, Blazers, Overcoats, Windbreakers & Workwear.',
            details: 'Fabrics: 100% Cotton Twill, Poplin, Denim (9-14 oz), Linen, Chambray, Oxford, T/C & CVC Blends.'
        },
        {
            title: '2. KNITWEAR DIVISION',
            desc: 'Polo Shirts, Crewneck T-Shirts, Pullover Hoodies, Sweatshirts, Joggers, Tank Tops, Sportswear & Undergarments.',
            details: 'Fabrics: Single Jersey, Pique, French Terry, Fleece, Rib 1x1/2x2, Interlock, Spandex/Elastane Blends.'
        },
        {
            title: '3. SWEATER & OUTERWEAR DIVISION',
            desc: 'Crewneck & V-Neck Pullovers, Button Cardigans, Turtlenecks, Cable Knits, Sleeveless Vests & Ponchos.',
            details: 'Gauges: 3GG, 5GG, 7GG, 12GG. Yarns: 100% Cotton, Acrylic, Cotton/Acrylic, Wool Blends, Chenille.'
        },
        {
            title: '4. ACCESSORIES & PACKAGING DIVISION',
            desc: 'Metal, Plastic & Horn Buttons, Metal & Nylon Coil Zippers, Woven & Care Labels, Price Hangtags, Polybags & Master Cartons.',
            details: 'Customized branding, barcode stickers, export compliant packaging & buyer-nominated trims.'
        },
    ];

    divisions.forEach((div, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const dx = margin + (col * (divW + 6));
        const dy = currentY + (row * (divH + 5));

        doc.setFillColor(...PALETTE.cardBg);
        doc.roundedRect(dx, dy, divW, divH, 4, 4, 'F');
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.4);
        doc.roundedRect(dx, dy, divW, divH, 4, 4, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text(div.title, dx + 6, dy + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.textMuted);
        const l1 = doc.splitTextToSize(div.desc, divW - 12);
        doc.text(l1, dx + 6, dy + 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...PALETTE.goldPrimary);
        const l2 = doc.splitTextToSize(div.details, divW - 12);
        doc.text(l2, dx + 6, dy + 32);
    });

    currentY += (divH * 2) + 16;

    // Quality Inspection 4-Tier Workflow (Buyer specification driven)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('03. 4-TIER QUALITY ASSURANCE INSPECTION PROTOCOL', margin, currentY);

    currentY += 6;
    const qSteps = [
        { num: 'LEVEL 1', name: 'Raw Material & Trims Audit', text: 'Fabric inspection, GSM check, shrinkage, shade variance, and tear strength testing.' },
        { num: 'LEVEL 2', name: 'Initial Production Check (IPC)', text: 'Cutting audit, size sets verification, pilot run inspection prior to bulk stitch.' },
        { num: 'LEVEL 3', name: 'During Production (DUPRO)', text: 'In-line daily checks, workmanship control, measurement tolerance, and defect prevention.' },
        { num: 'LEVEL 4', name: 'Pre-Shipment Inspection (PSI)', text: 'Comprehensive final pre-shipment inspection customized strictly to buyer quality standards.' },
    ];

    const qW = (contentWidth - 9) / 4;
    const qH = 50;
    qSteps.forEach((qs, idx) => {
        const qx = margin + (idx * (qW + 3));
        doc.setFillColor(...PALETTE.cardBg);
        doc.roundedRect(qx, currentY, qW, qH, 4, 4, 'F');
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.4);
        doc.roundedRect(qx, currentY, qW, qH, 4, 4, 'S');

        // Number badge
        doc.setFillColor(...PALETTE.goldPrimary);
        doc.roundedRect(qx + 4, currentY + 5, qW - 8, 6.5, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(qs.num, qx + (qW / 2), currentY + 9.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.navyPrimary);
        const nameL = doc.splitTextToSize(qs.name, qW - 8);
        doc.text(nameL, qx + 4, currentY + 17);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(...PALETTE.textMuted);
        const textL = doc.splitTextToSize(qs.text, qW - 8);
        doc.text(textL, qx + 4, currentY + 28);
    });

    currentY += qH + 8;

    // Factory Compliance Banner (Ethical manufacturing focus)
    doc.setFillColor(...PALETTE.badgeBg);
    doc.roundedRect(margin, currentY, contentWidth, 24, 4, 4, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 24, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('GLOBAL SUSTAINABILITY & FACTORY COMPLIANCE STANDARDS', pageWidth / 2, currentY + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PALETTE.textMuted);
    doc.text('Partner manufacturing units operate in full adherence to international labor, safety, and environmental standards:', pageWidth / 2, currentY + 13, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text('AUDITED PARTNER UNITS   •   ETHICAL MANUFACTURING   •   INTERNATIONAL SOCIAL & SAFETY NORMS', pageWidth / 2, currentY + 19, { align: 'center' });


    /* ═════════════════════════════════════════════════════════════════════════
       PAGE 4 ONWARDS: LIVE DYNAMIC PRODUCT CATALOGUE (4 Products Per Page)
    ═════════════════════════════════════════════════════════════════════════════ */
    const PRODUCTS_PER_PAGE = 4;
    const totalProductPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));

    for (let pPageIndex = 0; pPageIndex < totalProductPages; pPageIndex++) {
        doc.addPage();
        paintBackground();

        const pageProds = products.slice(pPageIndex * PRODUCTS_PER_PAGE, (pPageIndex + 1) * PRODUCTS_PER_PAGE);
        drawInnerHeader(`Live Product Showcase (Page ${pPageIndex + 1} of ${totalProductPages})`);

        // Subheader on product page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text(`04. DYNAMIC PRODUCT SOURCING CATALOGUE`, margin, 28);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...PALETTE.textMuted);
        doc.text(`Displaying active export line items ${pPageIndex * PRODUCTS_PER_PAGE + 1} to ${Math.min((pPageIndex + 1) * PRODUCTS_PER_PAGE, products.length)} of ${products.length} live records`, margin + 95, 28);

        // 2 Columns x 2 Rows Grid
        const cardW = (contentWidth - 8) / 2; // 87mm
        const cardH = 114;                    // 114mm

        pageProds.forEach((prod, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const cx = margin + (col * (cardW + 8));
            const cy = 34 + (row * (cardH + 7));

            // Card background & border
            doc.setFillColor(...PALETTE.cardBg);
            doc.roundedRect(cx, cy, cardW, cardH, 4, 4, 'F');
            doc.setDrawColor(...PALETTE.cardBorder);
            doc.setLineWidth(0.4);
            doc.roundedRect(cx, cy, cardW, cardH, 4, 4, 'S');

            // Product Image Box (top of card) with contained aspect ratio (No Distortion)
            const imgBoxH = 50;
            const imgBoxW = cardW - 8; // 79mm
            doc.setFillColor(245, 242, 236);
            doc.roundedRect(cx + 4, cy + 4, imgBoxW, imgBoxH, 3, 3, 'F');

            const prodImg = getLocalImageBase64(prod.images);
            if (prodImg) {
                try {
                    let drawW = imgBoxW;
                    let drawH = imgBoxH;

                    if (prodImg.width && prodImg.height) {
                        const imgAspect = prodImg.width / prodImg.height;
                        const boxAspect = imgBoxW / imgBoxH;
                        if (imgAspect > boxAspect) {
                            drawW = imgBoxW;
                            drawH = imgBoxW / imgAspect;
                        } else {
                            drawH = imgBoxH;
                            drawW = imgBoxH * imgAspect;
                        }
                    }

                    const drawX = cx + 4 + (imgBoxW - drawW) / 2;
                    const drawY = cy + 4 + (imgBoxH - drawH) / 2;
                    doc.addImage(prodImg.data, prodImg.format, drawX, drawY, drawW, drawH);
                } catch {
                    drawImgPlaceholder(doc, cx + 4, cy + 4, imgBoxW, imgBoxH, prod.category?.name || 'Garment');
                }
            } else {
                drawImgPlaceholder(doc, cx + 4, cy + 4, imgBoxW, imgBoxH, prod.category?.name || 'Garment');
            }

            // Category Pill badge
            const catName = prod.category?.name ? prod.category.name.toUpperCase() : 'EXPORT WEAR';
            doc.setFillColor(...PALETTE.badgeBg);
            doc.roundedRect(cx + 6, cy + 58, 42, 5.5, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(...PALETTE.navyPrimary);
            doc.text(catName.substring(0, 20), cx + 27, cy + 62, { align: 'center' });

            // Product Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...PALETTE.navyPrimary);
            const titleLines = doc.splitTextToSize(prod.name.toUpperCase(), cardW - 12);
            doc.text(titleLines.slice(0, 2), cx + 6, cy + 68);

            // Sourcing Mode & Inquiry (Price and MOQ removed per buyer instructions)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...PALETTE.goldPrimary);
            doc.text('SOURCING MODE: CUSTOM TECH PACK / RFQ', cx + 6, cy + 78);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.2);
            doc.setTextColor(...PALETTE.textMuted);
            doc.text('Order Volume: Flexible / As Per Buyer Requirement', cx + 6, cy + 84);

            // Divider inside card
            doc.setDrawColor(...PALETTE.cardBorder);
            doc.setLineWidth(0.3);
            doc.line(cx + 6, cy + 87, cx + cardW - 6, cy + 87);

            // Specifications or description snippet
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...PALETTE.textMuted);

            let descText = prod.shortDescription || prod.description || 'Premium export quality fabric, reactive dyed, pre-shrunk with export standard packaging.';
            if (descText.length > 120) descText = descText.substring(0, 117) + '...';
            const descLines = doc.splitTextToSize(descText, cardW - 12);
            doc.text(descLines.slice(0, 3), cx + 6, cy + 92);

            // Bottom Delivery Tag (Flexible timeline, no fixed days)
            doc.setFillColor(...PALETTE.navyPrimary);
            doc.roundedRect(cx + 6, cy + 104, cardW - 12, 6, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(255, 255, 255);
            doc.text('LEAD TIME: MUTUALLY AGREED SCHEDULE  •  FOB CHITTAGONG', cx + (cardW / 2), cy + 108.2, { align: 'center' });
        });
    }

    /* ═════════════════════════════════════════════════════════════════════════
       FINAL PAGE: COMMERCIAL TERMS, GLOBAL EXPORTS & DIRECTORY
    ═════════════════════════════════════════════════════════════════════════════ */
    doc.addPage();
    paintBackground();
    drawInnerHeader('Commercial Terms, Logistics & Contact Directory');

    currentY = 28;

    // Commercial Terms Card (Flexible & Buyer-tailored)
    doc.setFillColor(...PALETTE.cardBg);
    doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('05. COMMERCIAL TERMS, SAMPLING & LOGISTICS', margin + 8, currentY + 9);

    const commTerms = [
        { label: 'Payment Terms:', val: 'Irrevocable Letter of Credit (L/C at sight) or T/T (30% advance, 70% against B/L)' },
        { label: 'Trade Terms:', val: 'FOB Chittagong Port, CIF, CFR, Ex-Factory, or DDP (Buyer Nominated)' },
        { label: 'Sample Turnaround:', val: 'Prompt proto / fit sampling upon tech pack receipt & material availability' },
        { label: 'Bulk Production:', val: 'Mutually agreed production schedule following Lab Dip & Pre-Production (PP) approvals' },
        { label: 'Quality Acceptance:', val: 'Strictly as per Buyer Quality Requirements & Specifications. Third-party audits welcome' },
    ];

    let tY = currentY + 16;
    commTerms.forEach(t => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.goldPrimary);
        doc.text(t.label, margin + 8, tY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...PALETTE.textDark);
        doc.text(t.val, margin + 44, tY);
        tY += 7.5;
    });

    currentY += 60;

    // Global Export Destinations (4 Regions)
    doc.setFillColor(...PALETTE.cardBg);
    doc.roundedRect(margin, currentY, contentWidth, 48, 4, 4, 'F');
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 48, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PALETTE.navyPrimary);
    doc.text('06. GLOBAL EXPORT DESTINATIONS & MARKETS', margin + 8, currentY + 9);

    const markets = [
        { reg: 'EUROPEAN UNION', countries: 'Germany, France, Spain, Italy, Netherlands, Poland, Belgium, Denmark' },
        { reg: 'UNITED KINGDOM', countries: 'Major high-street retailers, e-commerce brands & department stores' },
        { reg: 'NORTH AMERICA', countries: 'United States & Canada (Corporate workwear, fashion retail & private labels)' },
        { reg: 'ASIA-PACIFIC & ME', countries: 'Australia, Japan, South Korea, UAE & Saudi Arabia markets' },
    ];

    const mW2 = (contentWidth - 12) / 2;
    markets.forEach((m, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const mx = margin + 6 + (col * (mW2 + 4));
        const my = currentY + 15 + (row * 15);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PALETTE.navyPrimary);
        doc.text(`•  ${m.reg}`, mx, my);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(...PALETTE.textMuted);
        const cLines = doc.splitTextToSize(m.countries, mW2 - 6);
        doc.text(cLines, mx + 4, my + 5);
    });

    currentY += 54;

    // Official Contact & Inquiry Directory
    doc.setFillColor(...PALETTE.navyPrimary);
    doc.roundedRect(margin, currentY, contentWidth, 90, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...PALETTE.goldPrimary);
    doc.text('OFFICIAL CORPORATE DIRECTORY & MERCHANDISING INQUIRIES', pageWidth / 2, currentY + 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(240, 245, 252);
    doc.text('We welcome global buyers, buying agents, and brand representatives to visit our showroom or send RFQs.', pageWidth / 2, currentY + 19, { align: 'center' });

    // Contact Boxes (3 columns)
    const cBoxW = (contentWidth - 16) / 3;
    const cBoxH = 54;

    const contactBoxes = [
        {
            title: 'CORPORATE OFFICE',
            p1: 'Apparel Emporium (AEL BD)',
            p2: address,
            p3: 'Uttara Model Town, Dhaka, BD'
        },
        {
            title: 'HOTLINES & WHATSAPP',
            p1: `Hotline: ${phone}`,
            p2: 'WhatsApp 24/7 Support',
            p3: 'Direct Buyer Merchandising Desk'
        },
        {
            title: 'DIGITAL & PORTAL',
            p1: `Email: ${email}`,
            p2: `Web: ${website.replace(/^https?:\/\//, '')}`,
            p3: 'Buyer RFQ Portal: Online'
        }
    ];

    contactBoxes.forEach((cb, idx) => {
        const bx = margin + 4 + (idx * (cBoxW + 4));
        const by = currentY + 26;

        doc.setFillColor(30, 48, 76);
        doc.roundedRect(bx, by, cBoxW, cBoxH, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PALETTE.goldPrimary);
        doc.text(cb.title, bx + (cBoxW / 2), by + 9, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        const p1L = doc.splitTextToSize(cb.p1, cBoxW - 6);
        doc.text(p1L, bx + (cBoxW / 2), by + 18, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(200, 212, 228);
        const p2L = doc.splitTextToSize(cb.p2, cBoxW - 6);
        doc.text(p2L, bx + (cBoxW / 2), by + 28, { align: 'center' });

        doc.setFontSize(6.8);
        doc.setTextColor(...PALETTE.goldPrimary);
        doc.text(cb.p3, bx + (cBoxW / 2), by + 46, { align: 'center' });
    });

    // Verification Seal Note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(170, 185, 205);
    doc.text(`Official Document ID: AEL-DOC-${Date.now().toString(36).toUpperCase()} • Authenticated Live Export Sourcing Document`, pageWidth / 2, currentY + 85, { align: 'center' });

    /* ═════════════════════════════════════════════════════════════════════════
       RUNNING FOOTERS ON ALL PAGES (EXCEPT COVER)
    ═════════════════════════════════════════════════════════════════════════════ */
    const totalPages = doc.getNumberOfPages();
    for (let pNum = 2; pNum <= totalPages; pNum++) {
        doc.setPage(pNum);

        // Divider line above footer
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...PALETTE.textLight);
        doc.text('Apparel Emporium (AEL BD)  •  Confidential Corporate Sourcing Profile  •  www.apparelemporium.net', margin, pageHeight - 7);

        doc.setFont('helvetica', 'bold');
        doc.text(`Page ${pNum} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    return Buffer.from(doc.output('arraybuffer'));
}

/* ── Fallback image placeholder drawing ── */
function drawImgPlaceholder(doc: jsPDF, x: number, y: number, w: number, h: number, cat: string) {
    doc.setFillColor(235, 230, 220);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(140, 130, 120);
    doc.text('APPAREL EMPORIUM', x + (w / 2), y + (h / 2) - 3, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 150, 140);
    doc.text(cat.toUpperCase(), x + (w / 2), y + (h / 2) + 4, { align: 'center' });
}
