import "dotenv/config"
import { BACKEND_URL, BACKEND_PORT } from "./config/env.js";
import {createApp} from "./app.js";

const app = createApp();

app.listen(BACKEND_PORT, () => console.log(`🚀 API running on ${BACKEND_URL}`));
