// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  const id = crypto.randomUUID();
  await prisma.prediction.create({
    data: {
      body: req.body.body,
      username: req.body.username,
      title: req.body.title,
      targetDate: req.body.targetDate,
      uuid: id,
      originDate: new Date(),
    },
  });
  res.status(200).json({ id });
}
