import { NextFunction, Request, Response } from "express";
import { supabase } from "../../supabase-init.ts";
import { app, baseUrl } from "../../index.ts";
import { slowDown } from "express-slow-down";
import { UserPost, UserPut, UserType } from "../../../libs/types/userTypes.ts";

// CHOOSING COLUMNS to get rid of key
const cols =
  "name, username, email, phone, friends, liked, deleted, imageUrl, salt, user_id";

/**
 * /users (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-get
 */
export function getUsers(app, baseUrl) {
  app.get(
    baseUrl + "/users",
    async (req: Request, res: Response, next: NextFunction) => {
      const { after } = req.query;

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
    }
  );
}

/**
 * /users (POST)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-post
 */
export function postUsers(app, baseUrl) {
  app.post(
    baseUrl + "/users",
    async (req: Request, res: Response, next: NextFunction) => {
      // CHECKING FOR NULL DATA!!
      switch (req.body) {
        case !req.body.name:
          res
            .status(400)
            .send("Name is required when creating a new user")
            .json({
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
    }
  );
}

/**
 * /users/:user_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-get
 */
export function getByUserId(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:username (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-username-get
 */
export function getByUsername(app, baseUrl) {
  app.get(
    baseUrl + "/users/:username",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-delete
 */
export function deleteByUserId(app, baseUrl) {
  app.delete(
    baseUrl + "/users/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-put
 */
export function putByUserId(app, baseUrl) {
  app.put(
    baseUrl + "/users/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id/liked (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-liked-get
 */
export function getLikedMemesByUserId(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/liked",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
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
export function getLikedMemeByUserId(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/liked/:meme_id",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id/friends (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-get
 */
export function getFriends(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/friends",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id/friends/:friend_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-get
 */
export function getFriendByUserId(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/friends/:friend_id",
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );
}

/**
 * /users/:user_id/friends/:friend_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-delete
 */
export function deleteFriend(app, baseUrl) {
  app.delete(
    baseUrl + "/users/:user_id/friends/:friend_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, friend_id } = req.params;

      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("friends, user_id")
        .eq("user_id", parseInt(user_id));

      if (error) {
        // error stuff
        res
          .status(status)
          .send(
            `User (${user_id}) does not exist. Error: ${JSON.stringify(error)}`
          )
          .json({ success: false, error: error });
        next();
        return;
      }
      if (!data) {
        res.status(400).json({
          success: false,
          error: `Friend does not exist in user: ${user_id} friends list`,
        });
        next();
        return;
      }
      if (!data[0].friends) {
        res.status(400).json({
          success: false,
          error: "There are no friends already",
        });
        next();
        return;
      }

      // specific friend's (by friend_id) index
      const specFriend = data[0].friends.indexOf(parseInt(friend_id));
      if (specFriend === -1) {
        res.status(400).json({
          success: false,
          error: `Friend (${friend_id} does not exist in this user's (${user_id}) friend list)`,
        });
        next();
        return;
      }

      data[0].friends.splice(specFriend, 1);
      const { error: updateError, status: updateStatus } = await supabase
        .from("User_Friends")
        .update({ friends: data[0].friends })
        .eq("user_id", parseInt(user_id));
      if (updateError) {
        // error stuff again
        res
          .status(updateStatus)
          .send(
            `Update to table resulted in error. Error: ${JSON.stringify(
              updateError
            )}`
          )
          .json({ success: false, error: updateError });
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
 * /users/:user_id/friends/:friend_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-friends-friend-id-put
 */
export function newFriend(app, baseUrl) {
  app.put(
    baseUrl + "/users/:user_id/friends/:friend_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, friend_id } = req.params;
      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("user_id, friends")
        .eq("user_id", parseInt(user_id));

      if (error) {
        // ERROR STUFF!!!
        res
          .status(status)
          .send(
            `Getting user (user_id: ${user_id}) resulted in error. Error: ${JSON.stringify(
              error
            )}`
          )
          .json({ success: false, error });

        next();
        return;
      }

      if (!data[0].friends) {
        const { error: updateError, status: updateStatus } = await supabase
          .from("User_Friends")
          .update({ friends: [parseInt(friend_id)] })
          .eq("user_id", parseInt(user_id));

        if (updateError) {
          // UPDATE ERROR
          res.status(updateStatus).json({
            success: false,
            error: updateError,
            message: `Updating User (user_id: ${user_id}) resulted in error. Error: ${updateError.message}`,
          });
          next();
          return;
        }
        // returning successful!!!
        res.status(200).json({ success: true });
        next();
        return;
      }

      // if friend_id already exists
      if (data[0].friends.includes(parseInt(friend_id))) {
        res.status(400).json({
          success: false,
          error: `Friend (id: ${friend_id}) already exists in user's (id: ${user_id}) friend list.`,
        });
        next();
        return;
      }
      if (friend_id === user_id) {
        res.status(400).json({
          success: false,
          error: `A User cannot friend themselves 😔`,
        });
        next();
        return;
      }

      // IF THERE IS DATA.FRIENDS
      data[0].friends.push(parseInt(friend_id));

      const { error: updateError, status: updateStatus } = await supabase
        .from("User_Friends")
        .update({ friends: data[0].friends })
        .eq("user_id", parseInt(user_id));

      if (updateError) {
        // UPDATE ERROR AGAIN
        res.status(updateStatus).json({
          success: false,
          error: updateError,
          message: `Updating User (user_id: ${user_id}) resulted in error. Error: ${JSON.stringify(
            error
          )}`,
        });
        next();
        return;
      }

      res.json({ success: true });
      next();
      return;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-get
 */
export function getFriendRequestType(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/requests/:request_type",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, request_type } = req.params;
      const { after } = req.query;

      // checking request type, if it is not equal to either incoming or outgoing then
      // return this error.
      if (request_type !== "incoming" && request_type !== "outgoing") {
        res
          .status(400)
          .send(
            `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`
          )
          .json({
            success: false,
            error: `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`,
          });

        next();
        return;
      }

      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("incoming_req, outgoing_req, user_id")
        .eq("user_id", parseInt(user_id));

      if (error) {
        res
          .status(status)
          .send(
            `There was an error getting the ${request_type} requests. Error: ${JSON.stringify(
              error
            )}`
          )
          .json({ success: false, error });

        next();
        return;
      }

      const requestArr =
        request_type === "incoming"
          ? data[0].incoming_req
          : data[0].outgoing_req;

      // AFTER STUFF!!!!
      res.json({ success: true, users: requestArr || [] });
      next();
      return;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type/:target_id (GET)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-get
 */
export function getRequestByTarget(app, baseUrl) {
  app.get(
    baseUrl + "/users/:user_id/requests/:request_type/:target_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, request_type, target_id } = req.params;

      // checking request type, if it is not equal to either incoming or outgoing then
      // return this error.
      if (request_type !== "incoming" && request_type !== "outgoing") {
        res.status(400).json({
          success: false,
          error: `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`,
        });

        next();
        return;
      }

      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("incoming_req, outgoing_req, user_id")
        .eq("user_id", parseInt(user_id));

      if (error) {
        res.status(status).json({
          success: false,
          error: `There was an error getting the ${request_type} requests. Error: ${error.message}`,
          pgError: error,
        });

        next();
        return;
      }

      const requestArr =
        request_type === "incoming"
          ? data[0].incoming_req
          : data[0].outgoing_req;

      if (requestArr === null) {
        res.json({
          success: false,
          error: `There are no users within the request field (${request_type}) of ${user_id}.`,
        });
        next();
        return;
      }

      const target = requestArr.filter((user) => user === parseInt(target_id));

      if (target.length === 0) {
        res.json({
          success: false,
          error: `${target_id} does not exist in ${user_id}'s ${request_type} requests`,
        });
        next();
        return;
      }

      res.json({ success: true });
      next();
      return;
    }
  );
}

/**
 * /users/:user_id/requests/:request_type/:target_id (DELETE)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-delete
 */
export function deleteFriendRequest(app, baseUrl) {
  app.delete(
    baseUrl + "/users/:user_id/requests/:request_type/:target_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, request_type, target_id } = req.params;

      // checking request type, if it is not equal to either incoming or outgoing then
      // return this error.
      if (request_type !== "incoming" && request_type !== "outgoing") {
        res
          .status(400)
          .send(
            `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`
          )
          .json({
            success: false,
            error: `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`,
          });

        next();
        return;
      }

      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("incoming_req, outgoing_req, user_id")
        .eq("user_id", parseInt(user_id));

      if (error) {
        res
          .status(status)
          .send(
            `There was an error getting the ${request_type} requests. Error: ${JSON.stringify(
              error
            )}`
          )
          .json({ success: false, error });

        next();
        return;
      }

      const requestArr =
        request_type === "incoming"
          ? data[0].incoming_req
          : data[0].outgoing_req;

      if (requestArr === null) {
        res
          .send(
            `There are no users within the request field (${request_type}) of ${user_id}.`
          )
          .json({ success: false });
        next();
        return;
      }

      const target = requestArr.indexOf(parseInt(target_id));

      if (target === -1) {
        res
          .send(
            `${target_id} does not exist in ${user_id}'s ${request_type} requests`
          )
          .json({ success: false });
        next();
        return;
      }

      requestArr.splice(target, 1);
      const { error: updateError, status: updateStatus } = await supabase
        .from("User_Friends")
        .update({ [`${request_type}_req`]: requestArr })
        .eq("user_id", parseInt(user_id));

      if (updateError) {
        res
          .status(updateStatus)
          .send(
            `There was an error deleting ${target_id} from ${user_id}'s ${request_type} requests. Error: ${updateError}`
          )
          .json({ success: false, error: updateError });

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
 * /users/:user_id/requests/:request_type/:target_id (PUT)
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-requests-request-type-target-id-put
 */
export function newFriendRequest(app, baseUrl) {
  app.put(
    baseUrl + "/users/:user_id/requests/:request_type/:target_id",
    async (req: Request, res: Response, next: NextFunction) => {
      const { user_id, request_type, target_id } = req.params;

      // checking request type, if it is not equal to either incoming or outgoing then
      // return this error.
      if (request_type !== "incoming" && request_type !== "outgoing") {
        res.status(400).json({
          success: false,
          error: `Request type of: ${request_type} is false. Can only be 'incoming' or 'outgoing'`,
        });

        next();
        return;
      }

      const { data, error, status } = await supabase
        .from("User_Friends")
        .select("incoming_req, outgoing_req, user_id")
        .eq("user_id", parseInt(user_id));
      // .eq("user_id", parseInt(target_id));

      if (error) {
        res.status(status).json({
          success: false,
          error: `There was an error getting the ${request_type} requests. Error: ${error.message}`,
          pgError: error,
        });

        next();
        return;
      }

      // FILTERING DATA!
      // const targetData = data.filter(
      //   (user) => user.user_id === parseInt(target_id)
      // );
      // const userData = data.filter(
      //   (user) => user.user_id === parseInt(user_id)
      // );

      const requestArr =
        request_type === "incoming"
          ? data[0].incoming_req
          : data[0].outgoing_req;

      if (requestArr === null) {
        // for current user logged in
        const { error: updateError, status: updateStatus } = await supabase
          .from("User_Friends")
          .update({ [`${request_type}_req`]: [parseInt(target_id)] })
          .eq("user_id", parseInt(user_id));

        if (updateError) {
          res.status(updateStatus).json({
            success: false,
            error: `There was an error with adding ${target_id} to ${user_id}'s ${request_type} requests. Error: ${updateError.message}`,
            pgError: updateError,
          });

          next();
          return;
        }

        // for the target/friend
        // COMMENTING OUT B/C THIS HAPPENS IN CLIENT
        // const { error: updateFriendError, status: updateFriendStatus } =
        //   await supabase
        //     .from("User_Friends")
        //     .update({ incoming_req: [parseInt(user_id)] })
        //     .eq("user_id", parseInt(target_id));
        // if (updateFriendError) {
        //   res.status(updateFriendStatus).json({
        //     success: false,
        //     error: `There was an error giving the target an ${request_type} friend request.`,
        //     pgError: updateFriendError,
        //   });
        //   next();
        //   return;
        // }

        res.status(200).json({ success: true });
        next();
        return;
      }

      const target = requestArr.indexOf(parseInt(target_id));

      if (target !== -1) {
        res.json({
          success: false,
          error: `target already exists in user's ${request_type} requests`,
        });
        next();
        return;
      }

      // IF THERE ARE ALREADY OUTGOING REQUESTS for the
      // currently logged in user.
      // This would be implemented if the API docs did not explicitly
      // say that requests were to be made for each user.
      requestArr.push(parseInt(target_id));

      const { error: updateError, status: updateStatus } = await supabase
        .from("User_Friends")
        .update({ [`${request_type}_req`]: requestArr })
        .eq("user_id", parseInt(user_id));

      if (updateError) {
        res.status(updateStatus).json({
          success: false,
          error: `There was an error with adding target/friend (id: ${target_id}) to the user's (id: ${user_id}) outgoing requests. Error: ${updateError.message}`,
          pgError: updateError,
        });

        next();
        return;
      }

      // for the target/friend
      // COMMENTING OUT B/C THIS HAPPENS IN CLIENT
      // const { error: updateFriendError, status: updateFriendStatus } =
      //   await supabase
      //     .from("User_Friends")
      //     .update({ incoming_req: [parseInt(user_id)] })
      //     .eq("user_id", parseInt(target_id));
      // if (updateFriendError) {
      //   res.status(updateFriendStatus).json({
      //     success: false,
      //     error: `There was an error giving the target an incoming friend request.`,
      //     pgError: updateFriendError,
      //   });
      //   next();
      //   return;
      // }
      res.status(200).json({ success: true });
      next();
      return;
    }
  );
}

export function postAuthPassword(app, baseUrl) {
  app.post(
    baseUrl + "/users/:username/auth",
    async (req: Request, res: Response, next: NextFunction) => {
      const { username } = req.params;

      if (!req.body) {
        res
          .status(400)
          .send(
            `To authenticate, request must have a body that has the user's key. This key is received from the deriveKeyFromPassword function.`
          )
          .json({
            success: false,
            error: `To authenticate, request must have a body that has the user's key. This key is received from the deriveKeyFromPassword function.`,
          });

        next();
        return;
      }

      const { error, status } = await supabase
        .from("Users")
        .select(cols)
        .eq("username", username)
        .eq("key", req.body.key);

      if (status === 404) {
        res
          .status(status)
          .send(`Password does not match this user's (${username})`)
          .json({ success: false });

        next();
        return;
      } else if (error) {
        res
          .status(status)
          .send(
            `There was an error getting this user (${username}). Error: ${JSON.stringify(
              error
            )}`
          )
          .json({ success: false, error });

        next();
        return;
      }

      res.json({ success: true });
      next();
      return;
    }
  );
}
