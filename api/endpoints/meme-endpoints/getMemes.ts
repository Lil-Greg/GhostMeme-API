import { app, baseUrl } from "../..";
import { supabase } from "../../supabase-init";

/**
 * /memes (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-get
 */
export function memesGetEndpoint(req, res, next) {
  app.get(baseUrl + "/memes", async (req, res) => {
    const { after: afterQuery, match, regexMatch } = req.query;

    let after = "";
    if (afterQuery) {
      after = afterQuery.toString();
    }

    // TESTING::
    console.log("Here is the regexMatch: ", regexMatch);
    console.log("Here is the match: ", match);
    console.log("Here is the After string: ", after);

    // Checking if after is not a number
    if (after && after.length > 0 && typeof parseInt(after) !== "number") {
      res.status(404).json({
        success: false,
        error: "after must be a number (but obvi in a string)",
      });
    }

    const rangeFrom = after ? (after.length === 0 ? 0 : parseInt(after)) : 0;
    const rangeTo = rangeFrom + 99;

    const data = await supabase
      .from("Memes")
      .select()
      .range(rangeFrom, rangeTo);

    if (!data.data) {
      res.status(data.status).json({
        success: false,
        error: data.error.message,
      });
    }
    res.status(data.status).json({ success: true, memes: data.data });
  });

  next();
}
