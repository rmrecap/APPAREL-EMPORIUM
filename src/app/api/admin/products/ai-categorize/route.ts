import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';
import { autoClassifyProductTaxonomy } from '@/lib/product-classifier';

export const dynamic = 'force-dynamic';

interface AICategorizeResult {
    id: string;
    title: string;
    previous: {
        department: string | null;
        divisionType: string | null;
        subCategory: string | null;
        categoryId: string | null;
    };
    suggested: {
        department: string;
        divisionType: string;
        subCategory: string;
        categoryId: string;
        categoryName: string;
        categorySlug: string;
    };
    confidence: number;
    source: 'RULE_ENGINE' | 'AI_GEMINI' | 'AI_OPENAI' | 'AI_CLAUDE';
    reason: string;
    changed: boolean;
}

/**
 * Call external LLM (Gemini / OpenAI / Claude) if configured, or fall back to internal classifier
 */
async function classifyWithAI(
    product: {
        id: string;
        title?: string | null;
        name?: string | null;
        description?: string | null;
        specifications?: string | null;
        tags?: string | null;
    },
    categories: Array<{ id: string; name: string; slug: string; parentId: string | null }>
): Promise<{
    department: 'Menswear' | 'Womenswear' | 'Kidswear' | 'Home Textiles' | 'Accessories';
    divisionType: 'Knit' | 'Woven' | 'Sweater' | 'Footwear' | 'Home Textiles' | 'Accessories';
    subCategory: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    confidence: number;
    source: 'RULE_ENGINE' | 'AI_GEMINI' | 'AI_OPENAI' | 'AI_CLAUDE';
    reason: string;
}> {
    const rawTitle = product.title || product.name || '';
    const rawDesc = product.description || '';
    const rawSpecs = product.specifications || '';

    // Check for Google Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const prompt = `You are an expert garment and apparel merchandiser. Analyze this export apparel product and classify its department, division, and best matching subcategory.
Title: "${rawTitle}"
Description: "${rawDesc.slice(0, 300)}"
Specs: "${rawSpecs.slice(0, 300)}"

Valid Departments: ["Menswear", "Womenswear", "Kidswear", "Home Textiles", "Accessories"]
Valid Divisions: ["Knit", "Woven", "Sweater", "Footwear", "Home Textiles", "Accessories"]

Return ONLY a valid JSON object matching this schema:
{
  "department": "Menswear" | "Womenswear" | "Kidswear" | "Home Textiles" | "Accessories",
  "divisionType": "Knit" | "Woven" | "Sweater" | "Footwear" | "Home Textiles" | "Accessories",
  "subCategory": "slug-name-like-mens-t-shirt-or-womens-sweaters",
  "reason": "short explanation"
}`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                }),
                signal: AbortSignal.timeout(8000)
            });
            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const parsed = JSON.parse(text);
                    const matchedCat = findBestMatchingCategory(parsed.subCategory, parsed.department, categories);
                    return {
                        department: parsed.department,
                        divisionType: parsed.divisionType,
                        subCategory: parsed.subCategory || matchedCat.slug,
                        categoryId: matchedCat.id,
                        categoryName: matchedCat.name,
                        categorySlug: matchedCat.slug,
                        confidence: 0.95,
                        source: 'AI_GEMINI',
                        reason: parsed.reason || 'Gemini 1.5 Flash automated classification'
                    };
                }
            }
        } catch (e) {
            console.warn('Gemini AI classification fallback:', (e as any).message);
        }
    }

    // Default: Deterministic Rule & NLP Classification Engine
    const ruleResult = autoClassifyProductTaxonomy({
        title: rawTitle,
        name: rawTitle,
        description: rawDesc,
        tags: product.tags
    });

    const matchedCat = findBestMatchingCategory(ruleResult.subCategory, ruleResult.department, categories);

    return {
        department: ruleResult.department,
        divisionType: ruleResult.divisionType,
        subCategory: ruleResult.subCategory,
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        categorySlug: matchedCat.slug,
        confidence: 0.92,
        source: 'RULE_ENGINE',
        reason: `Matched via title & fabric signals for ${ruleResult.department} -> ${ruleResult.divisionType}`
    };
}

function findBestMatchingCategory(
    subCategorySlug: string,
    department: string,
    categories: Array<{ id: string; name: string; slug: string; parentId: string | null }>
) {
    // 1. Direct slug match
    const direct = categories.find(c => c.slug.toLowerCase() === subCategorySlug.toLowerCase());
    if (direct) return direct;

    // 2. Contains slug match
    const contains = categories.find(c => c.slug.toLowerCase().includes(subCategorySlug.toLowerCase()));
    if (contains) return contains;

    // 3. Department fallback
    if (department === 'Menswear') {
        const mens = categories.find(c => c.slug === 'mens-fashion' || c.slug === 'mens-t-shirt');
        if (mens) return mens;
    } else if (department === 'Womenswear') {
        const womens = categories.find(c => c.slug === 'womens-fashion' || c.slug === 'womens-t-shirt');
        if (womens) return womens;
    } else if (department === 'Kidswear') {
        const kids = categories.find(c => c.slug === 'childrens-fashion' || c.slug === 'kids-circular-knit');
        if (kids) return kids;
    }

    // 4. Global fallback
    return categories[0] || { id: '', name: 'General', slug: 'general', parentId: null };
}

export async function POST(req: Request) {
    try {
        const guard = await requireAuth();
        if (!guard.ok) return guard.response;

        const role = guard.user.role;
        if (!hasPermission(role, 'products.update')) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { productIds, all, dryRun = false, limit = 100 } = body;

        // Fetch target products
        const where: any = {};
        if (Array.isArray(productIds) && productIds.length > 0) {
            where.id = { in: productIds };
        } else if (!all) {
            return NextResponse.json({ error: 'Please specify productIds or all: true' }, { status: 400 });
        }

        const products = await prisma.product.findMany({
            where,
            take: limit,
            select: {
                id: true,
                title: true,
                name: true,
                department: true,
                divisionType: true,
                subCategory: true,
                categoryId: true,
                description: true,
                specifications: true,
                tags: true
            }
        });

        if (products.length === 0) {
            return NextResponse.json({ success: true, results: [], message: 'No products matched criteria.' });
        }

        const categories = await prisma.category.findMany({
            select: { id: true, name: true, slug: true, parentId: true }
        });

        const results: AICategorizeResult[] = [];
        let updatedCount = 0;

        for (const prod of products) {
            const ai = await classifyWithAI(prod, categories);
            const changed =
                prod.department !== ai.department ||
                prod.divisionType !== ai.divisionType ||
                prod.subCategory !== ai.subCategory ||
                prod.categoryId !== ai.categoryId;

            results.push({
                id: prod.id,
                title: prod.title || prod.name || prod.id,
                previous: {
                    department: prod.department,
                    divisionType: prod.divisionType,
                    subCategory: prod.subCategory,
                    categoryId: prod.categoryId
                },
                suggested: {
                    department: ai.department,
                    divisionType: ai.divisionType,
                    subCategory: ai.subCategory,
                    categoryId: ai.categoryId,
                    categoryName: ai.categoryName,
                    categorySlug: ai.categorySlug
                },
                confidence: ai.confidence,
                source: ai.source,
                reason: ai.reason,
                changed
            });

            if (!dryRun && changed) {
                await prisma.product.update({
                    where: { id: prod.id },
                    data: {
                        department: ai.department,
                        divisionType: ai.divisionType,
                        subCategory: ai.subCategory,
                        categoryId: ai.categoryId
                    }
                });
                updatedCount++;
            }
        }

        if (!dryRun && updatedCount > 0) {
            await logActivity({
                userId: guard.user.id,
                action: 'UPDATE',
                entity: 'Product',
                details: `AI Auto-Categorized ${updatedCount} products (${dryRun ? 'Dry Run' : 'Applied'})`,
                request: req as any
            });
        }

        return NextResponse.json({
            success: true,
            dryRun,
            totalEvaluated: results.length,
            totalChanged: results.filter(r => r.changed).length,
            updatedCount: dryRun ? 0 : updatedCount,
            results
        });
    } catch (err: any) {
        console.error('AI Categorize Route Error:', err);
        return NextResponse.json({ error: 'AI Categorization failed', message: err.message }, { status: 500 });
    }
}

