import { NextFunction } from "express";
import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";
import { MemePost } from "../../../libs/types/memeTypes";

/**
 * /memes (POST)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-post
 *  */
export function memesPostEndpoint(res, req, next: NextFunction) {
  app.post(`${baseUrl}/memes`, async (req, res) => {
    if (!req.body) {
      res.status(400).send("Gimme Some Data Insert");
      next();
      return;
    }
    const nonnullable = ["owner", "expiredAt", "private"];
    // True if the private is a boolean
    const privateExists = !req.body.private
      ? false // if no property
      : typeof req.body.private === "boolean"
      ? true
      : req.body.private === "false" || req.body.private === "true"
      ? true
      : false;

    if (
      !req.body.owner
      //!req.body.expiredAt ||
      //!privateExists
    ) {
      console.log("Request Body from POST: ", req.body);

      const errorString = Object.entries(req.body)
        .map(([key, value], index, allVals) => {
          if (!nonnullable.includes(key)) return "";
          if (privateExists && key === "private") return "";

          return !value
            ? index + 1 !== allVals.length
              ? `${key}, `
              : `and ${key}.` // meaning the end
            : "";
        })
        .join("");

      res.status(400).json({
        success: false,
        error: `Missing required POST data: ${
          errorString.length === 0
            ? "All... There is no Form Data"
            : errorString
        }`,
      });
      next();
      return;
    }

    if (req.body.expiredAt)
      if (req.body.receiver === req.body.owner) {
        res.status(400).json({
          success: false,
          error: "The Receiver of the Meme cannot be the Owner of the Meme 🤓",
        });
        next();
        return;
      }

    const formData: MemePost = req.body;

    formData.expiredAt = new Intl.DateTimeFormat("en-us", {
      // month:"short",
      // day:"2-digit",
      // year:"numeric",
      dateStyle: "medium",
    }).format(new Date(formData.expiredAt));
    console.log("Expired At Form Data: ", formData.expiredAt);
    // Transforming private
    if (req.body.private === "false" || req.body.private === "true") {
      formData.private = Boolean(req.body.private);
    }

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
      .select();
    console.log("res Data in .then(): ", result);

    if (!result.data) {
      console.log("Meme Post Res: ", result);
      res.status(result.status).json({
        success: false,
        error: result.error.message,
      });
      return;
    }

    res
      .json({
        success: true,
        meme: result.data,
      })
      .status(201);
  });

  next();
}
