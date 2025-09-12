import { NextFunction, Request, Response } from "express";
import { supabase } from "../../supabase-init.ts";
import app, { baseUrl } from "../../index.ts";
import { slowDown } from "express-slow-down";

/**
 * /memes/:meme_id1/:meme_id2/.../:meme_idN (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-1-meme-id-2-meme-id-n-put
 */
export function memesIdsPutEndpoint(app, baseUrl) {
  // THere is a different way to do this defined in the
  // route configuration bs in the express js GitHub
  // https://github.com/pillarjs/path-to-regexp#unexpected--or-
  app.put(
    baseUrl + "/memes/:meme_id/*meme_ids",
    async (req: Request, res: Response, next: NextFunction) => {
      const { meme_id, meme_ids } = req.params;
      // The meme_ids is already split
      const memeIds = [meme_id, ...meme_ids];
      if (memeIds.includes("likes")) {
        next();
        return;
      }
      const lastMemeId = memeIds[memeIds.length - 1];

      if (!req.body.expiredAt) {
        res
          .status(400)
          .send("expiredAt must be Updated for this Endpoint")
          .json({
            success: false,
            error: "Expired At must be Updated for this Endpoint",
          });
        next();
        return;
      }

      const { data, error, status } = await supabase
        .from("Memes")
        .update({ expiredAt: req.body.expiredAt })
        .eq("meme_id", parseInt(lastMemeId))
        .select();

      // data is null when error has a value and vice versa
      if (error) {
        res
          .status(400)
          .send(
            `There was an updating the meme_id: ${meme_id}. Error: ${JSON.stringify(
              error
            )}`
          )
          .json({ success: false, error });
        next();
        return;
      }

      res.json({
        success: true,
        meme: data[0],
      });

      next();
      return;
    }
  );
}
/**
 * /memes/:meme_id/likes (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-likes-get
 */
export function memesIdLikesGetEndpoint(app, baseUrl) {
  app.get(
    baseUrl + "/memes/:meme_id/likes",
    async (req: Request, res: Response, next: NextFunction) => {
      const { meme_id } = req.params;
      const { after } = req.query;

      // if after is not a string.
      if (after && typeof after !== "string") {
        res
          .status(400)
          .send("After must be a string, it does not have to be uri encoded")
          .json({
            success: false,
            error: "After must be a string, it does not have to be uri encoded",
          });
        next();
        return;
      }

      const { data, error } = await supabase
        .from("Meme_Likes")
        .select()
        .eq("meme_id", parseInt(meme_id));

      if (error) {
        res
          .status(400)
          .send("Meme Id does not exist")
          .json({
            success: false,
            error: `Meme Id does not exist. Error from Supabase: ${JSON.stringify(
              error
            )}`,
          });
        next();
        return;
      }
      if (!data[0]) {
        res
          .status(400)
          .send("Meme Id exists, but corresponding Meme_Likes table does not")
          .json({
            success: false,
            error: `Meme Id exists, but corresponding Meme_Likes table does not. Error from Supabase: ${JSON.stringify(
              error
            )}`,
          });
        next();
        return;
      }

      // restrict the users array with the after thing. Probably use another array to save the results that are within the range

      res.status(200).json({ success: true, users: data[0].users });
      next();
      return;
    }
  );
}

/**
 * /memes/:meme_id/likes/:user_id (GET)
 *
 * Defined here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-likes-user-id-get
 */
export function memesIdLikesUserIdGetEndpoint(app, baseUrl) {
  // Since this exists, likes is most likely an array of user ids, but the likes
  // get endpoint returns the user ids of the users who have liked that meme
  app.get(
    baseUrl + "/memes/:meme_id/likes/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { meme_id, user_id } = req.params;

      const { data, error } = await supabase
        .from("Meme_Likes")
        .select()
        .eq("meme_id", parseInt(meme_id));

      if (error) {
        res.status(400).json({
          success: false,
          error: `meme_id does not exist in Meme_Likes tables. Error from supabase: ${JSON.stringify(
            error
          )}`,
        });
        next();
        return;
      }

      const usersArr = data[0].users;

      if (usersArr && usersArr.includes(parseInt(user_id))) {
        res.status(200).json({ success: true });
        next();
        return;
      }
      res.status(404).json({ success: false });
      next();
      return;
    }
  );
}

/**
 * /memes/:meme_id/likes/:user_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-likes-user-id-delete
 */
export function memesIdLikesUserIdDeleteEndpoint(app, baseUrl) {
  app.delete(
    baseUrl + "/memes/:meme_id/likes/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { meme_id, user_id } = req.params;

      // Getting the data in the table first, so I can
      // simply splice the users array and update it
      const { data, error } = await supabase
        .from("Meme_Likes")
        .select()
        .eq("meme_id", parseInt(meme_id));

      if (error) {
        res
          .status(400)
          .send("meme_id does not exist in Meme_Likes tables")
          .json({
            success: false,
            error: `meme_id does not exist in Meme_Likes tables. Error from supabase: ${JSON.stringify(
              error
            )}`,
          });
        next();
        return;
      }

      const usersArr = data[0].users;

      if (usersArr === null) {
        res.status(400).send("There are no users in this meme_id").json({
          success: false,
          error: "There are no users in this meme_id",
        });

        next();
        return;
      } else if (usersArr.includes(parseInt(user_id))) {
        usersArr.splice(usersArr.indexOf(parseInt(user_id)), 1);

        // UPDATE/DELETING THE USER_ID!!!
        await supabase
          .from("Meme_Likes")
          .update({ users: usersArr })
          .eq("meme_id", parseInt(meme_id));

        res.status(200).json({ success: true });
        next();
        return;
      }
      res
        .status(404)
        .send("User Id does not exist in Array")
        .json({ success: false });
    }
  );
}

/**
 * /memes/:meme_id/likes/:user_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-meme-id-likes-user-id-put
 */
export function memesIdLikesUserIdPutEndpoint(app, baseUrl) {
  app.put(
    baseUrl + "/memes/:meme_id/likes/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { meme_id, user_id } = req.params;

      // Getting the data in the table first, so I can
      // simply push the user_id into the users array and update it
      const { data, error } = await supabase
        .from("Meme_Likes")
        .select()
        .eq("meme_id", parseInt(meme_id));

      if (error) {
        res
          .status(400)
          .send("meme_id does not exist in Meme_Likes tables")
          .json({
            success: false,
            error: `meme_id does not exist in Meme_Likes tables. Error from supabase: ${JSON.stringify(
              error
            )}`,
          });
        next();
        return;
      }

      const usersArr = data[0].users || [];

      if (usersArr.includes(parseInt(user_id))) {
        res.status(400).json({
          success: false,
          error:
            "User Id already exists in users array. Therefore, the user has already liked this meme 🤓",
        });
        next();
        return;
      }
      usersArr.push(parseInt(user_id));

      // UPDATING USERS ARRAY!!!
      const { error: updateError, status: updateStatus } = await supabase
        .from("Meme_Likes")
        .update({ users: usersArr })
        .eq("meme_id", parseInt(meme_id));

      if (updateError) {
        res.status(updateStatus).json({
          success: false,
          error: `There was an error adding new likes to meme_id: ${meme_id}. Error: ${updateError.message}`,
          pgError: updateError,
        });
        next();
        return;
      }

      res.status(200).json({ success: true });

      next();
      return;
    }
  );
}

/**
 * /memes/search (GET)
 *
 * First escape regex with:
 * const escapeRegex = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 *
 * Then create an instance of the RegExp class
 * with the constructor arguments of: escapeRegex and "i"
 *
 * This looks like this:
 * const regex = new RegExp(escapeRegex, "i");
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-search-get
 */
export function memesSearchEndpoint(app, baseUrl) {
  app.get(
    baseUrl + "/memes/search",
    async (req: Request, res: Response, next: NextFunction) => {
      const { after, match: matchQuery, regexMatch: regexQuery } = req.query;

      const match = matchQuery
        ? JSON.parse(decodeURIComponent(matchQuery?.toString()))
        : null;
      const regexMatch = regexQuery
        ? JSON.parse(decodeURIComponent(regexQuery?.toString()))
        : null;
      // could make an object for each of the possible values of the match queries.
      // in this object, there will be checks outputted.

      // or I can simply go down the list, check if the key exists for that column,
      // if it does not, the value will be empty and it is free game, but
      // if it is not, then there will be some form of check in place.

      // for the createdAt, I can call an sql language that is defined in supabase over here
      // and input the createdAt variable inside it. This will make sure everything is
      // in the await and it is convenient. Or I can just do a filter.

      // TODO: Make in Supabase
      res.json({ success: true, message: "Setup" });
      next();
      return;
    }
  );
}

class MemeEndpoints {
  memesIdsGetEndpoint(next: NextFunction) {}
}
