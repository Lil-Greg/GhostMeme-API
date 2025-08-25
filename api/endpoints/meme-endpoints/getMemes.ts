import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";

/**
 * /memes (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-get
 */
export function memesGetEndpoint(next) {
  app.get(baseUrl + "/memes{:after}", (req, res) => {
    const after = req.params["after"];

    // Checking if after is not a number
    if (after.length > 0 && typeof parseInt(after) !== "number") {
      res.status(404).json({
        success: false,
        error: "after must be a number (but obvi in a string)",
      });
    }

    const rangeFrom = after.length === 0 ? 0 : parseInt(after);
    const rangeTo = rangeFrom + 99;

    const data = supabase.from("Memes").select().range(rangeFrom, rangeTo);
    res.json({ success: true, memes: data });
  });

  next();
}
