import {Config} from '../../core';

export const config = new Config<{quixUrl: string}>();
config.set({quixUrl: '/api/'});
