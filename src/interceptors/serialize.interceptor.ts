import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToClass } from "class-transformer";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function Seralize(dto: any) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {

    constructor( private dto: any) {}

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any>  {
        
        // console.log('im running before the handler ' , context)

        return handler.handle().pipe(
            map((data: any) => {
                // console.log('im runnung before res is sent out', data)
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true
                })
            } )
        )
    }
}