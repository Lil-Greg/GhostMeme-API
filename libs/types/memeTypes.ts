export interface Meme {
  owner: string;
  receiver: string | null;
  expiredAt: number | string;
  description: string | null;
  private: boolean;
  /**
   * The meme_id this meme replies to
   */
  replyTo: number | null;
  imageUrl: string | null;
  createdAt: string | Date | number;
  likes: number;
  meme_id: number;
}

export interface MemePost {
  owner: string;
  receiver: string | null;
  expiredAt: number | string;
  description: string | null;
  private: boolean;
  /**
   * The meme_id this meme replies to
   */
  replyTo: number | null;
  imageUrl: string | null;
  imageBase64: string | null;
}

export interface Likes {
  users: string[];
}
