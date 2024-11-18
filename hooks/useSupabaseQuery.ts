import {useState, useCallback} from "react";
import {useToast} from "@/hooks/use-toast";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

export function useSupabaseQuery() {
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = useCallback(
    async (queryFn: () => Promise<any>, options = {retries: MAX_RETRIES}) => {
      setIsLoading(true);
      let attempt = 0;

      while (attempt < options.retries) {
        try {
          const result = await queryFn();
          setIsLoading(false);
          return result;
        } catch (error: any) {
          attempt++;

          if (attempt === options.retries) {
            toast({
              title: "エラー",
              description:
                "サーバーとの通信に失敗しました。しばらく待ってから再試行してください。",
              variant: "destructive",
            });
            setIsLoading(false);
            throw error;
          }

          // 待機してから再試行
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * attempt)
          );
        }
      }
    },
    [toast]
  );

  return {executeQuery, isLoading};
}
