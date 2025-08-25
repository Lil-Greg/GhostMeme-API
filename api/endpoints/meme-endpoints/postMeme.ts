import { NextFunction } from "express";
import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";

/**
 * /memes (POST)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-post
 *  */
export function memesPostEndpoint(next: NextFunction) {
  app.post(`${baseUrl}/memes`, async (req, res) => {
    if (!req.body) {
      res.status(406).send("Gimme Some to Insert Data");
      next();
      return;
    }

    if (!req.body.owner || !req.body.expiredAt) {
      const nullable = [
        "receiver",
        "description",
        "replyTo",
        "imageUrl",
        "imageBase64",
      ];
      res.status(404).send(
        `Missing required POST data: ${Object.entries(req.body).map(
          ([key, value], index, allVals) => {
            if (nullable.includes(key)) return "";
            return !value
              ? index !== allVals.length
                ? `${value}, `
                : `${value}.`
              : "";
          }
        )}`
      );
      next();
      return;
    }

    const formData: MemePost = req.body;

    if (typeof formData.expiredAt === "number")
      formData.expiredAt = String(formData.expiredAt);

    const result = await supabase
      .from("Memes")
      .insert({
        owner: formData.owner,
        receiver: formData.receiver,
        expiredAt: formData.expiredAt,
        description: formData.description,
        private: formData.private,
        replyTo: formData.replyTo,
        imageUrl: formData.imageUrl || formData.imageBase64,
      })
      .select()
      .then((res) => res["data"]);

    if (!result) {
      res.status(404).send("Something is up with the Meme Post endpoint");
      next();
      return;
    }

    res
      .json({
        success: true,
        meme: result["data"],
      })
      .status(201);
  });

  next();
}
