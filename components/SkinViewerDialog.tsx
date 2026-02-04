'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SkinViewer } from '@/components/SkinViewer';
import { User } from 'lucide-react';

interface SkinViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function SkinViewerDialog({ open, onOpenChange, username }: SkinViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <User className="h-5 w-5" />
            <span className="gradient-text">皮肤预览</span>
          </DialogTitle>
          <DialogDescription>
            {username} 的 Minecraft 皮肤
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <SkinViewer username={username} width={240} height={320} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
