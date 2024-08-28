import prisma from '../../../lib/db.js';
import { decode, encode } from 'base-64';

export async function GET({ params }) {
  const decryptedId = decode(params.id);

  const poll = await prisma.poll.findUnique({
    where: { id: decryptedId }
  });

  if (!poll) {
    return new Response('Poll not found', { status: 404 });
  }

  // Encrypt poll.id again before returning
  const encryptedId = encode(poll.id.toString());

  const expirationTime = new Date(new Date(poll.createdAt).getTime() + 24 * 60 * 60 * 1000);

  // Create a new poll object with encrypted id
  const encryptedPoll = {
    ...poll,
    id: encryptedId,
    expirationTime: expirationTime.toISOString() // Convert to ISO string for easy handling on the frontend
  };

  return new Response(JSON.stringify(encryptedPoll), { status: 200 });
}