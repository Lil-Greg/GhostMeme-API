export type UserPost = {
  name: string;
  username: string;
  email: string;
  phone?: string;
  imageBase64?: string;
  key: string;
  salt: string;
};

export type UserType = {
  name: string;
  username: string;
  email: string;
  salt: string;
  user_id: number;
  friends: number;
  liked: number;
  deleted: boolean;
  phone: string | null;
  imageUrl: string | null;
};

type AllOrNone<T> = T | { [K in keyof T]?: undefined };

type SaltAndKey = AllOrNone<{ key: string; salt: string }>;

/**
 * Update User
 *
 * Defined Here: https://hscc6xt8cqqf.docs.apiary.io/#/reference/0/user-endpoints/users-user-id-put
 */
export type UserPut = {
  name?: string;
  username?: string;
  email?: string;
  phone?: null | string;
  imageBase64?: string | null;
} & SaltAndKey;
