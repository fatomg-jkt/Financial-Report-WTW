import { AccurateClient } from '../accurate/client.js';

try {
  const client = new AccurateClient();
  const result = await client.getApiTokenInfo();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
