import { useCallback, useEffect, useRef } from 'react';

const blockId = '14279';
export function useAdsgram({}) {
    const AdControllerRef = useRef(undefined);

    useEffect(() => {
        AdControllerRef.current = window.Adsgram?.init({ blockId });
    }, []);

    return useCallback(async ({ onReward, onError }) => {
        if (AdControllerRef.current) {
            AdControllerRef.current
                .show()
                .then((result) => {
                    // 用户观看广告至结束或在插页格式中关闭它
                    onReward?.(result);
                })
                .catch((result) => {
                    // 用户在播放广告时遇到错误
                    onError?.(result);
                });
        } else {
            onError?.({
                error: true,
                done: false,
                state: 'load',
                description: 'server error',
            });
        }
    }, []);
}