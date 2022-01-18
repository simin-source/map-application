// import { Loading } from '@/components/loading/Loading';
import Map from './map/Map';
import Search from '../src/components/search/search';
// import Room from './pages/Room';

// tslint:disable-next-line
if (['dev', 'test'].includes(import.meta.env.MODE)) {
    import('eruda').then(result => {
        result.default.init();
    });
}

const ID = window.location.hash.split('#/')[1];

// Loading.show('#ffffff');
export default () => {
    return <Map />;
};

// export const mapID = ID ? ID : '155109'; //岱山县
export const mapID = ID ? ID : '195118P'; //太古汇
// export const mapID = ID ? ID : '160110M';   //银泰
// export const mapID = ID ? ID : '167112M';

// tslint:disable-next-line
// export const dataURL = ['dev', 'test'].includes(import.meta.env.MODE) ? 'https://tst-data.centmap.com:8443/mapres/' : 'https://data.centmap.com/mapres/';
export const dataURL = ['dev', 'test'].includes(import.meta.env.MODE) ? 'https://tst-data.centmap.com:8443/mapres/' : 'https://tst-data.centmap.com:8443/mapres/';