'use client';

import {ThemeProvider as NextThemesProvider} from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={['light', 'dark', 'ocean', 'sunset', 'forest', 'pink']}
      >
      {children}
    </NextThemesProvider>
  );
}
