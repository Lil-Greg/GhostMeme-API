import { NextFunction } from "express";
import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";

/**
 * /memes/:meme_id1/:meme_id2/.../:meme_idN (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-1-meme-id-2-meme-id-n-get
 */

export function getByMemeIds(next: NextFunction) {
  app.get(baseUrl + "/memes/:meme_id/*splat", async (req, res) => {
    // how can I get each meme id, get in order, and check them.

    const { meme_id, splat } = req.params;

    const memeIds = [meme_id, ...splat.split("/")];
    const result: Meme[] = [];

    for (let memeId of memeIds) {
      const { data } = await supabase
        .from("Memes")
        .select()
        .eq("meme_id", parseInt(memeId));

      if (!data) {
        res
          .status(404)
          .send(
            `There is an undefined meme_id within the path, potentially at position number ${
              result.length + 1
            }.`
          )
          .json({
            success: false,
            error: `There is an undefined meme_id within the path, potentially at position number ${
              result.length + 1
            }.`,
          });

        return;
      }
      result.push(...data);
    }
  });

  next();
}
