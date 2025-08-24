import { NextFunction, Request, Response } from "express";
import { supabase } from "../../supabase-init";

// /memes (GET) https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-get
export function memesGetEndpoint(req: Request, res: Response, next: NextFunction) {
    const after = req.params["after"];

    // Checking if after is not a number
    if (after.length > 0 && typeof parseInt(after) !== "number") {
        res.status(404).json({ success: false, error: "after must be a number (but obvi in a string)" });
    };

    const rangeFrom = after.length === 0 ? 0 : parseInt(after);
    const rangeTo = rangeFrom + 99;

    const data = supabase.from("Memes")
        .select()
        .range(rangeFrom, rangeTo);
}

// /memes (POST) https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/meme-endpoints/memes-post
export function memesPostEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdsGetEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdsPutEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdLikesGetEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdLikesUserIdGetEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdLikesUserIdDeleteEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesIdLikesUserIdPutEndpoint(req: Request, res: Response, next: NextFunction) {

}

export function memesSearchEndpoint(req: Request, res: Response, next: NextFunction) {

}