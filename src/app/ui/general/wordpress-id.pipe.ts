import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wordpressId'
})
export class WordpressIdPipe implements PipeTransform {

    transform(id: string | number) {
        return id ? "Published" : "";
    }

}
