import makeStore from './src/store';
import startServer from './src/server';

export const store = makeStore();
startServer(store);

console.log("Server is now running at http://127.0.0.1:8090/");