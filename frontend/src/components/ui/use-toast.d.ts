declare module '@/components/ui/use-toast' {
  export function useToast(): {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void;
  };
} 