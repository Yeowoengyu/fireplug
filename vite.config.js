import {defineConfig} from 'vite';
import {geocodeMiddleware} from './server/geocode.mjs';
export default defineConfig({plugins:[{name:'fireplug-address-api',configureServer(server){server.middlewares.use(geocodeMiddleware);},configurePreviewServer(server){server.middlewares.use(geocodeMiddleware);}}]});
