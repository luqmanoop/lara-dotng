export interface TweetObj {
  created_at: string;
  id: number;
  id_str: string;
  text: string;
  in_reply_to_status_id_str: string;
  in_reply_to_screen_name: string;
  user: {
    id: number;
    id_str: string;
    screen_name: string;
  };
}
