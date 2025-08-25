interface Meme {
    owner: number;
    receiver: number | null;
    expiredAt: number | string;
    description: string | null;
    private: boolean;
    /**
     * The meme id this meme replies to
     */
    replyTo: number | null;
    imageUrl: string | null;
}

interface MemePost extends Meme{
    imageBase64:string |null;
}
