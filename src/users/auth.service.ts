import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _script } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_script);

@Injectable()
export class AuthService{
  constructor(private usersService: UsersService){
  
  }

  async signup(email: string, password: string){
     const users = await this.usersService.find(email); 
      if(users.length){
        throw new BadRequestException('email is aleady being used');
      }
      //creating hash + salt
      const salt = randomBytes(8).toString('hex');

      const hash = (await scrypt(password, salt, 32)) as Buffer; //if not specified as Buffer, typescript thinks it is "unknown";

      const result = salt + "." + hash.toString('hex');

      //create user and save
      const user = await this.usersService.create(email, result);

      return user;
    }
  async signin(email: string, password: string){
    const [user] = await this.usersService.find(email);
    if(!user){
      throw new NotFoundException('user does not exsit')
    }

    const [salt, storedHash] = user.password.split('.');
    
    const hash = await scrypt(password, salt, 32) as Buffer;

    if(storedHash !== hash.toString('hex')){
      throw new BadRequestException('bad password')
    }
    return user;
  }
}