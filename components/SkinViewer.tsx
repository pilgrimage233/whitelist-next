'use client';

import { useEffect, useRef, useState } from 'react';
import * as skinview3d from 'skinview3d';
import { Button } from '@/components/ui/button';
import { Camera, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import request from '@/lib/request';

interface SkinViewerProps {
  username: string;
  width?: number;
  height?: number;
}

export function SkinViewer({ username, width = 180, height = 240 }: SkinViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isWalking, setIsWalking] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    loadSkin();
    return () => {
      cleanup();
    };
  }, [username]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (viewerRef.current) {
      try {
        viewerRef.current.renderPaused = true;
        if (viewerRef.current.animation) {
          viewerRef.current.animation.paused = true;
        }
      } catch (e) {
        console.error('清理皮肤查看器失败：', e);
      }
    }
  };

  const loadSkin = async () => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // 获取皮肤数据
      const response = await request.get(`/mojang/user/${username}`);
      const skinData = response.data;

      // 创建查看器
      const viewer = new skinview3d.SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        renderPaused: true
      });

      // 加载皮肤
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const skinUrl = `${baseUrl}/mojang/texture?url=${encodeURIComponent(skinData.skin.url)}`;

      const loadingPromise = viewer.loadSkin(skinUrl) as any;
      if (loadingPromise.onProgress) {
        loadingPromise.onProgress = (progress: number) => {
          setLoadingProgress(Math.round(progress * 100));
        };
      }
      await loadingPromise;

      // 设置模型类型
      viewer.playerObject.skin.modelType = skinData.skin?.metadata?.model === 'slim' ? 'slim' : 'default';

      // 设置相机
      viewer.camera.position.set(30, 0, -40);
      viewer.camera.lookAt(0, 0, 0);

      // 设置动画
      viewer.animation = new skinview3d.WalkingAnimation();
      viewer.animation.speed = 0.6;
      viewer.animation.paused = !isWalking;

      // 旋转动画
      let rotation = 0;
      const animate = () => {
        if (viewer && !viewer.renderPaused) {
          if (isAnimating) {
            rotation += 0.01;
            viewer.playerObject.rotation.y = rotation;
          }
          viewer.render();
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      viewerRef.current = viewer;
      viewer.renderPaused = false;
      animate();
      setLoading(false);
    } catch (err) {
      console.error('加载皮肤失败：', err);
      setError('无法加载玩家皮肤');
      setLoading(false);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const toggleWalk = () => {
    if (viewerRef.current?.animation) {
      const newWalking = !isWalking;
      setIsWalking(newWalking);
      viewerRef.current.animation.paused = !newWalking;
    }
  };

  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.position.set(30, 0, -40);
      viewerRef.current.camera.lookAt(0, 0, 0);
    }
  };

  const takeScreenshot = () => {
    if (!viewerRef.current) return;

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      viewerRef.current.render();
      ctx.drawImage(viewerRef.current.canvas, 0, 0);

      // 添加背景
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(26, 26, 26, 0.8)');
      gradient.addColorStop(1, 'rgba(44, 44, 44, 0.8)');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 添加水印
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${username} - ${new Date().toLocaleDateString()}`, width - 10, height - 10);

      // 下载
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${username}_skin_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('截图失败：', err);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-2" />
          <span className="text-white text-sm">{loadingProgress}%</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-red-400">
          <p className="mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={loadSkin}>
            重试
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1.5">
          <Button
            size="sm"
            variant={isAnimating ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={toggleAnimation}
            title="播放/暂停"
          >
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant={isWalking ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={toggleWalk}
            title="行走动画"
          >
            <span className="text-xs">🚶</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={takeScreenshot}
            title="截图"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={resetView}
            title="重置视角"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
