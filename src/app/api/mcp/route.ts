import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        },
    });
}

export async function GET() {
    return NextResponse.json({
        name: "Apparel Emporium Sourcing MCP",
        version: "1.0.0",
        status: "active",
        endpoint: "/api/mcp",
        methods: ["tools/list", "tools/call"]
    }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { method, params, id = 1 } = body || {};

        if (method === 'tools/list') {
            return NextResponse.json({
                jsonrpc: "2.0",
                id,
                result: {
                    tools: [
                        {
                            name: "search_catalog",
                            description: "Search 170+ export-ready garments by keyword or category",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    query: { type: "string" },
                                    limit: { type: "number", default: 10 }
                                },
                                required: ["query"]
                            }
                        },
                        {
                            name: "get_company_profile",
                            description: "Retrieve corporate overview and contact info",
                            inputSchema: { type: "object", properties: {} }
                        },
                        {
                            name: "get_pricing_and_moq_guide",
                            description: "Get FOB pricing ranges and MOQ info",
                            inputSchema: { type: "object", properties: {} }
                        }
                    ]
                }
            }, {
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        if (method === 'tools/call') {
            const toolName = params?.name;
            const args = params?.arguments || {};

            if (toolName === 'search_catalog') {
                const query = args.query || '';
                const limit = Math.min(Number(args.limit) || 10, 50);

                const products = await prisma.product.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { name: { contains: query } },
                            { description: { contains: query } },
                            { shortDescription: { contains: query } },
                            { specifications: { contains: query } },
                            { category: { name: { contains: query } } }
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        priceRange: true,
                        minOrder: true,
                        specifications: true,
                        category: { select: { name: true } }
                    },
                    take: limit
                });

                return NextResponse.json({
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(products, null, 2)
                            }
                        ]
                    }
                }, {
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }

            if (toolName === 'get_company_profile') {
                return NextResponse.json({
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    company: "Apparel Emporium Ltd.",
                                    director: "Md. Kamal Hossain",
                                    phone: "+88 02 4895 5519",
                                    email: "info@aelbd.net",
                                    address: "House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka-1230, Bangladesh",
                                    certifications: ["BSCI", "SEDEX", "OEKO-TEX Standard 100", "GOTS"]
                                }, null, 2)
                            }
                        ]
                    }
                }, {
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }

            if (toolName === 'get_pricing_and_moq_guide') {
                return NextResponse.json({
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    pricing_fob_usd: {
                                        knit_tshirts: "$2.50 - $4.50",
                                        polo_shirts: "$4.00 - $7.50",
                                        hoodies_sweatshirts: "$7.00 - $14.00",
                                        denim_jeans: "$8.50 - $18.00",
                                        sweaters: "$8.00 - $22.00",
                                        outerwear_jackets: "$15.00 - $45.00"
                                    },
                                    moq: "500 - 1,000 pcs for knits; 1,000 - 3,000 pcs for woven/denim",
                                    lead_time: "45 - 75 days",
                                    payment_terms: "Irrevocable L/C at sight or T/T wire"
                                }, null, 2)
                            }
                        ]
                    }
                }, {
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }
        }

        return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: "Method or tool not found" }
        }, { status: 404 });

    } catch (err: any) {
        return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32603, message: err.message || "Internal error" }
        }, { status: 500 });
    }
}

