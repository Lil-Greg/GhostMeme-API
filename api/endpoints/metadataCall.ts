import { app, baseUrl } from "../";
import { supabase } from "../supabase-init";

/**
 * /info (GET)
 *
 * https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/metadata-endpoints/info-get
 */

export function metadataInfoEndpoint() {
  app.get(baseUrl + "/info", async (req, res) => {
    const { count: totalMemes } = await supabase
      .from("Memes")
      .select("*", { count: "exact", head: true });
    const { count: totalUsers } = await supabase
      .from("Users")
      .select("*", { count: "exact", head: true });

    res
      .json({
        success: true,
        totalMemes: totalMemes ? totalMemes : 0,
        totalUsers: totalUsers ? totalUsers : 0,
      })
      .status(200);
    return;
  });
}
