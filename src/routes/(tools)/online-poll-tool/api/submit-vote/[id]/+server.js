import prisma from '../../../lib/db.js';
import { decode } from 'base-64';

export async function POST({ params, request }) {
  const { option } = await request.json();

  const decryptedId = decode(params.id);

  const poll = await prisma.poll.update({
    where: { id: decryptedId },
    data: {
      votes: {
        push: option
      }
    }
  });

  return new Response(null, { status: 200 });
}