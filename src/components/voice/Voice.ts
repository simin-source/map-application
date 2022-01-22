import { Centmap } from '@/native/Centmap';

class Voice {
    constructor() {
        // @ts-ignore
        window.cmap_voiceFinish = () => {
            const [ current, ...other ] = this.textQueue;
            if (current) this.voice(current);
            this.textQueue = [...other];
            this.playing = false;
        };
    }

    private textQueue: string[] = [];
    private playing = false;

    play(text: string, wait = false) {
        if (wait && this.playing) this.textQueue.push(text);
        else this.voice(text);
    }

    clear() {
        this.playing = false;
        this.textQueue = [];
    }

    private voice(text: string) {
        try {
            Centmap.voice(text);
            this.playing = true;
        } catch (error) {
            throw new Error(`警告！不在指定Native App的webview环境！\n${error}`);
        }
    }
}

export const voiceManager = new Voice();