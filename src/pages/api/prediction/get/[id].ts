// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  const id = req.query.id as string;
  const obj = await prisma.prediction.findFirst({
    where: { uuid: { equals: id } },
  });

  res.status(200).json(
    obj
      ? {
          ...obj,
          targetDateReached: obj.targetDate <= new Date(),
          password: "",
        }
      : {
          title: "¡Bienvenido a TeLoDije!",
          body: "Para crear una nueva predicción, haz click en el ícono en la esquina inferior derecha.",
          targetDate: new Date("4-1-1555"),
          targetDateReached: true,
          originDate: new Date("4-1-1555"),
          password: "",
          username: "",
        }
  );
}
