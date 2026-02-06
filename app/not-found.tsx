'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft, FileQuestion, Home} from 'lucide-react';
import {Navbar} from '@/components/Navbar';

export default function NotFound() {
    return (
        <main
            className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
            <Navbar/>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                    <Card
                        className="border-none shadow-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md overflow-hidden">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">

                            {/* 404 Icon/Graphic */}
                            <div className="relative group">
                                <div
                                    className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-500"/>
                                <div
                                    className="relative bg-white/80 dark:bg-gray-800/80 p-6 rounded-full shadow-lg ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                                    <FileQuestion className="h-16 w-16 text-indigo-500 dark:text-indigo-400"/>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="space-y-2">
                                <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
                                    404
                                </h1>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    页面未找到
                                </h2>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    抱歉，您访问的页面不存在，或者已被移除。
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => window.history.back()}
                                >
                                    <ArrowLeft className="h-4 w-4"/>
                                    返回上页
                                </Button>
                                <Button
                                    asChild
                                    className="flex-1 gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all"
                                >
                                    <Link href="/">
                                        <Home className="h-4 w-4"/>
                                        回到首页
                                    </Link>
                                </Button>
                            </div>

                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        © {new Date().getFullYear()} 白名单申请系统
                    </p>
                </div>
            </div>
        </main>
    );
}
