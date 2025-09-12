import { supabase } from "../../supabase-init";

/**
 * /memes (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-get
 */
export function memesGetEndpoint(app, baseUrl) {
  app.get(baseUrl + "/memes", async (req, res, next) => {
    const { after: afterQuery } = req.query;

    let after = "";
    if (afterQuery) {
      after = afterQuery.toString();
    }

    // Checking if after is not a number
    if (after && after.length > 0 && typeof parseInt(after) !== "number") {
      res.status(404).json({
        success: false,
        error: "after must be a number (but obvi in a string)",
      });
    }

    // not going to use the range stuff because I can
    // simply do the gt method (which means greater than)
    // and limit the results to 100

    const { data, error, status } = after
      ? await supabase
          .from("Memes")
          .select()
          .gt("meme_id", parseInt(after))
          .limit(100)
      : await supabase.from("Memes").select().limit(100);

    if (!data) {
      res.status(status).json({
        success: false,
        error: error.message,
      });
    }
    res.status(status).json({ success: true, memes: data });

    next();
    return;
  });
}
