import {get} from './util'


(async () => {
    let data = await get({
        url: 'api.fixer.io',
        path: '/latest',
        data: {
            base: 'CNY'
        }
    });
    
    console.log(data);
})();
