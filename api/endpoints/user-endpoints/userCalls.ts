import { NextFunction, Request, Response } from "express";
import { supabase } from "../../supabase-init.ts";
import { app, baseUrl } from "../../index.ts";
import { slowDown } from "express-slow-down";
import { UserPost, UserPut, UserType } from "../../../libs/types/userTypes.ts";

/**
 * /users (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-get
 */
export function getUsers(req: Request, res: Response, next: NextFunction) {
  app.get(baseUrl + "/users", async (req, res) => {
    const { after } = req.query;

    // CHOOSING COLUMNS to get rid of key
    const cols =
      "name, username, email, phone, friends, liked, deleted, imageUrl, salt";

    const { data, error, status } = after
      ? await supabase
          .from("Users")
          .select(cols)
          .gt("user_id", parseInt(after.toString()))
          .limit(100)
      : await supabase.from("Users").select(cols).limit(100);

    if (error) {
      res
        .status(400)
        .send(JSON.stringify(error))
        .json({ success: false, error: error.message });
      next();
      return;
    }

    if (!data) {
      res.status(200).json({
        success: true,
        users: [],
      });
      next();
      return;
    }

    res.status(status).json({
      success: true,
      users: data,
    });

    next();
    return;
  });
}

/**
 * /users (POST)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-post
 */
export function postUsers(req: Request, res: Response, next: NextFunction) {
  app.post(baseUrl + "/users", async (req, res) => {
    // CHECKING FOR NULL DATA!!
    switch (req.body) {
      case !req.body.name:
        res.status(400).send("Name is required when creating a new user").json({
          success: false,
          error: "Name is required when creating a new user",
        });
        next();
        return;

      case !req.body.email:
        res
          .status(400)
          .send("Email is required when creating a new user")
          .json({
            success: false,
            error: "Email is required when creating a new user",
          });
        next();
        return;

      case !req.body.username:
        res
          .status(400)
          .send("Username is required when creating a new user")
          .json({
            success: false,
            error: "Username is required when creating a new user",
          });
        next();
        return;

      case !req.body.key || !req.body.salt:
        res
          .status(400)
          .send("Salt and Key are required when creating a new user")
          .json({
            success: false,
            error: "Salt and Key are required when creating a new user",
          });
        next();
        return;
    }

    const formData: UserPost = req.body;

    // CHOOSING COLUMNS to get rid of key
    const cols =
      "name, username, email, phone, friends, liked, deleted, imageUrl, salt";

    const { data, error, status } = await supabase
      .from("Users")
      .insert(formData)
      .select(cols);

    if (error) {
      res
        .status(status)
        .send(JSON.stringify(error))
        .json({
          success: false,
          error: `Cannot Insert into Database for this reason: ${error.message}`,
        });
      next();
      return;
    }

    /*
        It means that when you use the delete operator in TypeScript, the property you are trying to 
        delete should be marked as optional (?) in the type definition. This is because deleting a 
        required property would violate the type contract—after deletion, the object would no longer match its type.
    */

    res.status(status).json({
      success: true,
      user: data[0],
    });
    next();
    return;
  });
}

/**
 * /users/:user_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-get
 */
export function getByUserId(req: Request, res: Response, next: NextFunction) {
  app.get(baseUrl + "/users/:user_id", async (req, res) => {
    const { user_id } = req.params;

    // CHOOSING COLUMNS to get rid of key
    const cols =
      "name, username, email, phone, friends, liked, deleted, imageUrl, salt";

    const { data, error, status } = await supabase
      .from("Users")
      .select(cols)
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(JSON.stringify(error))
        .json({
          success: false,
          error: `Error fetching user by user_id: ${error.message}`,
        });

      next();
      return;
    }

    res.json({
      success: true,
      user: data[0],
    });
  });
}

/**
 * /users/:username (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-username-get
 */
export function getByUsername(req: Request, res: Response, next: NextFunction) {
  app.get(baseUrl + "/users/:username", async (req, res) => {
    const { username } = req.params;
    // CHOOSING COLUMNS to get rid of key
    const cols =
      "name, username, email, phone, friends, liked, deleted, imageUrl, salt";

    const { data, error, status } = await supabase
      .from("Users")
      .select(cols)
      .eq("username", username);

    if (error) {
      res
        .status(status)
        .send(JSON.stringify(error))
        .json({
          success: false,
          error: `Error fetching user by username: ${error.message}`,
        });

      next();
      return;
    }

    res.json({
      success: true,
      user: data[0],
    });
  });
}

/**
 * /users/:user_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-delete
 */
export function deleteByUserId(req, res, next: NextFunction) {
  app.delete(baseUrl + "/users/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const { error, status } = await supabase
      .from("Users")
      .update({ deleted: true })
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(JSON.stringify(error))
        .json({
          success: false,
          error: `Error deleting user_id: ${user_id}. Error: ${error.message}`,
        });
      next();
      return;
    }

    res.json({ success: true });
  });
}

/**
 * /users/:user_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-put
 */
export function putByUserId(req, res, next: NextFunction) {
  app.put(baseUrl + "/users/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const formData = req.body as UserPut;

    const { error, status } = await supabase
      .from("Users")
      .update(formData)
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(JSON.stringify(error))
        .json({
          success: false,
          error: `Error updating user information, Error: ${error.message}`,
        });
      next();
      return;
    }

    res.status(status).json({
      success: true,
    });
    next();
    return;
  });
}

/**
 * /users/:user_id/liked (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-liked-get
 */
export function getLikedMemesByUserId(req, res, next: NextFunction) {
  app.get(baseUrl + "/users/:user_id/liked", async (req, res) => {
    const { user_id } = req.params;
    const { afterQuery } = req.query;
    const after = afterQuery ? parseInt(afterQuery.toString()) : undefined;

    // CREATING NEW TABLE FOR USER LIKED STUFF TO GO INTO
    const { data, error, status } = await supabase
      .from("User_Likes")
      .select("meme_ids")
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(error)
        .json({
          success: false,
          error: `There was an error trying to get ${user_id} likes: ${error.message}`,
        });
      next();
      return;
    }

    // set results to after array stuff
    if (!data[0].meme_ids) {
      res.json({
        success: true,
        memes: [],
      });
      next();
      return;
    }
    const results = data[0].meme_ids.filter((meme_id) => {
      // if after then gimme the meme ids that're greater than it (after it)
      // if no after, then gimme the first 100 meme_ids
      // this'll work b/c meme_id is incremented
      return after ? meme_id > after : meme_id <= 100;
    });

    res.json({
      success: true,
      memes: results,
    });
    next();
    return;
  });
  /*
  
  THE FILTER IN THIS MAY NEED A REWORK!!!
  🤓🤓
  
  */
}

/**
 * /users/:user_id/liked/:meme_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-liked-meme-id-get
 */
export function getLikedMemeByUserId(req, res, next: NextFunction) {
  app.get(baseUrl + "/users/:user_id/liked/:meme_id", async (req, res) => {
    const { user_id, meme_id } = req.params;

    const { data, error, status } = await supabase
      .from("User_Likes")
      .select("meme_ids")
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(error)
        .json({
          success: false,
          error: `There was an error trying to check if the user: ${user_id}, has liked the meme: ${meme_id}. Error: ${error.message}`,
        });
      next();
      return;
    }
    // Check if the meme_id is in the array of liked memes
    // owned by this user
    if (
      data &&
      data[0].meme_ids &&
      data[0].meme_ids.includes(parseInt(meme_id))
    ) {
      res.status(200).json({ success: true });
      next();
      return;
    }
    res.status(404).json({ success: false });
    next();
    return;
  });
}

/**
 * /users/:user_id/friends (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-get
 */
export function getFriends(req, res, next: NextFunction) {
  app.get(baseUrl + "/users/:user_id/friends", async (req, res) => {
    const { user_id } = req.params;
    const { after } = req.query;
    // DO AFTER STUFF!!!!

    const { data, error, status } = await supabase
      .from("User_Friends")
      .select("user_id, friends")
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(
          `There was an error getting user: ${user_id} friends. Error: ${JSON.stringify(
            error
          )}`
        )
        .json({
          success: false,
          error: error.message,
        });
      next();
      return;
    }
    if (!data) {
      res.json({
        success: true,
        users: [],
      });
      next();
      return;
    }

    // DO AFTER STUFF!!!

    res.json({
      success: true,
      users: data[0].friends,
    });
    next();
    return;
  });
}

/**
 * /users/:user_id/friends/:friend_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-get
 */
export function getFriendByUserId(req, res, next: NextFunction) {
  app.get(baseUrl + "/users/:user_id/friends/:friend_id", async (req, res) => {
    const { user_id, friend_id } = req.params;

    const { data, error, status } = await supabase
      .from("User_Friends")
      .select("user_id, friends")
      .eq("user_id", parseInt(user_id));

    if (error) {
      res
        .status(status)
        .send(
          `There was an error trying to get user: ${user_id} friends. Error: ${JSON.stringify(
            error
          )}`
        )
        .json({ success: false, error: error.message });
      next();
      return;
    }
    if (!data) {
      res.status(404).json({
        success: false,
      });
      next();
      return;
    }

    if (!data[0].friends) {
      res
        .status(404)
        .send(`This user: ${user_id}, has no friends 🤣`)
        .json({ success: false });
      next();
      return;
    }

    // CHECKING FRIENDS ARRAY
    if (data[0].friends.includes(parseInt(friend_id))) {
      res.status(200).json({ success: true });
      next();
      return;
    }
    // USER (user_id) and Friend/other user (friend_id) are not friends.
    res.status(404).json({ success: false });
    next();
    return;
  });
}

/**
 * /users/:user_id/friends/:friend_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-delete
 */
export function deleteFriend(req, res, next: NextFunction) {
  app.delete(
    baseUrl + "/users/:user_id/friends/:friend_id",
    async (req, res) => {
      const { user_id, friend_id } = req.params;
    }
  );
}

/**
 * /users/:user_id/friends/:friend_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-put
 */
export function newFriend(req, res, next: NextFunction) {
  app.put(baseUrl + "/users/:user_id/friends/:friend_id", async (req, res) => {
    const { user_id, friend_id } = req.params;
  });
}

/**
 * /users/:user_id/requests/:request_type (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-get
 */
export function getFriendRequestType(req, res, next: NextFunction) {
  app.get(
    baseUrl + "/users/:user_id/requests/:request_type",
    async (req, res) => {
      const { user_id, request_type } = req.params;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type/:target_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-get
 */
export function getRequestByTarget(req, res, next: NextFunction) {
  app.get(
    baseUrl + "/users/:user_id/requests/:request_type/:target_id",
    async (req, res) => {
      const { user_id, request_type, target_id } = req.params;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type/:target_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-delete
 */
export function deleteFriendRequest(req, res, next: NextFunction) {
  app.delete(
    baseUrl + "/users/:user_id/requests/:request_type/:target_id",
    async (req, res) => {
      const { user_id, request_type, target_id } = req.params;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type/:target_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-put
 */
export function newFriendRequest(req, res, next: NextFunction) {
  app.put(
    baseUrl + "/users/user_id/requests/:request_type/:target_id",
    async (req, res) => {
      const { user_id, request_type, target_id } = req.params;
    }
  );
}
