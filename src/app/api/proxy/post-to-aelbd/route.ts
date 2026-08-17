import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // 1. API Secret Key Security Check
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.API_SECRET_KEY || 'aelbd_live_auth_secret_2026_x89a';

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing API Secret Key' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse Request Payload
    const payload = await req.json();

    if (!payload.name || typeof payload.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Bad Request: "name" field is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate unique slug
    const baseSlug = payload.slug
      ? payload.slug
      : payload.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Prepare images
    let imagesStr = '[]';
    if (Array.isArray(payload.images)) {
      imagesStr = JSON.stringify(payload.images);
    } else if (typeof payload.images === 'string') {
      imagesStr = payload.images.startsWith('[') ? payload.images : JSON.stringify([payload.images]);
    }

    // Specifications string
    const specsStr = typeof payload.specifications === 'object'
      ? JSON.stringify(payload.specifications)
      : payload.specifications || '{}';

    // 3. Create or Match Category if available
    let categoryId: string | null = null;
    if (payload.category) {
      const catSlug = payload.category.toLowerCase().trim().replace(/[\s_]+/g, '-');
      const existingCat = await prisma.category.findFirst({
        where: { OR: [{ name: payload.category }, { slug: catSlug }] },
      });
      if (existingCat) {
        categoryId = existingCat.id;
      }
    }

    // 4. Save into Database via Prisma
    const newProduct = await prisma.product.create({
      data: {
        name: payload.name,
        slug: slug,
        description: payload.description || '',
        shortDescription: payload.shortDescription || payload.description?.slice(0, 150) || '',
        sku: payload.sku || `AEL-${Date.now().toString().slice(-6)}`,
        categoryId: categoryId,
        images: imagesStr,
        featuredImage: Array.isArray(payload.images) && payload.images.length > 0 ? payload.images[0] : null,
        specifications: specsStr,
        priceDisplay: false, // Ensure public price is hidden
        status: payload.status || 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product successfully synced and created on aelbd.net!',
        product: newProduct,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error inserting product from generator tool:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Database Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
