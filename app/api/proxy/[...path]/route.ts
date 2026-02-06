import {NextRequest, NextResponse} from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
    return handleRequest(request, params.path, 'GET');
}

export async function POST(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
    return handleRequest(request, params.path, 'POST');
}

export async function PUT(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
    return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: { path: string[] } }
) {
    return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    try {
        const path = pathSegments.join('/');
        const searchParams = request.nextUrl.searchParams.toString();
        const url = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

        // 转发请求头（包括认证信息）
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            if (!key.startsWith('host') && !key.startsWith('connection')) {
                headers[key] = value;
            }
        });

        const options: RequestInit = {
            method,
            headers,
        };

        // 转发请求体
        if (method !== 'GET' && method !== 'HEAD') {
            const body = await request.text();
            if (body) {
                options.body = body;
            }
        }

        const response = await fetch(url, options);
        const data = await response.json();

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {code: 500, msg: '代理请求失败'},
            {status: 500}
        );
    }
}
