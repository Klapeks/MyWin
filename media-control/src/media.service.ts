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

const InfoKeys: (keyof IWMC.GlobalSystemMediaTransportControlsSessionMediaProperties)[] = [
    'albumArtist', 'albumTitle', 'albumTrackCount', 'artist', 'genres', 'playbackType',
    'subtitle', 'thumbnail', 'title', 'trackNumber'
];

const mediaService = {
    async getCurrent() {
        const sessions = await requestAsync();
        const current = sessions.getCurrentSession();
        const info = await get(current, "tryGetMediaPropertiesAsync");
        current.on('MediaPropertiesChanged', (ev) => {
            console.log('media changes');
        })
        current.on('PlaybackInfoChanged', (ev) => {
            if (!current.getPlaybackInfo()?.controls) return;
            console.log('paused:',!current.getPlaybackInfo().controls.isPauseEnabled);
        })
        sessions.on('CurrentSessionChanged', async (ev) => {
            console.log('session changed', ev);
            const info = await get(current, "tryGetMediaPropertiesAsync");
            console.log("New Info:", info.title, '||',info.artist);
        })
        console.log('--ppp',current.getPlaybackInfo().controls.isPauseEnabled);
        return {
            title: info.title,
            author: info.artist,
            preview: info.thumbnail
        };
    }
}

export default mediaService;