import { IncomingMessage } from 'http';

/** https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction#request-body */
export const getIncomingMessageBody = async (
  req: IncomingMessage
): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  return body;
};
