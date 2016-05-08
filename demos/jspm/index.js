import {hello} from './module';
import 'underscore';

if(typeof window !== 'undefined'){
    document.body.innerHTML = '<i style="font-size:5em;">Quoth the module:<br>“' + hello('BrisJS') + '”';
} else {
    console.log(hello('BrisJS'));
}
