import app from "./app.ts";
import { env } from "./config/env.ts";

// Entry point: app.ts is kept side-effect-free (no listen) so tests can import
// it with supertest without binding a port.
const server = app.listen(env.port, () => {
  console.log(`🚀 Phoenix API running on http://localhost:${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /health`);
  console.log(`     POST /api/auth/login`);
  console.log(`     GET  /api/exams`);
  console.log(`     POST /api/eligibility`);
  console.log(`     GET  /api/papers`);
  console.log(`     GET  /api/papers/:id`);
  console.log(`     GET  /api/papers/:id/quiz`);
  console.log(`     POST /api/papers/:id/score`);
  console.log(`     GET  /api/admin/audit   (admin only)`);
});

export default server;
