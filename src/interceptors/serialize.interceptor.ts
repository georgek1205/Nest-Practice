import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { map, Observable } from "rxjs";

interface ClassCronstructor{
  new(...args: any[]): {}
}


export function Serialize(dto: ClassCronstructor){
  return UseInterceptors(new SerializeInterceptor(dto));
}



export class SerializeInterceptor implements NestInterceptor{
  constructor(private dto: any){
  }_
  intercept(context: ExecutionContext, handler: CallHandler) : Observable<any>{
    

    //data(User entity instance)를 JSON으로 변환하기전, interceptor가 하이잭해서 user dto instance에 맞춰서 user dto instance로 변환하면, nest가
    //그걸 받아서 JSON으로 변환해서 리턴.
    return handler.handle().pipe(
      map((data: any) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        })
      }),
    );
  }
}