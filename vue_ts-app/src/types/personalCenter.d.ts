declare interface userInfo {
  nickname: string;
  email: string;
  user_pic: string;
  username: string;
}
declare interface userinfoForm {
  username: string;
  nickname: string;
  email: string;
}
declare interface resetpass {
  old_password: string;
  password: string;
  repassword: string;
}
declare interface submitPass {
  user_id: number;
  old_password: string;
  password: string;
  repassword: string;
}
