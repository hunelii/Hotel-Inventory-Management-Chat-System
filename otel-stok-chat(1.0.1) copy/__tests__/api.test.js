import { describe, expect, test, jest } from '@jest/globals';
import { POST } from '../app/api/query/route';

// Mock modülleri
jest.mock('../lib/mongodb');
jest.mock('../lib/gemini');
jest.mock('../lib/dataRetrieval');

describe('API route handler', () => {
test('returns 400 when query is empty', async () => {
 const req = {
   json: jest.fn().mockResolvedValue({})
 };
 
 const response = await POST(req);
 expect(response.status).toBe(400);
});
});
