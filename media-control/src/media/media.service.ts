import websocket from '../websocket';
import { MediaControl as IWMC } from './types';
const WMC: typeof IWMC = require("@nodert-win11/windows.media.control");
const MediaManager = WMC.GlobalSystemMediaTransportControlsSessionManager;

async function requestAsync() {
    return new Promise<IWMC.GlobalSystemMediaTransportControlsSessionManager>((resolve, reject) => {
        MediaManager.requestAsync((err, sessions) => err ? reject(err) : resolve(sessions));
    });
}
function get<S, K extends keyof S, 
    T extends (S[K] extends ((cb: (err: Error, data: any) => void) => void) 
        ? Parameters<Parameters<S[K]>[0]>[1] : never)>(session: S, field: K) {
        return new Promise<T>((resolve, reject) => {
            return (session[field] as any)((err: Error, data: T) => {
                if (err) reject(err);
                return resolve(data);
            });
        });
}
const _ = () => {};

const InfoKeys: (keyof IWMC.GlobalSystemMediaTransportControlsSessionMediaProperties)[] = [
    'albumArtist', 'albumTitle', 'albumTrackCount', 'artist', 'genres', 'playbackType',
    'subtitle', 'thumbnail', 'title', 'trackNumber'
];

let _sessions = null as any as IWMC.GlobalSystemMediaTransportControlsSessionManager;
async function getSessions() {
    if (_sessions) return _sessions;
    return _sessions = await requestAsync();
}
async function getCurrentSession() {
    return (await getSessions()).getCurrentSession();
}

const mediaService = {
    async load() {
        const sessions = await getSessions();
        const current = sessions.getCurrentSession();
        sessions.on('CurrentSessionChanged', async (ev) => {
            mediaService.broadcastInfo();
        });
        current.on('MediaPropertiesChanged', (ev) => {
            // console.log('media changes');
        });
        current.on('PlaybackInfoChanged', (ev) => {
            const controls = current.getPlaybackInfo()?.controls;
            if (!controls) return;
            mediaService.broadcastPause(!controls.isPauseEnabled);
        });
    },
    async broadcastInfo() {
        const current = await getCurrentSession();
        if (!current) return;
        const info = await get(current, "tryGetMediaPropertiesAsync");
        websocket.emit("media:info", {
            title: info.title,
            author: info.artist
        });
    },
    async broadcastPause(paused: boolean) {
        websocket.emit("media:paused", paused);
    },
    async onSocketJoin() {
        mediaService.broadcastInfo();
        
        const current = await getCurrentSession();
        const controls = current?.getPlaybackInfo()?.controls;
        if (!controls) return;
        mediaService.broadcastPause(!controls.isPauseEnabled);
    },
    // async getCurrent() {
    //     const current = await getCurrentSession();
    //     const info = await get(current, "tryGetMediaPropertiesAsync");
    //     console.log('--ppp',current.getPlaybackInfo().controls.isPauseEnabled);
    //     return {
    //         title: info.title,
    //         author: info.artist,
    //         preview: info.thumbnail
    //     };
    // },
    async pause() {
        const sessions = await requestAsync();
        const current = sessions.getCurrentSession();
        current.tryPauseAsync(_);
    },
    async resume() {
        const sessions = await requestAsync();
        const current = sessions.getCurrentSession();
        current.tryPlayAsync(_);
    },
    async next() {
        const sessions = await requestAsync();
        const current = sessions.getCurrentSession();
        current.trySkipNextAsync(_);
    },
    async prev() {
        const sessions = await requestAsync();
        const current = sessions.getCurrentSession();
        current.trySkipPreviousAsync(_);
    },
}

export default mediaService;