import mediaService from "./media.service";
import utils from './utils';

async function start() {
    const info = await mediaService.getCurrent();
    console.log("Current info:", info);

    await utils.timeout(3000000);
}


start();