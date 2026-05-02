import { handleApiRequest } from '../../../server/index.js';

export default async function handler(request, response) {
  await handleApiRequest(request, response);
}
